/**
 * Convert a Prisma Decimal (or any value) to a plain JS number.
 * Returns 0 for null/undefined.
 * @param {import('@prisma/client').Prisma.Decimal | number | string | null | undefined} value
 * @returns {number}
 */
export function decimalToNumber(value) {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

/**
 * Serialize a Wallet record — converts Decimal fields to plain numbers.
 * @param {import('@prisma/client').Wallet | null | undefined} wallet
 * @returns {object | null}
 */
export function serializeWallet(wallet) {
  if (!wallet) return null;
  return {
    id: wallet.id,
    userId: wallet.userId,
    usdtAvailable: decimalToNumber(wallet.usdtAvailable),
    usdtLocked: decimalToNumber(wallet.usdtLocked),
    usdtDeposited: decimalToNumber(wallet.usdtDeposited),
    usdtWithdrawn: decimalToNumber(wallet.usdtWithdrawn),
    createdAt: wallet.createdAt,
    updatedAt: wallet.updatedAt,
  };
}

/**
 * Serialize a single Transaction record.
 * @param {import('@prisma/client').Transaction | null | undefined} tx
 * @returns {object | null}
 */
export function serializeTransaction(tx) {
  if (!tx) return null;
  return {
    id: tx.id,
    userId: tx.userId,
    adminId: tx.adminId ?? null,
    referenceId: tx.referenceId,
    txnId: tx.txnId ?? null,
    type: tx.type,
    amount: decimalToNumber(tx.amount),
    currency: tx.currency,
    network: tx.network ?? null,
    address: tx.address ?? null,
    status: tx.status,
    description: tx.description ?? null,
    reviewNote: tx.reviewNote ?? null,
    reviewedAt: tx.reviewedAt ?? null,
    createdAt: tx.createdAt,
    updatedAt: tx.updatedAt,
    // Optionally included when query uses `include: { user: ... }`
    ...(tx.user !== undefined ? { user: tx.user } : {}),
  };
}

/**
 * Serialize an array of Transaction records.
 * @param {import('@prisma/client').Transaction[]} transactions
 * @returns {object[]}
 */
export function serializeTransactions(transactions) {
  if (!Array.isArray(transactions)) return [];
  return transactions.map(serializeTransaction);
}
