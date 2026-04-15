// utils/auth.js
// Utility functions for JWT handling, refresh token, and expiry checks

export function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  // exp is in seconds
  return Date.now() >= payload.exp * 1000;
}

export async function refreshToken() {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // send httpOnly cookie
    });
    if (!res.ok) throw new Error('Failed to refresh token');
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      return data.token;
    }
    throw new Error('No token in response');
  } catch (err) {
    localStorage.removeItem('token');
    throw err;
  }
}
