import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { amount, walletId } = await request.json();

    if (!amount || !walletId) {
      return NextResponse.json(
        { error: 'Amount and wallet ID are required' },
        { status: 400 }
      );
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Check wallet exists and belongs to user
    const wallet = await prisma.cryptoWallet.findFirst({
      where: { id: walletId, userId }
    });

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Check user balance
    const userWallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!userWallet || userWallet.usdtAvailable < numAmount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Get settings for min withdraw
    const settings = await prisma.settings.findFirst();
    if (settings && numAmount < settings.withdrawMin) {
      return NextResponse.json(
        { error: `Minimum withdrawal amount is ${settings.withdrawMin} USDT` },
        { status: 400 }
      );
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        depositId: `SELL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'SELL',
        amount: numAmount,
        currency: 'USDT',
        network: wallet.network,
        address: wallet.address,
        status: 'PENDING',
        description: `Sell ${numAmount} USDT to ${wallet.network} address`
      }
    });

    // Update wallet balance (deduct available)
    await prisma.wallet.update({
      where: { userId },
      data: {
        usdtAvailable: { decrement: numAmount },
        usdtWithdrawn: { increment: numAmount }
      }
    });

    return NextResponse.json({
      message: 'Sell request submitted successfully',
      transaction
    });
  } catch (err) {
    console.error('Error processing sell request:', err);
    return NextResponse.json(
      { error: 'Failed to process sell request' },
      { status: 500 }
    );
  }
}