import { getCurrentUser } from '@/lib/auth';
import prisma  from '@/lib/prisma';
import { decimalToNumber, serializeWallet } from '@/lib/serializers';

export async function GET(req) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // If wallet missing, fallback to zeros
    const wallet = user.wallet || {
      usdtAvailable: 0,
      usdtLocked: 0,
      usdtDeposited: 0,
      usdtWithdrawn: 0,
    };

    // Calculate pending stats
    const sellPendingTx = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId: user.id,
        type: 'DEPOSIT',
        status: 'PENDING',
      },
    });
    const serializedWallet = serializeWallet(wallet);
    const sellPending = serializedWallet?.usdtLocked || 0;
    const depositPending = decimalToNumber(sellPendingTx._sum.amount || 0);

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          mobile: user.mobile,
          wallet: {
            total: serializedWallet?.usdtDeposited || 0,
            available: serializedWallet?.usdtAvailable || 0,
            locked: serializedWallet?.usdtLocked || 0,
            withdrawn: serializedWallet?.usdtWithdrawn || 0,
            progressing: sellPending + depositPending,
            sellPending,
            depositPending,
          },
        },
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Error fetching user:', err);
    return new Response(
      JSON.stringify({ error: 'Server error' }),
      { status: 500 }
    );
  }
}
