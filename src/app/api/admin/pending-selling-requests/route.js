// GET /api/admin/pending-selling-requests
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { verifyAdminCookie } from "@/lib/adminAuth";

export async function GET(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const requests = await prisma.transaction.findMany({
      where: { status: "PENDING", type: "SELL" },
      include: {
        user: { 
          select: { 
            id: true, 
            email: true, 
            fullName: true,
            bankCards: true,
            cryptoWallets: true
          } 
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (err) {
    console.error("Error fetching pending selling requests:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
