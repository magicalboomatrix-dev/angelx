const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: {
        cookie: req.headers.cookie || '',
      },
    });
  } catch {}

  res.setHeader('Set-Cookie', 'refreshToken=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax');
  return res.status(200).json({ success: true });
}
