import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getOrCreateSettings } from '@/lib/settings';
import { parsePositiveAmount, parsePositiveInt } from '@/lib/validation';
import { checkRateLimit, createRateLimitResponse, getClientIdentifier } from '@/lib/rateLimit';
import { createPendingSellRequest } from '@/lib/walletService';
import { serializeTransaction, serializeWallet } from '@/lib/serializers';

export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, walletId } = await request.json();
    const parsedWalletId = parsePositiveInt(walletId);
    const numAmount = parsePositiveAmount(amount);

    if (!numAmount || !parsedWalletId) {
      return NextResponse.json(
        { error: 'Amount and wallet ID are required' },
        { status: 400 }
      );
    }

    const wallet = await prisma.cryptoWallet.findFirst({
      where: { id: parsedWalletId, userId: user.id },
    });

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet not found' },
        { status: 404 }
      );
    }

    const settings = await getOrCreateSettings(prisma);
    if (numAmount < settings.withdrawMin) {
      return NextResponse.json(
        { error: `Minimum withdrawal amount is ${settings.withdrawMin} USDT` },
        { status: 400 }
      );
    }

    const rateLimit = checkRateLimit(`wallet-action:sell:${user.id}:${getClientIdentifier(request)}`, {
      windowMs: 60 * 1000,
      max: 3,
    });
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit, 'Too many wallet actions. Please try again in a minute.');
    }

    try {
      const result = await createPendingSellRequest({
        userId: user.id,
        amount: numAmount,
        network: wallet.network,
        address: wallet.address,
        description: `Sell ${numAmount} USDT to ${wallet.network} address`,
      });

      return NextResponse.json({
        message: 'Sell request submitted successfully',
        transaction: serializeTransaction(result.transaction),
        wallet: serializeWallet(result.wallet),
      });
    } catch (error) {
      const status = error.message === 'Insufficient balance' || error.message.includes('maximum number') ? 400 : 500;
      return NextResponse.json({ error: status === 500 ? 'Failed to process sell request' : error.message }, { status });
    }
  } catch (err) {
    console.error('Error processing sell request:', err);
    return NextResponse.json(
      { error: 'Failed to process sell request' },
      { status: 500 }
    );
  }
}