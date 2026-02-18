// /app/api/admin/users/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminCookie } from "@/lib/adminAuth";

export async function GET(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(5, parseInt(url.searchParams.get('pageSize') || '20')));

    const skip = (page - 1) * pageSize;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: pageSize,
        include: {
          wallet: true,
          bankCards: true,
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
        orderBy: { id: 'asc' },
      }),
      prisma.user.count(),
    ]);

    return NextResponse.json({ success: true, users, page, pageSize, total });
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json(
      { error: "An unexpected server error occurred" },
      { status: 500 }
    );
  }
}
