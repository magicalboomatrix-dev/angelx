import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getOrCreateSettings } from '@/lib/settings';
import { generateReference, parsePositiveAmount, sanitizeText } from '@/lib/validation';
import { checkRateLimit, createRateLimitResponse, getClientIdentifier } from '@/lib/rateLimit';
import { createPendingDeposit } from '@/lib/walletService';
import { serializeTransaction } from '@/lib/serializers';

export async function POST(req) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, network, referenceId, depositId, txid, address } = body;
    const parsedAmount = parsePositiveAmount(amount);
    const cleanNetwork = sanitizeText(network, { maxLength: 32, allowEmpty: false });
    const cleanAddress = sanitizeText(address, { maxLength: 255, allowEmpty: false });
    const cleanReferenceId = sanitizeText(referenceId, { maxLength: 100 }) || sanitizeText(depositId, { maxLength: 100 }) || generateReference('DEP');
    const cleanTxid = sanitizeText(txid, { maxLength: 255 });

    if (!parsedAmount || !cleanNetwork || !cleanAddress) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const settings = await getOrCreateSettings(prisma);
    if (parsedAmount < settings.depositMin) {
      return NextResponse.json(
        { error: `Minimum deposit amount is ${settings.depositMin} USDT` },
        { status: 400 }
      );
    }

    const rateLimit = checkRateLimit(`wallet-action:deposit:${user.id}:${getClientIdentifier(req)}`, {
      windowMs: 60 * 1000,
      max: 3,
    });
    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit, 'Too many wallet actions. Please try again in a minute.');
    }

    const transaction = await createPendingDeposit({
      userId: user.id,
      referenceId: cleanReferenceId,
      txnId: cleanTxid || null,
      amount: parsedAmount,
      network: cleanNetwork,
      address: cleanAddress,
    });

    return NextResponse.json({ success: true, transaction: serializeTransaction(transaction) });
  } catch (err) {
    console.error("Deposit error:", err);
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0];
      if (field === 'txnId') {
        return NextResponse.json({ error: "Transaction ID already used" }, { status: 400 });
      }
      if (field === 'referenceId' || field === 'depositId') {
        return NextResponse.json({ error: "Deposit request already submitted" }, { status: 400 });
      }
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
