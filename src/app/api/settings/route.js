import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    let settings = await prisma.settings.findFirst();
    
    if (!settings) {
      // Create default settings if not found
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

    // Return all settings including limits, addresses, and QR codes
    return NextResponse.json({
      rate: settings.rate,
      limits: {
        depositMin: settings.depositMin,
        withdrawMin: settings.withdrawMin,
      },
      crypto: {
        TRC20: {
          address: settings.trc20Address,
          qrUrl: settings.trc20QrUrl,
        },
        ERC20: {
          address: settings.erc20Address,
          qrUrl: settings.erc20QrUrl,
        },
      },
    });
  } catch (err) {
    console.error('Error fetching settings:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
