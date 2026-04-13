// POST /api/admin/confirm-selling-request
import { NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/adminAuth";
import { parsePositiveInt } from "@/lib/validation";
import { confirmSell } from '@/lib/walletService';
import { serializeTransaction, serializeWallet } from '@/lib/serializers';

export async function POST(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { transactionId } = await req.json();
    const parsedTransactionId = parsePositiveInt(transactionId);
    if (!parsedTransactionId) {
      return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
    }

    const result = await confirmSell({
      transactionId: parsedTransactionId,
      adminId: admin.id,
    });

    return NextResponse.json({ success: true, transaction: serializeTransaction(result.transaction), wallet: serializeWallet(result.wallet) });
  } catch (err) {
    console.error("Error confirming selling request:", err);
    const isBalanceError = err.message === 'Locked balance is insufficient' || err.message === 'Available balance is insufficient for this legacy pending sell';
    const status = isBalanceError ? 400 : err.message === 'Transaction not found or already processed' ? 404 : 500;
    const message = err.message === 'Transaction not found or already processed' || isBalanceError
      ? err.message
      : "Server error";
    return NextResponse.json({ error: message }, { status });
  }
}
