import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();
    
    // If settings don't exist, create default settings
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          rate: 102,
          withdrawMin: 50,
          depositMin: 100,
          trc20Address: "TU7f7jwJr56owuutyzbJEwVqF3ii4KCiPV",
          erc20Address: "0x78845f99b319b48393fbcde7d32fcb7ccd6661bf",
          trc20QrUrl: "images/trc20.png",
          erc20QrUrl: "images/erc20.png",
        },
      });
    }

    return NextResponse.json({
      depositMin: settings.depositMin,
      withdrawMin: settings.withdrawMin,
      rate: settings.rate,
    });
  } catch (err) {
    console.error('Error fetching limits:', err);
    return NextResponse.json(
      { error: 'Failed to fetch limits' },
      { status: 500 }
    );
  }
}
