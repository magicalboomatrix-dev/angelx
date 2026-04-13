/**
 * Simple in-memory rate limiter.
 * Works correctly for single-process deployments (dev, single-instance prod).
 * For multi-instance deployments, replace the Map with a shared store (e.g. Redis).
 */

/** @type {Map<string, { count: number, resetAt: number }>} */
const store = new Map();

// Periodically purge expired entries to avoid unbounded memory growth.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key);
  }
}, 60_000).unref?.();

/**
 * Check whether a key is within its rate limit.
 * @param {string} key - Unique identifier (e.g. "otp-send:ip:phone")
 * @param {{ windowMs: number, max: number }} options
 * @returns {{ allowed: boolean, remaining: number, resetAt: number }}
 */
export function checkRateLimit(key, { windowMs, max }) {
  const now = Date.now();
  let entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowMs };
    store.set(key, entry);
  }

  entry.count += 1;
  const allowed = entry.count <= max;
  const remaining = Math.max(0, max - entry.count);

  return { allowed, remaining, resetAt: entry.resetAt };
}

/**
 * Build a 429 Response for a rate-limited request.
 * @param {{ resetAt: number }} rateLimit
 * @param {string} message
 * @returns {Response}
 */
export function createRateLimitResponse({ resetAt }, message) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': String(retryAfter),
    },
  });
}

/**
 * Extract a best-effort client identifier from a Next.js Request.
 * Prefers forwarded IP headers set by reverse proxies; falls back to a constant.
 * @param {Request} req
 * @returns {string}
 */
export function getClientIdentifier(req) {
  // Next.js App Router exposes headers via req.headers
  const forwarded = req.headers?.get?.('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();

  const realIp = req.headers?.get?.('x-real-ip');
  if (realIp) return realIp.trim();

  return 'unknown';
}
