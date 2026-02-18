// import prisma from '@/lib/prisma';
// import { generateToken } from '@/lib/auth';

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const email = body.email?.toString().trim();
//     const otp = body.otp?.toString().trim();

//     if (!email || !otp) {
//       return new Response(JSON.stringify({ error: 'Email and OTP are required' }), { status: 400 });
//     }

//     const user = await prisma.user.findUnique({ where: { email } });

//     if (!user) {
//       return new Response(JSON.stringify({ error: 'Invalid OTP' }), { status: 401 });
//     }

//     if (user.otp?.toString().trim() !== otp) {
//       return new Response(JSON.stringify({ error: 'Invalid OTP' }), { status: 401 });
//     }

//     if (!user.otpExpiry || user.otpExpiry < new Date()) {
//       return new Response(JSON.stringify({ error: 'OTP expired' }), { status: 401 });
//     }

//     const token = generateToken(user);

//     await prisma.user.update({
//       where: { email },
//       data: { otp: null, otpExpiry: null },
//     });

//     let wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
//     if (!wallet) {
//       wallet = await prisma.wallet.create({
//         data: {
//           userId: user.id,
//           usdtAvailable: 0,
//           usdtDeposited: 0,
//           usdtWithdrawn: 0,
//         },
//       });
//       console.log(`Wallet created for userId: ${user.id}`);
//     }

//     const redirectTo = user.fullName && user.mobile ? '/home' : '/complete-profile';

//     console.log(`User ${user.email} verified via OTP. Redirecting to ${redirectTo}`);

//     return new Response(
//       JSON.stringify({
//         token,
//         redirectTo,
//         message: 'OTP verified successfully',
//         wallet,
//       }),
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error('Error verifying OTP:', error);
//     return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
//   }
// }

import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const body = await req.json();
    const phone = body.phone?.toString().trim();
    const otp = body.otp?.toString().trim();

    if (!phone || !otp) {
      return new Response(
        JSON.stringify({ error: 'Phone number and OTP are required' }),
        { status: 400 }
      );
    }

    // 🇮🇳 Phone validation
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return new Response(
        JSON.stringify({ error: 'Invalid phone number' }),
        { status: 400 }
      );
    }

    // ✅ FIX: phone → mobile
    const user = await prisma.user.findUnique({
      where: { mobile: phone },
    });

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Invalid OTP' }),
        { status: 401 }
      );
    }

    if (!user.otp || user.otp.toString().trim() !== otp) {
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

    // 🔐 Generate JWT
    const token = generateToken(user);

    // 🧹 Clear OTP
    await prisma.user.update({
      where: { mobile: phone },
      data: {
        otp: null,
        otpExpiry: null,
      },
    });

    // 💰 Ensure wallet exists
    let wallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          usdtAvailable: 0,
          usdtDeposited: 0,
          usdtWithdrawn: 0,
        },
      });
    }

    // 🧭 Profile completeness
    const redirectTo =
      user.fullName && user.email ? '/home' : '/complete-profile';

    console.log(
      `User ${user.mobile} verified via OTP. Redirecting to ${redirectTo}`
    );

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
    console.error('❌ Error verifying OTP:', error);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500 }
    );
  }
}