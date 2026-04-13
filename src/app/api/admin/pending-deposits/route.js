import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminCookie } from "@/lib/adminAuth";
import { serializeTransactions, serializeWallet } from '@/lib/serializers';

export async function GET(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const deposits = await prisma.transaction.findMany({
      where: { status: "PENDING", type: "DEPOSIT" },
      select: {
        id: true,
        referenceId: true,
        amount: true,
        currency: true,
        status: true,
        createdAt: true,
        network: true,
        address: true,
        txnId: true,
        description: true,
        user: {
          select: {
            id: true,
            mobile: true,
            wallet: {
              select: {
                usdtAvailable: true,
                usdtLocked: true,
                usdtDeposited: true,
                usdtWithdrawn: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      deposits: serializeTransactions(deposits).map((deposit) => ({
        ...deposit,
        user: deposit.user
          ? { ...deposit.user, wallet: serializeWallet(deposit.user.wallet) }
          : null,
      })),
    });
  } catch (err) {
    console.error("Fetch deposits error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
