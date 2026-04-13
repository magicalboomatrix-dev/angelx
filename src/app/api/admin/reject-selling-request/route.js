// POST /api/admin/reject-selling-request
import { NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/adminAuth";
import { parsePositiveInt, sanitizeText } from "@/lib/validation";
import { rejectSell } from '@/lib/walletService';
import { serializeTransaction, serializeWallet } from '@/lib/serializers';

export async function POST(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { transactionId, reason } = await req.json();
    const parsedTransactionId = parsePositiveInt(transactionId);
    if (!parsedTransactionId) {
      return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
    }

    const result = await rejectSell({
      transactionId: parsedTransactionId,
      adminId: admin.id,
      reviewNote: sanitizeText(reason, { maxLength: 500 }) || null,
    });

    return NextResponse.json({ success: true, transaction: serializeTransaction(result.transaction), wallet: serializeWallet(result.wallet) });
  } catch (err) {
    console.error("Error rejecting selling request:", err);
    const status = err.message === 'Locked balance is insufficient' || err.message === 'Available balance is insufficient for this legacy pending sell' ? 400 : err.message === 'Transaction not found or already processed' ? 404 : 500;
    return NextResponse.json({ error: status === 500 ? 'Server error' : err.message }, { status });
  }
}
