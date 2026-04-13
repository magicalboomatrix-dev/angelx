import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { verifyAdminCookie } from '@/lib/adminAuth';
import { DEFAULT_SETTINGS, getOrCreateSettings } from '@/lib/settings';
import { parsePositiveAmount, sanitizeText } from '@/lib/validation';

export async function GET(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getOrCreateSettings(prisma);

    return NextResponse.json({ settings });
  } catch (err) {
    console.error('Admin get settings error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const admin = verifyAdminCookie(req);
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { 
      rate, depositMin, withdrawMin, inviteReward,
      trc20Address, erc20Address,
      trc20QrUrl, erc20QrUrl
    } = body;

    const r = parsePositiveAmount(rate, { min: 0.01, max: 1000000 });
    const d = parsePositiveAmount(depositMin, { min: 0.01, max: 1000000 });
    const w = parsePositiveAmount(withdrawMin, { min: 0.01, max: 1000000 });
    const reward = parsePositiveAmount(inviteReward, { min: 0.01, max: 1000000 });

    if (r === null || d === null || w === null || reward === null) {
      return NextResponse.json({ error: 'Invalid values' }, { status: 400 });
    }

    const cleanTrc20Address = sanitizeText(trc20Address, { maxLength: 255, allowEmpty: false });
    const cleanErc20Address = sanitizeText(erc20Address, { maxLength: 255, allowEmpty: false });

    if (!cleanTrc20Address || !cleanErc20Address) {
      return NextResponse.json({ error: 'Crypto addresses cannot be empty' }, { status: 400 });
    }

    const current = await getOrCreateSettings(prisma);

    const updateData = {
      rate: r,
      depositMin: d,
      withdrawMin: w,
      inviteReward: reward,
      trc20Address: cleanTrc20Address,
      erc20Address: cleanErc20Address,
      trc20QrUrl: sanitizeText(trc20QrUrl, { maxLength: 255 }) || DEFAULT_SETTINGS.trc20QrUrl,
      erc20QrUrl: sanitizeText(erc20QrUrl, { maxLength: 255 }) || DEFAULT_SETTINGS.erc20QrUrl,
    };

    if (current) {
      const updated = await prisma.settings.update({
        where: { id: current.id },
        data: updateData,
      });
      return NextResponse.json({ settings: updated });
    }

    const created = await prisma.settings.create({ data: updateData });
    return NextResponse.json({ settings: created });
  } catch (err) {
    console.error('Admin set settings error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
