// POST /api/admin/confirm-selling-request
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/adminAuth";

export async function POST(req) {
  try {
    // admin guard
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { transactionId } = await req.json();
    if (!transactionId) {
      return NextResponse.json({ error: "Missing transactionId" }, { status: 400 });
    }

    const tx = await prisma.transaction.findUnique({ where: { id: Number(transactionId) } });
    if (!tx || tx.status !== "PENDING") {
      return NextResponse.json({ error: "Transaction not found or already processed" }, { status: 404 });
    }

    // Update transaction status to success
    await prisma.transaction.update({
      where: { id: tx.id },
      data: { status: "SUCCESS" },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error confirming selling request:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
