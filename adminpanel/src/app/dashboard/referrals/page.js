'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Gift } from 'lucide-react';

function StatusBadge({ status }) {
  const styles = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status] || styles.PENDING}`}>
      {status}
    </span>
  );
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReferrals() {
      try {
        const res = await apiFetch('/api/admin/referrals');
        if (res.ok) {
          const data = await res.json();
          setReferrals(data.referrals || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchReferrals();
  }, []);

  const confirmedReferrals = referrals.filter((referral) => referral.status === 'CONFIRMED');
  const pendingReferrals = referrals.filter((referral) => referral.status === 'PENDING');
  const totalRewards = confirmedReferrals.reduce((sum, referral) => sum + referral.rewardAmount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-teal-700">Referral Network</p>
          <h1 className="text-[clamp(1.7rem,2vw,2.4rem)] font-bold leading-tight text-slate-900">Referrals</h1>
          <p className="max-w-3xl text-sm text-slate-500 sm:text-[0.95rem]">Track pending invite links and confirmed referral rewards across the full user graph.</p>
        </div>
        <div className=" border border-pink-200 bg-pink-50 px-4 py-2.5 text-pink-700 shadow-sm">
          <Gift size={16} />
          <span className="ml-2 text-sm font-medium">Total Rewards: ${totalRewards.toFixed(2)}</span>
        </div>
      </div>

      <section className="relative overflow-hidden  border border-white/15 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.18),transparent_24%),linear-gradient(135deg,#0f172a_0%,#182642_42%,#125b72_100%)] p-6 text-white shadow-[0_28px_60px_rgba(15,23,42,0.28)] lg:p-8">
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Reward Overview</p>
            <h2 className="mt-3 text-3xl font-semibold">{referrals.length} referral relationships tracked</h2>
            <p className="mt-3 max-w-xl text-sm text-slate-200/85">Pending referrals appear as soon as a user signs up from a code. Once the first qualifying deposit is approved, the row turns confirmed and shows the reward.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className=" border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Reward pool</p>
              <p className="mt-2 text-2xl font-semibold">${totalRewards.toFixed(2)}</p>
            </div>
            <div className=" border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Pending</p>
              <p className="mt-2 text-2xl font-semibold">{pendingReferrals.length}</p>
            </div>
            <div className=" border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Confirmed</p>
              <p className="mt-2 text-2xl font-semibold">{confirmedReferrals.length}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden  border border-slate-200/70 bg-white/85 shadow-[0_16px_34px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-180 w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-[linear-gradient(180deg,rgba(244,247,251,0.95)_0%,rgba(237,242,247,0.92)_100%)]">
                <th className="border-b border-slate-200/80 px-4 py-3 text-left text-[0.76rem] font-bold uppercase tracking-[0.03em] text-slate-500">ID</th>
                <th className="border-b border-slate-200/80 px-4 py-3 text-left text-[0.76rem] font-bold uppercase tracking-[0.03em] text-slate-500">Referrer</th>
                <th className="border-b border-slate-200/80 px-4 py-3 text-left text-[0.76rem] font-bold uppercase tracking-[0.03em] text-slate-500">Referred User</th>
                <th className="border-b border-slate-200/80 px-4 py-3 text-left text-[0.76rem] font-bold uppercase tracking-[0.03em] text-slate-500">Status</th>
                <th className="border-b border-slate-200/80 px-4 py-3 text-right text-[0.76rem] font-bold uppercase tracking-[0.03em] text-slate-500">Reward</th>
                <th className="border-b border-slate-200/80 px-4 py-3 text-left text-[0.76rem] font-bold uppercase tracking-[0.03em] text-slate-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">Loading referrals...</td></tr>
              ) : referrals.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">No referrals found</td></tr>
              ) : (
                referrals.map((r) => (
                  <tr key={r.id} className="transition hover:bg-slate-50/80">
                    <td className="border-b border-slate-200/80 px-4 py-4 text-slate-400">#{r.id}</td>
                    <td className="border-b border-slate-200/80 px-4 py-4">
                      <div className="font-medium text-slate-900">{r.referrer?.phone || '—'}</div>
                      <div className="text-xs text-slate-400">{r.referrer?.phone || ''}</div>
                    </td>
                    <td className="border-b border-slate-200/80 px-4 py-4">
                      <div className="font-medium text-slate-900">{r.referredUser?.phone || '—'}</div>
                      <div className="text-xs text-slate-400">{r.referredUser?.phone || ''}</div>
                    </td>
                    <td className="border-b border-slate-200/80 px-4 py-4"><StatusBadge status={r.status} /></td>
                    <td className={`border-b border-slate-200/80 px-4 py-4 text-right font-semibold ${r.status === 'CONFIRMED' ? 'text-emerald-600' : 'text-slate-400'}`}>${Number(r.rewardAmount || 0).toFixed(2)}</td>
                    <td className="border-b border-slate-200/80 px-4 py-4 text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
