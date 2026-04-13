import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { generateToken, setUserAuthCookie } from '@/lib/auth';
import { ensureUserInviteCode } from '@/lib/referrals';
import { checkRateLimit, createRateLimitResponse, getClientIdentifier } from '@/lib/rateLimit';
import { normalizePhone, OTP_LENGTH, sanitizeText, timingSafeEqualStrings } from '@/lib/validation';

export async function POST(req) {
  try {
    const body = await req.json();
    const phone = normalizePhone(body.phone);
    const otp = body.otp?.toString().trim();
    const referralCode = sanitizeText(body.referralCode, { maxLength: 40, allowEmpty: false }) || null;

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: 'Phone number and OTP are required' }),
        { status: 400 }
      );
    }

    if (!/^\d+$/.test(otp) || otp.length !== OTP_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Please enter a valid ${OTP_LENGTH}-digit OTP` }),
        { status: 400 }
      );
    }

    const rateLimit = checkRateLimit(`otp-verify:${getClientIdentifier(req)}:${phone}`, {
      windowMs: 5 * 60 * 1000,
      max: 5,
    });

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit, 'Too many OTP attempts. Please try again later.');
    }

    const user = await prisma.user.findUnique({
      where: { mobile: phone },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid OTP' }),
        { status: 401 }
      );
    }

    const storedOtp = user.otp?.toString().trim();
    const otpMatches = storedOtp?.startsWith('$2')
      ? await bcrypt.compare(otp, storedOtp)
      : timingSafeEqualStrings(storedOtp, otp);

    if (!storedOtp || !otpMatches) {
      return new Response(
        JSON.stringify({ error: 'Invalid OTP' }),
        { status: 401 }
      );
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return new Response(
        JSON.stringify({ error: 'OTP expired' }),
        { status: 401 }
      );
    }

    const token = generateToken(user);

    const wallet = await prisma.$transaction(async (tx) => {
      await ensureUserInviteCode(tx, user.id);

      const existingWallet = await tx.wallet.findUnique({
        where: { userId: user.id },
      });

      let referredById = user.referredById || null;

      if (!existingWallet && !referredById && referralCode) {
        const referrer = await tx.user.findUnique({
          where: { inviteCode: referralCode },
          select: { id: true },
        });

        if (referrer && referrer.id !== user.id) {
          referredById = referrer.id;
        }
      }

      await tx.user.update({
        where: { mobile: phone },
        data: {
          otp: null,
          otpExpiry: null,
          ...(referredById && !user.referredById
            ? {
                referredById,
                referredAt: new Date(),
              }
            : {}),
        },
      });

      if (existingWallet) {
        return existingWallet;
      }

      return tx.wallet.create({
        data: {
          userId: user.id,
          usdtAvailable: 0,
          usdtLocked: 0,
          usdtDeposited: 0,
          usdtWithdrawn: 0,
        },
      });
    });

    const redirectTo = '/home';

    const response = NextResponse.json(
      {
        token,
        redirectTo,
        message: 'OTP verified successfully',
        wallet,
      },
      { status: 200 }
    );

    setUserAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500 }
    );
  }
}