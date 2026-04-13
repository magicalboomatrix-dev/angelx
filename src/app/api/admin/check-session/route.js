import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdminCookie } from "@/lib/adminAuth";

export async function GET(req) {
  try {
    const decoded = verifyAdminCookie(req);
    if (!decoded) return NextResponse.json({ valid: false }, { status: 401 });

    const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });
    if (!admin) return NextResponse.json({ valid: false }, { status: 401 });

    return NextResponse.json({ valid: true, email: admin.email });
  } catch (err) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}
