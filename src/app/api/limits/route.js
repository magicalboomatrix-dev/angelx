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
