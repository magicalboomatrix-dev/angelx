/** @type {import('@prisma/client').Settings} */
export const DEFAULT_SETTINGS = {
  rate: 102,
  depositMin: 100,
  withdrawMin: 50,
  inviteReward: 1,
  trc20Address: 'TU7f7jwJr56owuutyzbJEwVqF3ii4KCiPV',
  erc20Address: '0x78845f99b319b48393fbcde7d32fcb7ccd6661bf',
  trc20QrUrl: 'images/trc20.png',
  erc20QrUrl: 'images/erc20.png',
};

/**
 * Fetch the single Settings row, creating it with defaults if it doesn't exist.
 * Accepts either the default prisma client or a transaction client.
 * @param {import('@prisma/client').PrismaClient | import('@prisma/client').Prisma.TransactionClient} client
 * @returns {Promise<import('@prisma/client').Settings>}
 */
export async function getOrCreateSettings(client) {
  const existing = await client.settings.findFirst();
  if (existing) return existing;

  return client.settings.create({ data: DEFAULT_SETTINGS });
}

/**
 * Return only the fields safe to expose publicly (no internal-only values).
 * @param {import('@prisma/client').Settings} settings
 */
export function serializePublicSettings(settings) {
  return {
    rate: settings.rate,
    depositMin: settings.depositMin,
    withdrawMin: settings.withdrawMin,
    inviteReward: settings.inviteReward,
    trc20Address: settings.trc20Address,
    erc20Address: settings.erc20Address,
    trc20QrUrl: settings.trc20QrUrl,
    erc20QrUrl: settings.erc20QrUrl,
  };
}

/**
 * Return the deposit-specific fields needed by the deposit-info endpoint.
 * @param {import('@prisma/client').Settings} settings
 */
export function serializeDepositInfo(settings) {
  return {
    rate: settings.rate,
    depositMin: settings.depositMin,
    trc20Address: settings.trc20Address,
    erc20Address: settings.erc20Address,
    trc20QrUrl: settings.trc20QrUrl,
    erc20QrUrl: settings.erc20QrUrl,
  };
}
