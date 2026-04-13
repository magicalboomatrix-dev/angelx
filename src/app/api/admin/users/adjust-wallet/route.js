import { NextResponse } from 'next/server';
import { verifyAdminCookie } from '@/app/lib/adminAuth';
import { parsePositiveAmount, parsePositiveInt, sanitizeText } from '@/lib/validation';
import { adjustWalletBalance } from '@/lib/walletService';
import { serializeWallet } from '@/lib/serializers';

export async function POST(request) {
  const auth = verifyAdminCookie(request);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { userId, amount, type, reason } = await request.json();
    const parsedUserId = parsePositiveInt(userId);
    const parsedAmount = parsePositiveAmount(amount);
    const normalizedType = String(type || '').toUpperCase();

    if (!parsedUserId || !parsedAmount || !['CREDIT', 'DEBIT'].includes(normalizedType)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const result = await adjustWalletBalance({
      userId: parsedUserId,
      adminId: auth.id,
      amount: parsedAmount,
      type: normalizedType,
      reason: sanitizeText(reason, { maxLength: 300 }) || null,
    });

    return NextResponse.json({ success: true, newBalance: result.wallet?.usdtAvailable?.toString ? Number(result.wallet.usdtAvailable.toString()) : 0, wallet: serializeWallet(result.wallet) });
  } catch (error) {
    console.error('Wallet adjustment error:', error);
    const status = error.message === 'User not found' ? 404 : error.message === 'Insufficient wallet balance' ? 400 : 500;
    return NextResponse.json({ error: status === 500 ? 'Internal Server Error' : error.message }, { status });
  }
}
