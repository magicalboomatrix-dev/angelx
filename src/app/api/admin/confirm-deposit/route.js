import { NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/adminAuth";
import { parsePositiveInt } from "@/lib/validation";
import { confirmDeposit } from '@/lib/walletService';
import { serializeTransaction, serializeWallet } from '@/lib/serializers';

export async function POST(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const transactionId = parsePositiveInt(body.transactionId);

    if (!transactionId) {
      return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
    }

    const result = await confirmDeposit({
      transactionId,
      adminId: admin.id,
    });

    return NextResponse.json({ success: true, transaction: serializeTransaction(result.transaction), wallet: serializeWallet(result.wallet) });
  } catch (err) {
    console.error("Admin confirm error:", err);
    const status = err.message === "Transaction not found or already processed" ? 404 : 500;
    return NextResponse.json({ error: status === 404 ? err.message : "Server error" }, { status });
  }
}
