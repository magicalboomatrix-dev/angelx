'use client';

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

export function isAdminToken(token) {
  const payload = parseJwt(token);
  return payload?.role === 'admin';
}

export function clearAdminSession() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }
}

export async function refreshAdminToken() {
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Failed to refresh admin token');
    }

    const data = await res.json();
    if (!data.token || !isAdminToken(data.token)) {
      clearAdminSession();
      throw new Error('No token in refresh response');
    }

    localStorage.setItem('admin_token', data.token);
    return data.token;
  } catch {
    clearAdminSession();
    throw new Error('Failed to refresh admin token');
  }
}

export async function ensureAdminSession({ forceRefresh = false } = {}) {
  if (typeof window === 'undefined') {
    return null;
  }

  const currentToken = localStorage.getItem('admin_token');
  if (currentToken && !isAdminToken(currentToken)) {
    clearAdminSession();
    return null;
  }

  if (!forceRefresh && currentToken && !willTokenExpireSoon(currentToken)) {
    return currentToken;
  }

  try {
    return await refreshAdminToken();
  } catch {
    if (currentToken && !isTokenExpired(currentToken) && isAdminToken(currentToken)) {
      return currentToken;
    }

    return null;
  }
}
