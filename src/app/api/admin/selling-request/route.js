import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getOrCreateSettings } from "@/lib/settings";
import { parsePositiveAmount, parsePositiveInt } from "@/lib/validation";
import { checkRateLimit, createRateLimitResponse, getClientIdentifier } from '@/lib/rateLimit';
import { createPendingSellRequest } from '@/lib/walletService';
import { serializeTransaction, serializeWallet } from '@/lib/serializers';

export async function POST(req) {
  try {
    const { bank, amount } = await req.json();
    const user = await getCurrentUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const bankId = parsePositiveInt(bank?.id);
    const parsedAmount = parsePositiveAmount(amount);

    if (!bankId || !parsedAmount) {
      return NextResponse.json({ error: "Missing bank or amount" }, { status: 400 });
    }

    const selectedBank = await prisma.bankCard.findFirst({
      where: {
        id: bankId,
        userId: user.id,
      },
    });

    if (!selectedBank) {
      return NextResponse.json({ error: "Bank account not found" }, { status: 404 });
    }

    const settings = await getOrCreateSettings(prisma);
    if (parsedAmount < settings.withdrawMin) {
      return NextResponse.json(
        { error: `Minimum withdrawal amount is ${settings.withdrawMin} USDT` },
        { status: 400 }
      );
    }

    const rateLimit = checkRateLimit(`wallet-action:bank-sell:${user.id}:${getClientIdentifier(req)}`, {
      windowMs: 60 * 1000,
      max: 3,
    });
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit, 'Too many wallet actions. Please try again in a minute.');
    }

    const result = await createPendingSellRequest({
      userId: user.id,
      amount: parsedAmount,
      network: 'BANK',
      address: selectedBank.accountNo,
      description: `Sell ${parsedAmount} USDT to bank account ${selectedBank.accountNo}`,
    });

    return NextResponse.json({
      success: true,
      transaction: serializeTransaction(result.transaction),
      wallet: serializeWallet(result.wallet),
    });
  } catch (err) {
    console.error("Error creating selling request:", err);
    const status = err.message === 'Insufficient balance' || err.message.includes('maximum number') ? 400 : 500;
    return NextResponse.json({ error: status === 500 ? 'Server error' : err.message }, { status });
  }
}
