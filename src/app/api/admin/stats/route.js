import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAdminCookie } from '@/app/lib/adminAuth';
import { decimalToNumber, serializeTransactions } from '@/lib/serializers';

export async function GET(request) {
  const auth = verifyAdminCookie(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [userCount, totalDeposits, pendingDeposits, pendingSells, totalVolume, recentTxns] = await Promise.all([
      prisma.user.count(),
      prisma.transaction.count({
        where: {
          type: 'DEPOSIT',
          status: 'SUCCESS',
        },
      }),
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
      prisma.transaction.aggregate({
        _sum: { amount: true },
        where: {
          status: 'SUCCESS',
          type: { in: ['DEPOSIT', 'SELL', 'WITHDRAW', 'BUY'] },
        },
      }),
      prisma.transaction.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, mobile: true } } },
      }),
    ]);

    return NextResponse.json({
      users: userCount,
      totalDeposits,
      deposits: pendingDeposits,
      sells: pendingSells,
      totalVolume: decimalToNumber(totalVolume._sum.amount || 0),
      recentActivity: serializeTransactions(recentTxns),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
