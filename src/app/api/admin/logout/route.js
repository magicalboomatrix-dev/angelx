import { NextResponse } from "next/server";
import { clearAdminAuthCookie } from "@/lib/adminAuth";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });
  clearAdminAuthCookie(response);
  return response;
}
