import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function DELETE(request, { params }) {
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

    const { id } = params;

    const wallet = await prisma.cryptoWallet.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    await prisma.cryptoWallet.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({ message: 'Wallet deleted successfully' });
  } catch (err) {
    console.error('Error deleting crypto wallet:', err);
    return NextResponse.json(
      { error: 'Failed to delete crypto wallet' },
      { status: 500 }
    );
  }
}