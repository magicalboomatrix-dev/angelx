import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getOrCreateSettings } from '@/lib/settings';

export async function GET() {
  try {
    const settings = await getOrCreateSettings(prisma);

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
