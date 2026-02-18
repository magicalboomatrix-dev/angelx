import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminCookie } from "@/lib/adminAuth";

export async function GET(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const deposits = await prisma.transaction.findMany({
      where: { status: "PENDING", type: "DEPOSIT" },
      include: { user: true }, // include user details
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ deposits });
  } catch (err) {
    console.error("Fetch deposits error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
