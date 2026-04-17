// utils/auth.js
// Utility functions for JWT handling, refresh token, and expiry checks

const DEFAULT_REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

export function parseJwt(token) {
  try {
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export function isTokenExpired(token, thresholdMs = 0) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000 - thresholdMs;
}

export function willTokenExpireSoon(token, thresholdMs = DEFAULT_REFRESH_THRESHOLD_MS) {
  return isTokenExpired(token, thresholdMs);
}

export function clearStoredToken(storageKey = 'token') {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(storageKey);
  }
}

export async function refreshToken(storageKey = 'token') {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include', // send httpOnly cookie
    });
    if (!res.ok) throw new Error('Failed to refresh token');
    const data = await res.json();
    if (data.token) {
      localStorage.setItem(storageKey, data.token);
      return data.token;
    }
    throw new Error('No token in response');
  } catch {
    clearStoredToken(storageKey);
    throw new Error('Failed to refresh token');
  }
}

export async function ensureValidToken({ storageKey = 'token', forceRefresh = false } = {}) {
  if (typeof window === 'undefined') {
    return null;
  }

  const currentToken = localStorage.getItem(storageKey);

  // No token in localStorage - user has logged out or not logged in
  if (!currentToken) {
    return null;
  }

  if (!forceRefresh && !willTokenExpireSoon(currentToken)) {
    return currentToken;
  }

  try {
    return await refreshToken(storageKey);
  } catch {
    if (!isTokenExpired(currentToken)) {
      return currentToken;
    }

    return null;
  }
}
