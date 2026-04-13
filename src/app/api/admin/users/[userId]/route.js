import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { verifyAdminCookie } from '@/lib/adminAuth';
import { normalizeBankCardInput, normalizePhone, parsePositiveInt, sanitizeText } from '@/lib/validation';
import { serializeTransactions, serializeWallet } from '@/lib/serializers';

function normalizeCryptoWalletInput(input) {
  const address = sanitizeText(input?.address, { maxLength: 255, allowEmpty: false });
  const network = sanitizeText(input?.network, { maxLength: 40, allowEmpty: false })?.toUpperCase();
  const label = sanitizeText(input?.label, { maxLength: 80 }) || null;
  const currency = sanitizeText(input?.currency, { maxLength: 20, allowEmpty: false })?.toUpperCase();

  if (!address) {
    return { error: 'Wallet address is required' };
  }

  if (!network) {
    return { error: 'Wallet network is required' };
  }

  if (!currency) {
    return { error: 'Wallet currency is required' };
  }

  return {
    value: {
      address,
      network,
      label,
      currency,
    },
  };
}

async function getUserDetail(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      mobile: true,
      createdAt: true,
      updatedAt: true,
      wallet: {
        select: {
          usdtAvailable: true,
          usdtLocked: true,
          usdtDeposited: true,
          usdtWithdrawn: true,
          updatedAt: true,
        },
      },
      bankCards: {
        orderBy: [{ isSelected: 'desc' }, { id: 'asc' }],
        select: {
          id: true,
          bankName: true,
          accountNo: true,
          ifsc: true,
          payeeName: true,
          isSelected: true,
        },
      },
      cryptoWallets: {
        orderBy: [{ isSelected: 'desc' }, { id: 'asc' }],
        select: {
          id: true,
          address: true,
          network: true,
          label: true,
          currency: true,
          isSelected: true,
        },
      },
      transactions: {
        take: 12,
        orderBy: { createdAt: 'desc' },
        include: {
          reviewedBy: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      },
      walletLedger: {
        take: 12,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          amount: true,
          balanceAfter: true,
          referenceId: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) {
    return null;
  }

  return {
    ...user,
    wallet: serializeWallet(user.wallet),
    transactions: serializeTransactions(user.transactions),
    walletLedger: user.walletLedger.map((entry) => ({
      ...entry,
      amount: Number(entry.amount.toFixed(6)),
      balanceAfter: Number(entry.balanceAfter.toFixed(6)),
    })),
  };
}

export async function GET(request, { params }) {
  const auth = verifyAdminCookie(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parsePositiveInt((await params).userId);
  if (!userId) {
    return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
  }

  try {
    const user = await getUserDetail(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Admin user detail error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  const auth = verifyAdminCookie(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parsePositiveInt((await params).userId);
  if (!userId) {
    return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const mobile = normalizePhone(body?.mobile);
    const bankCards = Array.isArray(body?.bankCards) ? body.bankCards : [];
    const cryptoWallets = Array.isArray(body?.cryptoWallets) ? body.cryptoWallets : [];

    if (!mobile) {
      return NextResponse.json({ error: 'A valid mobile number is required' }, { status: 400 });
    }

    const normalizedCards = [];
    let selectedBankCount = 0;
    for (const item of bankCards) {
      const normalized = normalizeBankCardInput(item);
      if (normalized.error) {
        return NextResponse.json({ error: normalized.error }, { status: 400 });
      }

      const id = item?.id ? parsePositiveInt(item.id) : null;
      const isSelected = Boolean(item?.isSelected);
      if (isSelected) {
        selectedBankCount += 1;
      }

      normalizedCards.push({
        id,
        isSelected,
        ...normalized.value,
      });
    }

    if (selectedBankCount > 1) {
      return NextResponse.json({ error: 'Only one bank account can be selected' }, { status: 400 });
    }

    const normalizedWallets = [];
    let selectedWalletCount = 0;
    for (const item of cryptoWallets) {
      const normalized = normalizeCryptoWalletInput(item);
      if (normalized.error) {
        return NextResponse.json({ error: normalized.error }, { status: 400 });
      }

      const id = item?.id ? parsePositiveInt(item.id) : null;
      const isSelected = Boolean(item?.isSelected);
      if (isSelected) {
        selectedWalletCount += 1;
      }

      normalizedWallets.push({
        id,
        isSelected,
        ...normalized.value,
      });
    }

    if (selectedWalletCount > 1) {
      return NextResponse.json({ error: 'Only one crypto wallet can be selected' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          bankCards: { select: { id: true } },
          cryptoWallets: { select: { id: true } },
        },
      });

      if (!existingUser) {
        throw new Error('USER_NOT_FOUND');
      }

      const existingBankIds = new Set(existingUser.bankCards.map((item) => item.id));
      const existingWalletIds = new Set(existingUser.cryptoWallets.map((item) => item.id));

      for (const item of normalizedCards) {
        if (item.id && !existingBankIds.has(item.id)) {
          throw new Error('INVALID_BANK_CARD');
        }
      }

      for (const item of normalizedWallets) {
        if (item.id && !existingWalletIds.has(item.id)) {
          throw new Error('INVALID_CRYPTO_WALLET');
        }
      }

      await tx.user.update({
        where: { id: userId },
        data: {
          mobile,
        },
      });

      const bankIdsToKeep = normalizedCards.map((item) => item.id).filter(Boolean);
      await tx.bankCard.deleteMany({
        where: {
          userId,
          ...(bankIdsToKeep.length ? { id: { notIn: bankIdsToKeep } } : {}),
        },
      });

      if (!bankIdsToKeep.length) {
        await tx.bankCard.deleteMany({ where: { userId } });
      }

      const savedBankCards = [];
      for (const item of normalizedCards) {
        if (item.id) {
          const updated = await tx.bankCard.update({
            where: { id: item.id },
            data: {
              bankName: item.bankName,
              accountNo: item.accountNo,
              ifsc: item.ifsc,
              payeeName: item.payeeName,
              isSelected: false,
            },
          });
          savedBankCards.push(updated);
        } else {
          const created = await tx.bankCard.create({
            data: {
              userId,
              bankName: item.bankName,
              accountNo: item.accountNo,
              ifsc: item.ifsc,
              payeeName: item.payeeName,
              isSelected: false,
            },
          });
          savedBankCards.push(created);
        }
      }

      const selectedBankIndex = normalizedCards.findIndex((item) => item.isSelected);
      if (selectedBankIndex >= 0 && savedBankCards[selectedBankIndex]) {
        await tx.bankCard.updateMany({ where: { userId }, data: { isSelected: false } });
        await tx.bankCard.update({ where: { id: savedBankCards[selectedBankIndex].id }, data: { isSelected: true } });
      } else {
        await tx.bankCard.updateMany({ where: { userId }, data: { isSelected: false } });
      }

      const cryptoIdsToKeep = normalizedWallets.map((item) => item.id).filter(Boolean);
      await tx.cryptoWallet.deleteMany({
        where: {
          userId,
          ...(cryptoIdsToKeep.length ? { id: { notIn: cryptoIdsToKeep } } : {}),
        },
      });

      if (!cryptoIdsToKeep.length) {
        await tx.cryptoWallet.deleteMany({ where: { userId } });
      }

      const savedCryptoWallets = [];
      for (const item of normalizedWallets) {
        if (item.id) {
          const updated = await tx.cryptoWallet.update({
            where: { id: item.id },
            data: {
              address: item.address,
              network: item.network,
              label: item.label,
              currency: item.currency,
              isSelected: false,
            },
          });
          savedCryptoWallets.push(updated);
        } else {
          const created = await tx.cryptoWallet.create({
            data: {
              userId,
              address: item.address,
              network: item.network,
              label: item.label,
              currency: item.currency,
              isSelected: false,
            },
          });
          savedCryptoWallets.push(created);
        }
      }

      const selectedWalletIndex = normalizedWallets.findIndex((item) => item.isSelected);
      if (selectedWalletIndex >= 0 && savedCryptoWallets[selectedWalletIndex]) {
        await tx.cryptoWallet.updateMany({ where: { userId }, data: { isSelected: false } });
        await tx.cryptoWallet.update({ where: { id: savedCryptoWallets[selectedWalletIndex].id }, data: { isSelected: true } });
      } else {
        await tx.cryptoWallet.updateMany({ where: { userId }, data: { isSelected: false } });
      }
    });

    const user = await getUserDetail(userId);
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Admin user update error:', error);

    if (error.message === 'USER_NOT_FOUND') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (error.message === 'INVALID_BANK_CARD' || error.message === 'INVALID_CRYPTO_WALLET') {
      return NextResponse.json({ error: 'Invalid related record supplied' }, { status: 400 });
    }

    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Duplicate mobile or wallet record detected' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}