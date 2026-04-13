import crypto from 'crypto';
import prisma from './prisma';

/**
 * Ensure a user has an invite code. If they don't, generate and save one.
 * Must be called inside a Prisma transaction (tx).
 * @param {import('@prisma/client').Prisma.TransactionClient} tx
 * @param {number} userId
 */
export async function ensureUserInviteCode(tx, userId) {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { inviteCode: true },
  });

  if (user?.inviteCode) return; // already has one

  // Generate a unique 8-character alphanumeric code, retry on collision.
  let attempts = 0;
  while (attempts < 5) {
    const code = crypto.randomBytes(5).toString('base64url').slice(0, 8).toUpperCase();
    const existing = await tx.user.findUnique({
      where: { inviteCode: code },
      select: { id: true },
    });

    if (!existing) {
      await tx.user.update({
        where: { id: userId },
        data: { inviteCode: code },
      });
      return;
    }

    attempts++;
  }

  throw new Error('Failed to generate a unique invite code after multiple attempts');
}

/**
 * Fetch all data needed for the referral dashboard.
 * @param {number} userId
 * @param {string} origin - e.g. "https://example.com"
 */
export async function getReferralDashboardData(userId, origin) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      inviteCode: true,
      referrals: {
        select: {
          id: true,
          mobile: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const [settings, rewardsAgg, rewardedReferrals] = await Promise.all([
    prisma.settings.findFirst({ select: { inviteReward: true } }),
    prisma.referralReward.aggregate({
      _sum: { amount: true },
      where: { referrerId: userId },
    }),
    prisma.referralReward.findMany({
      where: { referrerId: userId },
      select: { referredUserId: true },
      distinct: ['referredUserId'],
    }),
  ]);

  const inviteCode = user?.inviteCode || null;
  const inviteLink = inviteCode ? `${origin}/login-account?ref=${inviteCode}` : null;

  return {
    inviteCode,
    inviteLink,
    inviteReward: settings?.inviteReward ?? 0,
    totalReferrals: user?.referrals?.length ?? 0,
    totalRewards: Number(rewardsAgg._sum.amount ?? 0),
    rewardedReferrals: rewardedReferrals.length,
    referrals: (user?.referrals ?? []).map((r) => ({
      id: r.id,
      mobile: r.mobile,
      joinedAt: r.createdAt,
    })),
  };
}
