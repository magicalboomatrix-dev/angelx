import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const settings = await prisma.settings.findFirst();
    
    if (!settings) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      TRC20: {
        address: settings.trc20Address,
        network: "TRC20",
      },
      ERC20: {
        address: settings.erc20Address,
        network: "ERC20",
      },
    });
  } catch (err) {
    console.error('Error fetching crypto addresses:', err);
    return NextResponse.json(
      { error: 'Failed to fetch crypto addresses' },
      { status: 500 }
    );
  }
}
