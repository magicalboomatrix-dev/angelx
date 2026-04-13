import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getOrCreateSettings, serializePublicSettings } from '@/lib/settings';

export async function GET() {
  try {
    const settings = await getOrCreateSettings(prisma);
    return NextResponse.json(serializePublicSettings(settings));
  } catch (err) {
    console.error('Error fetching settings:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
