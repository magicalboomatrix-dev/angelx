import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import { getReferralDashboardData } from '@/lib/referrals';

export async function GET(req) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const origin = new URL(req.url).origin;
    const data = await getReferralDashboardData(user.id, origin);

    return NextResponse.json({
      inviteCode: data.inviteCode,
      inviteLink: data.inviteLink,
      inviteReward: data.inviteReward,
      totalReferrals: data.totalReferrals,
      totalRewards: data.totalRewards,
      rewardedReferrals: data.rewardedReferrals,
      referrals: data.referrals,
    });
  } catch (error) {
    console.error('Referral dashboard error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}