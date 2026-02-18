import { verifyAdminCookie } from "@/lib/adminAuth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const decoded = verifyAdminCookie(req);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({ 
      where: { id: decoded.id },
      select: { id: true, email: true }
    });

    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({ admin }, { status: 200 });
  } catch (err) {
    console.error("Admin me error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

