const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const backendResponse = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        cookie: req.headers.cookie || '',
      },
    });

    const data = await backendResponse.json();
    return res.status(backendResponse.status).json(data);
  } catch {
    return res.status(500).json({ error: 'Failed to refresh token' });
  }
}
