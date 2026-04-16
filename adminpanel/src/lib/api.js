'use client';

import { clearAdminSession, ensureAdminSession, refreshAdminToken } from './auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path, options = {}, retryOnUnauthorized = true) {
  const token = await ensureAdminSession();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401 && retryOnUnauthorized) {
    try {
      await refreshAdminToken();
      return apiFetch(path, options, false);
    } catch {
      clearAdminSession();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized');
    }
  }

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      clearAdminSession();
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  return res;
}
