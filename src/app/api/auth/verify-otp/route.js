import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const body = await req.json();
    const email = body.email?.toString().trim();
    const otp = body.otp?.toString().trim();

    if (!email || !otp) {
      return new Response(JSON.stringify({ error: 'Email and OTP are required' }), { status: 400 });
    }

    // Find user in DB
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid OTP' }), { status: 401 });
    }

    // Compare trimmed strings to avoid whitespace/type issues
    if (user.otp?.toString().trim() !== otp) {
      return new Response(JSON.stringify({ error: 'Invalid OTP' }), { status: 401 });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return new Response(JSON.stringify({ error: 'OTP expired' }), { status: 401 });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Clear OTP
    await prisma.user.update({
      where: { email },
      data: { otp: null, otpExpiry: null },
    });

    // Ensure wallet exists
    let wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          usdtAvailable: 0,
          usdtDeposited: 0,
          usdtWithdrawn: 0,
        },
      });
      console.log(`Wallet created for userId: ${user.id}`);
    }

    // Redirect logic: if profile is complete (fullName and mobile) go to home, else complete profile
    const redirectTo = user.fullName && user.mobile ? '/home' : '/complete-profile';

    // Include wallet and token; helpful debug logs
    console.log(`User ${user.email} verified via OTP. Redirecting to ${redirectTo}`);

    return new Response(
      JSON.stringify({
        token,
        redirectTo,
        message: 'OTP verified successfully',
        wallet,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
}
