import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { parsePositiveInt, sanitizeText } from '@/lib/validation';

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wallets = await prisma.cryptoWallet.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ wallets });
  } catch (err) {
    console.error('Error fetching crypto wallets:', err);
    return NextResponse.json(
      { error: 'Failed to fetch crypto wallets' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { address, network, label, currency } = await request.json();
    const cleanAddress = sanitizeText(address, { maxLength: 255, allowEmpty: false });
    const cleanNetwork = sanitizeText(network, { maxLength: 50, allowEmpty: false });
    const cleanLabel = sanitizeText(label, { maxLength: 120 });
    const cleanCurrency = sanitizeText(currency, { maxLength: 20 }) || 'USDT';

    if (!cleanAddress || !cleanNetwork) {
      return NextResponse.json(
        { error: 'Address and network are required' },
        { status: 400 }
      );
    }

    const existing = await prisma.cryptoWallet.findFirst({
      where: { userId: user.id, address: cleanAddress }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Wallet address already exists' },
        { status: 400 }
      );
    }

    const wallet = await prisma.cryptoWallet.create({
      data: {
        userId: user.id,
        address: cleanAddress,
        network: cleanNetwork,
        label: cleanLabel || null,
        isSelected: false,
        currency: cleanCurrency,
      }
    });

    return NextResponse.json({ wallet }, { status: 201 });
  } catch (err) {
    console.error('Error creating crypto wallet:', err);
    return NextResponse.json(
      { error: 'Failed to create crypto wallet' },
      { status: 500 }
    );
  }
}