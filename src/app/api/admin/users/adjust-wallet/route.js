import { NextResponse } from 'next/server';
import prisma from '@/app/lib/prisma';
import { verifyAdminCookie } from '@/app/lib/adminAuth';

export async function POST(request) {
  const auth = verifyAdminCookie(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, amount, type, reason } = await request.json();

    if (!userId || !amount || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update wallet
    let newBalance;
    if (type === 'CREDIT') {
      newBalance = (user.wallet?.usdtAvailable || 0) + numAmount;
    } else {
      newBalance = (user.wallet?.usdtAvailable || 0) - numAmount;
    }

    // Create transaction record
    await prisma.$transaction([
      prisma.wallet.upsert({
        where: { userId: parseInt(userId) },
        create: {
          userId: parseInt(userId),
          usdtAvailable: newBalance,
          usdtDeposited: user.wallet?.usdtDeposited || 0,
          usdtWithdrawn: user.wallet?.usdtWithdrawn || 0
        },
        update: {
          usdtAvailable: newBalance
        }
      }),
      prisma.transaction.create({
        data: {
          userId: parseInt(userId),
          depositId: `ADJ-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          type: type === 'CREDIT' ? 'ADMIN_CREDIT' : 'ADMIN_DEBIT',
          amount: numAmount,
          currency: 'USDT',
          status: 'COMPLETED',
          description: reason || `Admin ${type} adjustment`
        }
      })
    ]);

    return NextResponse.json({ success: true, newBalance });
  } catch (error) {
    console.error('Wallet adjustment error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
