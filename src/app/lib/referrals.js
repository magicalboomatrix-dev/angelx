import crypto from 'crypto';

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
