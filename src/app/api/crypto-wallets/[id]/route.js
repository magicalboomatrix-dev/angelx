import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { parsePositiveInt } from '@/lib/validation';

export async function DELETE(request, { params }) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const parsedWalletId = parsePositiveInt(id);
    if (!parsedWalletId) {
      return NextResponse.json({ error: 'Invalid wallet id' }, { status: 400 });
    }

    const wallet = await prisma.cryptoWallet.findFirst({
      where: { id: parsedWalletId, userId: user.id }
    });

    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    await prisma.cryptoWallet.delete({
      where: { id: parsedWalletId }
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