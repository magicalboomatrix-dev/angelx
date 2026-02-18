import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, network, depositId, txid, address } = body;

    if (!amount || !depositId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        depositId,
        txnId: txid || null,
        type: "DEPOSIT",
        amount: Number(amount),
        network,
        address,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, transaction });
  } catch (err) {
    console.error("Deposit error:", err);
    if (err.code === 'P2002') {
      const field = err.meta?.target?.[0];
      if (field === 'txnId') {
        return NextResponse.json({ error: "Transaction ID already used" }, { status: 400 });
      }
      if (field === 'depositId') {
        return NextResponse.json({ error: "Deposit request already submitted" }, { status: 400 });
      }
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
