import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { setAdminAuthCookie, ADMIN_TOKEN_MAX_AGE_SECONDS } from "@/lib/adminAuth";
import { checkRateLimit, createRateLimitResponse, getClientIdentifier } from "@/lib/rateLimit";
import { sanitizeText } from "@/lib/validation";

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req) {
  try {
    if (!JWT_SECRET) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const { email, password } = await req.json();
    const normalizedEmail = sanitizeText(email, { maxLength: 254, allowEmpty: false })?.toLowerCase();
    const clientId = getClientIdentifier(req, normalizedEmail || "admin");
    const rateLimit = checkRateLimit(`admin-login:${clientId}`, { windowMs: 60 * 60 * 1000, max: 10 });

    if (!rateLimit.allowed) {
      return createRateLimitResponse(rateLimit, "Too many login attempts. Please try again later.");
    }

    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const admin = await prisma.admin.findUnique({ where: { email: normalizedEmail } });
    const invalidCredentialsResponse = NextResponse.json({ error: "Invalid email or password" }, { status: 400 });

    if (!admin) {
      return invalidCredentialsResponse;
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return invalidCredentialsResponse;
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      JWT_SECRET,
      { expiresIn: ADMIN_TOKEN_MAX_AGE_SECONDS }
    );

    const response = NextResponse.json(
      { message: "Login successful" },
      { status: 200 }
    );

    setAdminAuthCookie(response, token);
    return response;
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Optional GET for debugging or testing
export function GET() {
  return NextResponse.json(
    { message: "Use POST to login. This endpoint is for admins only." },
    { status: 200 }
  );
}
