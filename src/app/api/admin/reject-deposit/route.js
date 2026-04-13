import { NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/adminAuth";
import { parsePositiveInt, sanitizeText } from "@/lib/validation";
import { rejectDeposit } from '@/lib/walletService';
import { serializeTransaction } from '@/lib/serializers';

export async function POST(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const transactionId = parsePositiveInt(body.transactionId);
    const { reason } = body;

    if (!transactionId) {
      return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
    }

    const result = await rejectDeposit({
      transactionId,
      adminId: admin.id,
      reviewNote: sanitizeText(reason, { maxLength: 500 }) || null,
    });

    return NextResponse.json({ success: true, transaction: serializeTransaction(result.transaction) });
  } catch (err) {
    console.error("Admin reject error:", err);
    const status = err.message === "Transaction not found or already processed" ? 404 : 500;
    return NextResponse.json({ error: status === 404 ? err.message : "Server error" }, { status });
  }
}
