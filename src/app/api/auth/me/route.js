import { getCurrentUser } from '@/lib/auth';
import prisma  from '@/lib/prisma';

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
      usdtDeposited: 0,
      usdtWithdrawn: 0,
    };

    // Calculate pending stats
    const sellPendingTx = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId: user.id,
        type: { in: ['SELL', 'WITHDRAW'] },
        status: 'PENDING',
      },
    });

    const depositPendingTx = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: {
        userId: user.id,
        type: 'DEPOSIT',
        status: 'PENDING',
      },
    });

    const sellPending = sellPendingTx._sum.amount || 0;
    const depositPending = depositPendingTx._sum.amount || 0;

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          mobile: user.mobile,
          wallet: {
            total: wallet.usdtDeposited,
            available: wallet.usdtAvailable,
            withdrawn: wallet.usdtWithdrawn,
            progressing: sellPending + depositPending,
            sellPending: sellPending,
            depositPending: depositPending,
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
