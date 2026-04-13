import prisma from './prisma';
import { generateReference } from './validation';

const MAX_PENDING_SELLS = 5;

/**
 * Create a pending DEPOSIT transaction (user submits a deposit claim).
 * Does NOT modify wallet balances — admin confirms/rejects later.
 */
export async function createPendingDeposit({ userId, referenceId, txnId, amount, network, address }) {
  const ref = referenceId || generateReference('DEP');

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      referenceId: ref,
      txnId: txnId || null,
      type: 'DEPOSIT',
      amount,
      currency: 'USDT',
      network,
      address,
      status: 'PENDING',
    },
  });

  return transaction;
}

/**
 * Create a pending SELL request (user withdraws — locks USDT until admin confirms).
 */
export async function createPendingSellRequest({ userId, amount, network, address, description }) {
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new Error('Wallet not found');

    if (Number(wallet.usdtAvailable) < amount) {
      throw new Error('Insufficient balance');
    }

    const pendingCount = await tx.transaction.count({
      where: { userId, type: 'SELL', status: 'PENDING' },
    });

    if (pendingCount >= MAX_PENDING_SELLS) {
      throw new Error(`You have reached the maximum number of pending requests (${MAX_PENDING_SELLS})`);
    }

    const transaction = await tx.transaction.create({
      data: {
        userId,
        referenceId: generateReference('SELL'),
        type: 'SELL',
        amount,
        currency: 'USDT',
        network,
        address,
        status: 'PENDING',
        description: description || null,
      },
    });

    const updatedWallet = await tx.wallet.update({
      where: { userId },
      data: {
        usdtAvailable: { decrement: amount },
        usdtLocked: { increment: amount },
      },
    });

    return { transaction, wallet: updatedWallet };
  });
}

/**
 * Admin confirms a DEPOSIT: credits usdtAvailable and usdtDeposited, marks SUCCESS.
 */
export async function confirmDeposit({ transactionId, adminId }) {
  return prisma.$transaction(async (tx) => {
    const txn = await tx.transaction.findUnique({ where: { id: transactionId } });

    if (!txn || txn.type !== 'DEPOSIT' || txn.status !== 'PENDING') {
      throw new Error('Transaction not found or already processed');
    }

    const amount = Number(txn.amount);

    const updatedTxn = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'SUCCESS',
        adminId,
        reviewedAt: new Date(),
      },
    });

    const updatedWallet = await tx.wallet.upsert({
      where: { userId: txn.userId },
      update: {
        usdtAvailable: { increment: amount },
        usdtDeposited: { increment: amount },
      },
      create: {
        userId: txn.userId,
        usdtAvailable: amount,
        usdtDeposited: amount,
        usdtLocked: 0,
        usdtWithdrawn: 0,
      },
    });

    return { transaction: updatedTxn, wallet: updatedWallet };
  });
}

/**
 * Admin rejects a DEPOSIT: marks FAILED, no wallet change.
 */
export async function rejectDeposit({ transactionId, adminId, reviewNote }) {
  return prisma.$transaction(async (tx) => {
    const txn = await tx.transaction.findUnique({ where: { id: transactionId } });

    if (!txn || txn.type !== 'DEPOSIT' || txn.status !== 'PENDING') {
      throw new Error('Transaction not found or already processed');
    }

    const updatedTxn = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'FAILED',
        adminId,
        reviewedAt: new Date(),
        reviewNote: reviewNote || null,
      },
    });

    return { transaction: updatedTxn };
  });
}

/**
 * Admin confirms a SELL: unlocks USDT (removes from locked, adds to withdrawn), marks SUCCESS.
 */
export async function confirmSell({ transactionId, adminId }) {
  return prisma.$transaction(async (tx) => {
    const txn = await tx.transaction.findUnique({ where: { id: transactionId } });

    if (!txn || txn.type !== 'SELL' || txn.status !== 'PENDING') {
      throw new Error('Transaction not found or already processed');
    }

    const amount = Number(txn.amount);
    const wallet = await tx.wallet.findUnique({ where: { userId: txn.userId } });

    if (!wallet || Number(wallet.usdtLocked) < amount) {
      throw new Error('Locked balance is insufficient');
    }

    const updatedTxn = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'SUCCESS',
        adminId,
        reviewedAt: new Date(),
      },
    });

    const updatedWallet = await tx.wallet.update({
      where: { userId: txn.userId },
      data: {
        usdtLocked: { decrement: amount },
        usdtWithdrawn: { increment: amount },
      },
    });

    return { transaction: updatedTxn, wallet: updatedWallet };
  });
}

/**
 * Admin rejects a SELL: unlocks USDT (returns to available), marks FAILED.
 */
export async function rejectSell({ transactionId, adminId, reviewNote }) {
  return prisma.$transaction(async (tx) => {
    const txn = await tx.transaction.findUnique({ where: { id: transactionId } });

    if (!txn || txn.type !== 'SELL' || txn.status !== 'PENDING') {
      throw new Error('Transaction not found or already processed');
    }

    const amount = Number(txn.amount);
    const wallet = await tx.wallet.findUnique({ where: { userId: txn.userId } });

    if (!wallet || Number(wallet.usdtLocked) < amount) {
      throw new Error('Locked balance is insufficient');
    }

    const updatedTxn = await tx.transaction.update({
      where: { id: transactionId },
      data: {
        status: 'FAILED',
        adminId,
        reviewedAt: new Date(),
        reviewNote: reviewNote || null,
      },
    });

    const updatedWallet = await tx.wallet.update({
      where: { userId: txn.userId },
      data: {
        usdtLocked: { decrement: amount },
        usdtAvailable: { increment: amount },
      },
    });

    return { transaction: updatedTxn, wallet: updatedWallet };
  });
}

/**
 * Admin manually credits or debits a user's available wallet balance.
 * @param {{ userId: number, adminId: number, amount: number, type: 'CREDIT'|'DEBIT', reason: string|null }} params
 */
export async function adjustWalletBalance({ userId, adminId, amount, type, reason }) {
  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUnique({ where: { userId } });

    if (!wallet) throw new Error('User not found');

    if (type === 'DEBIT' && Number(wallet.usdtAvailable) < amount) {
      throw new Error('Insufficient wallet balance');
    }

    const updatedWallet = await tx.wallet.update({
      where: { userId },
      data:
        type === 'CREDIT'
          ? { usdtAvailable: { increment: amount }, usdtDeposited: { increment: amount } }
          : { usdtAvailable: { decrement: amount } },
    });

    await tx.transaction.create({
      data: {
        userId,
        adminId,
        referenceId: generateReference('ADJ'),
        type: type === 'CREDIT' ? 'DEPOSIT' : 'WITHDRAW',
        amount,
        currency: 'USDT',
        network: 'MANUAL',
        address: 'admin-adjustment',
        status: 'SUCCESS',
        description: reason || `Admin ${type.toLowerCase()} adjustment`,
        reviewedAt: new Date(),
      },
    });

    return { wallet: updatedWallet };
  });
}
