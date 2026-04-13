// /app/api/admin/users/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminCookie } from "@/lib/adminAuth";
import { serializeWallet } from '@/lib/serializers';

export async function GET(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(5, parseInt(url.searchParams.get('pageSize') || '20')));
    const search = String(url.searchParams.get('search') || '').trim();

    const skip = (page - 1) * pageSize;
    const where = search
      ? {
          OR: [
            { mobile: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: pageSize,
        where,
        select: {
          id: true,
          mobile: true,
          createdAt: true,
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
          cryptoWallets: {
            select: {
              id: true,
              address: true,
              network: true,
              label: true,
              currency: true,
              isSelected: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      users: users.map((user) => ({ ...user, wallet: serializeWallet(user.wallet) })),
      page,
      pageSize,
      total,
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    return NextResponse.json(
      { error: "An unexpected server error occurred" },
      { status: 500 }
    );
  }
}
