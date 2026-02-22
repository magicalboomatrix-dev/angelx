import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const wallets = await prisma.cryptoWallet.findMany({
      where: { userId },
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
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { address, network, label, currency } = await request.json();

    if (!address || !network) {
      return NextResponse.json(
        { error: 'Address and network are required' },
        { status: 400 }
      );
    }

    // Check if wallet already exists
    const existing = await prisma.cryptoWallet.findFirst({
      where: { userId, address }
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Wallet address already exists' },
        { status: 400 }
      );
    }

    const wallet = await prisma.cryptoWallet.create({
      data: {
        userId,
        address,
        network,
        label: label || null,
        isSelected: false,
        currency: currency || "USDT"
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