import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET || JWT_SECRET;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const refreshToken = req.cookies['refreshToken'];
  if (!refreshToken) {
    return res.status(401).json({ error: 'No refresh token' });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    if (!payload || !payload.id) {
      throw new Error('Invalid refresh token');
    }

    const token = jwt.sign(
      { id: payload.id, phone: payload.phone, email: payload.email, role: payload.role },
      JWT_SECRET,
      { expiresIn: '30m' }
    );

    return res.json({ token });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
}