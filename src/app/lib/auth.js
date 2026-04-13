// lib/auth.js
import prisma from "./prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

/**
 * Generate JWT for a user
 * @param {Object} user - User object
 * @returns {string} token
 */
export function generateToken(user) {
  const payload = { id: user.id, mobile: user.mobile };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

/**
 * Verify JWT token and return payload
 * @param {string} token
 * @returns {Object|null} payload
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}

/**
 * Get current logged-in user from the request
 * @param {Request} req - Next.js App Router request
 * @returns {Promise<Object|null>} User
 */
export async function getCurrentUser(req) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

    const token = authHeader.split(" ")[1];
    const payload = verifyToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        wallet: true,
      },
    });

    return user || null;
  } catch (err) {
    console.error("getCurrentUser error:", err);
    return null;
  }
}

const USER_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

/**
 * Set the user session cookie on a NextResponse.
 * @param {import('next/server').NextResponse} response
 * @param {string} token
 */
export function setUserAuthCookie(response, token) {
  response.cookies.set("userToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: USER_TOKEN_MAX_AGE_SECONDS,
    path: "/",
  });
}
