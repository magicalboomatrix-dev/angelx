import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAdminCookie } from '@/app/lib/adminAuth';

export async function GET(request) {
  const auth = verifyAdminCookie(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [userCount, pendingDeposits, pendingSells, recentTxns] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.count({
        where: {
          type: 'DEPOSIT',
          status: 'PENDING',
        },
      }),
      prisma.transaction.count({
        where: {
          type: 'SELL',
          status: 'PENDING',
        },
      }),
      prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { fullName: true, email: true } } },
      }),
    ]);

    return NextResponse.json({
      users: userCount,
      deposits: pendingDeposits,
      sells: pendingSells,
      recentActivity: recentTxns,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
