// GET /api/admin/pending-selling-requests
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/adminAuth";
import { serializeTransactions, serializeWallet } from '@/lib/serializers';

export async function GET(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const requests = await prisma.transaction.findMany({
      where: { status: "PENDING", type: "SELL" },
      select: {
        id: true,
        referenceId: true,
        amount: true,
        currency: true,
        status: true,
        createdAt: true,
        network: true,
        address: true,
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
            bankCards: {
              select: {
                id: true,
                accountNo: true,
                ifsc: true,
                payeeName: true,
                bankName: true,
                isSelected: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      requests: serializeTransactions(requests).map((request) => ({
        ...request,
        user: request.user
          ? { ...request.user, wallet: serializeWallet(request.user.wallet) }
          : null,
      })),
    });
  } catch (err) {
    console.error("Error fetching pending selling requests:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
