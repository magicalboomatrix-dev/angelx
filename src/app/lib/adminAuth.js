import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export const ADMIN_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

/**
 * Set the admin session cookie on a NextResponse.
 * @param {import('next/server').NextResponse} response
 * @param {string} token
 */
export function setAdminAuthCookie(response, token) {
  response.cookies.set("adminToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: ADMIN_TOKEN_MAX_AGE_SECONDS,
    path: "/",
  });
}

/**
 * Clear the admin session cookie on a NextResponse.
 * @param {import('next/server').NextResponse} response
 */
export function clearAdminAuthCookie(response) {
  response.cookies.set("adminToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export function verifyAdminToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch {
    return null;
  }
}

export function verifyAdminCookie(req) {
  try {
    const token = req.cookies.get("adminToken")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (err) {
    console.error("Admin cookie verification failed:", err);
    return null;
  }
}

