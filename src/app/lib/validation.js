import crypto from 'crypto';

export const OTP_LENGTH = 4;

/**
 * Normalise an Indian mobile number to its 10-digit form.
 * Strips leading +91 / 91 / 0, removes all non-digits, then validates.
 * Returns the 10-digit string on success, or null if invalid.
 * @param {unknown} raw
 * @returns {string|null}
 */
export function normalizePhone(raw) {
  if (typeof raw !== 'string' && typeof raw !== 'number') return null;
  let digits = String(raw).replace(/\D/g, '');

  // Strip country code prefixes
  if (digits.startsWith('0091')) digits = digits.slice(4);
  else if (digits.startsWith('91') && digits.length === 12) digits = digits.slice(2);
  else if (digits.startsWith('0') && digits.length === 11) digits = digits.slice(1);

  // Must be exactly 10 digits and start with 6-9
  if (digits.length !== 10 || !/^[6-9]/.test(digits)) return null;

  return digits;
}

/**
 * Sanitise a freeform text value.
 * @param {unknown} value
 * @param {{ maxLength?: number, allowEmpty?: boolean }} [options]
 * @returns {string|null}
 */
export function sanitizeText(value, { maxLength = 255, allowEmpty = true } = {}) {
  if (value === null || value === undefined) return null;
  const str = String(value).trim().slice(0, maxLength);
  if (!allowEmpty && str.length === 0) return null;
  return str;
}

/**
 * Generate a unique reference ID with an optional prefix.
 * Format: PREFIX-TIMESTAMP-RANDOM (e.g. DEP-1713012345678-A1B2C3)
 * @param {string} [prefix='REF']
 * @returns {string}
 */
export function generateReference(prefix = 'REF') {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${ts}-${rand}`;
}

/**
 * Parse and validate a positive numeric amount.
 * @param {unknown} value
 * @param {{ min?: number, max?: number }} [options]
 * @returns {number|null}
 */
export function parsePositiveAmount(value, { min = 0, max = Infinity } = {}) {
  const n = Number(value);
  if (!isFinite(n) || n <= 0 || n < min || n > max) return null;
  return n;
}

/**
 * Parse a positive integer (e.g. an ID).
 * @param {unknown} value
 * @returns {number|null}
 */
export function parsePositiveInt(value) {
  const n = parseInt(value, 10);
  if (!isFinite(n) || n <= 0 || String(n) !== String(value).trim()) return null;
  return n;
}

/**
 * Validate and sanitize bank card input fields.
 * Returns { value } on success or { error } on failure.
 * @param {unknown} body
 * @returns {{ value: { accountNo: string, ifsc: string, payeeName: string, bankName: string } } | { error: string }}
 */
export function normalizeBankCardInput(body) {
  if (!body || typeof body !== 'object') return { error: 'Invalid input' };

  const accountNo = sanitizeText(body.accountNo, { maxLength: 20, allowEmpty: false });
  const ifsc = sanitizeText(body.ifsc, { maxLength: 11, allowEmpty: false });
  const payeeName = sanitizeText(body.payeeName, { maxLength: 100, allowEmpty: false });
  const bankName = sanitizeText(body.bankName, { maxLength: 100, allowEmpty: false });

  if (!accountNo || !/^\d{9,18}$/.test(accountNo))
    return { error: 'Invalid account number (9–18 digits required)' };
  if (!ifsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc))
    return { error: 'Invalid IFSC code' };
  if (!payeeName) return { error: 'Payee name is required' };
  if (!bankName) return { error: 'Bank name is required' };

  return { value: { accountNo, ifsc: ifsc.toUpperCase(), payeeName, bankName } };
}

/**
 * Timing-safe string equality to prevent timing attacks on OTP comparison.
 * Returns false when lengths differ (leaks length, but OTP length is fixed/public).
 * @param {string|null|undefined} a
 * @param {string|null|undefined} b
 * @returns {boolean}
 */
export function timingSafeEqualStrings(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
