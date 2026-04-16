// pages/api/auth/refresh.js
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET || JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Get refresh token from httpOnly cookie
  const refreshToken = req.cookies['refreshToken'];
  if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

  try {
    // Verify refresh token
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    if (!payload || !payload.id) throw new Error('Invalid refresh token');

    // Issue new access token (short expiry)
    const newToken = jwt.sign({ id: payload.id, phone: payload.phone, role: payload.role }, JWT_SECRET, { expiresIn: '30m' });
    return res.json({ token: newToken });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}
