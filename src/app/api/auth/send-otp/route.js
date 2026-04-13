import prisma from '@/lib/prisma';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { sendSms } from '@/lib/sms';
import { checkRateLimit, createRateLimitResponse, getClientIdentifier } from '@/lib/rateLimit';
import { normalizePhone, OTP_LENGTH } from '@/lib/validation';

const generateOtp = () => crypto.randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH).toString();
const isDevOtpBypassEnabled =
  process.env.NODE_ENV !== 'production' && process.env.ALLOW_DEV_OTP_BYPASS === 'true';

export async function POST(req) {
  try {
    const { phone } = await req.json();
    const normalizedPhone = normalizePhone(phone);

    if (!normalizedPhone) {
      return new Response(
        JSON.stringify({ error: 'Phone number is required' }),
        { status: 400 }
      );
    }

    const ipKey = `otp-send:${getClientIdentifier(req)}:${normalizedPhone}`;
    const rateLimit = checkRateLimit(ipKey, { windowMs: 5 * 60 * 1000, max: 5 });
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit, 'Too many OTP requests. Please try again later.');
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // Dev bypass — save and return immediately without sending SMS
    if (isDevOtpBypassEnabled) {
      const otpHash = await bcrypt.hash(otp, 10);
      await prisma.user.upsert({
        where: { mobile: normalizedPhone },
        update: { otp: otpHash, otpExpiry },
        create: { mobile: normalizedPhone, otp: otpHash, otpExpiry },
      });
      console.info(`[DEV OTP] phone=+91${normalizedPhone} otp=${otp}`);
      return new Response(
        JSON.stringify({ message: 'OTP generated in development mode', devOtp: otp }),
        { status: 200 }
      );
    }

    // Production: send SMS first — only persist if delivery succeeds.
    // This prevents a valid OTP hash sitting in DB when the user never received it.
    await sendSms(normalizedPhone, `Your AngelX OTP is: ${otp}. Valid for 5 minutes. Do not share it with anyone.`);

    const otpHash = await bcrypt.hash(otp, 10);
    await prisma.user.upsert({
      where: { mobile: normalizedPhone },
      update: { otp: otpHash, otpExpiry },
      create: { mobile: normalizedPhone, otp: otpHash, otpExpiry },
    });

    return new Response(
      JSON.stringify({ message: 'OTP sent to your phone' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Send OTP error:', error);

    if (['SMS_NOT_CONFIGURED','SMS_AUTH_FAILED','SMS_SEND_FAILED','SMS_NETWORK_ERROR'].includes(error?.code)) {
      return new Response(
        JSON.stringify({
          error: 'OTP service is temporarily unavailable',
          ...(process.env.NODE_ENV !== 'production' && error?.message
            ? { details: error.message }
            : {}),
        }),
        { status: error.status || 503 }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500 }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({ message: 'Use POST to send OTP' }),
    { status: 200 }
  );
}