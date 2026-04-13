'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, ChartSpline, ShieldCheck, Users } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { AdminEmptyState, AdminMetricCard, AdminPageHeader, AdminSurface, StatusBadge, formatAdminDate, formatAdminMoney } from '../components/admin-kit';

const initialStats = {
  deposits: 0,
  sells: 0,
  users: 0,
  totalDeposits: 0,
  totalVolume: 0,
  recentActivity: [],
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/stats', { cache: 'no-store' });
        const data = await response.json();
        if (!cancelled && response.ok) {
          setStats({ ...initialStats, ...data });
        }
      } catch (error) {
        console.error('Failed to load admin stats:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, []);

  const pendingQueue = Number(stats.deposits || 0) + Number(stats.sells || 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Premium operations console"
        description="A clean command surface for user moderation, queue handling, and treasury configuration. The dashboard keeps the active backlog and recent transaction flow in one view."
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
            <Button asChild className="w-full sm:w-auto">
              <Link href="/admin/deposits">Review deposits</Link>
            </Button>
            <Button asChild variant="secondary" className="w-full sm:w-auto">
              <Link href="/admin/withdrawals">Review withdrawals</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Registered users" value={stats.users || 0} detail="Total users available to search and manage." icon={Users} tone="slate" />
        <AdminMetricCard label="Pending deposits" value={stats.deposits || 0} detail="Crypto deposits waiting for admin confirmation." icon={ArrowDownToLine} tone="cyan" />
        <AdminMetricCard label="Pending withdrawals" value={stats.sells || 0} detail="Sell-to-bank requests needing final approval." icon={ArrowUpFromLine} tone="amber" />
        <AdminMetricCard label="Settled volume" value={`$${formatAdminMoney(stats.totalVolume || 0)}`} detail="Approved transaction value across completed flows." icon={ChartSpline} tone="emerald" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <AdminSurface
          title="Live queue"
          description="The operations backlog that currently needs admin attention."
          action={<StatusBadge status={pendingQueue > 0 ? 'PENDING' : 'SUCCESS'} className="px-3 py-1" />}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="border border-slate-200/80 bg-slate-50/80 p-4 sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Open queue</p>
              <p className="mt-2.5 text-2xl font-semibold tracking-[-0.04em] text-slate-950 md:text-[1.75rem]">{pendingQueue}</p>
              <p className="mt-1.5 text-[13px] leading-5 text-slate-500 md:text-sm md:leading-6">Combined deposit and withdrawal requests still pending review.</p>
            </div>
            <div className="border border-slate-200/80 bg-slate-50/80 p-4 sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Approved deposits</p>
              <p className="mt-2.5 text-2xl font-semibold tracking-[-0.04em] text-slate-950 md:text-[1.75rem]">{stats.totalDeposits || 0}</p>
              <p className="mt-1.5 text-[13px] leading-5 text-slate-500 md:text-sm md:leading-6">Deposit approvals already processed through the ledger-backed flow.</p>
            </div>
            <div className="border border-slate-200/80 bg-[linear-gradient(135deg,#0f172a_0%,#0f3b52_100%)] p-4 text-white shadow-[0_20px_40px_rgba(15,23,42,0.18)] sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/72">Control posture</p>
                <ShieldCheck className="h-5 w-5 text-cyan-300" />
              </div>
              <p className="mt-2.5 text-xl font-semibold tracking-[-0.04em] md:text-2xl">Guardrails active</p>
              <p className="mt-1.5 text-[13px] leading-5 text-white/80 md:text-sm md:leading-6">Cookie auth, atomic settlement, and audit logging remain in place while the UI is fully refreshed.</p>
            </div>
          </div>
        </AdminSurface>

        <AdminSurface title="Quick access" description="Shortcuts into the most common admin actions.">
          <div className="grid gap-3">
            <Link href="/admin/Users" className=" border border-slate-200/80 bg-slate-50/80 p-4 transition hover:border-slate-300 hover:bg-white">
              <p className="text-sm font-semibold text-slate-900">Search and edit users</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">Open the new searchable directory and manage user, bank, and crypto wallet records.</p>
            </Link>
            <Link href="/admin/settings" className=" border border-slate-200/80 bg-slate-50/80 p-4 transition hover:border-slate-300 hover:bg-white">
              <p className="text-sm font-semibold text-slate-900">Update platform settings</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">Adjust rate, minimums, and QR/address targets for TRC20 and ERC20/USDT deposits.</p>
            </Link>
            <Link href="/admin/transactions" className=" border border-slate-200/80 bg-slate-50/80 p-4 transition hover:border-slate-300 hover:bg-white">
              <p className="text-sm font-semibold text-slate-900">Inspect full transaction feed</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">Search historical deposit and withdrawal activity with filters.</p>
            </Link>
          </div>
        </AdminSurface>
      </div>

      <AdminSurface title="Recent activity" description="Latest transaction records flowing through the platform.">
        {loading ? (
          <div className=" border border-dashed border-slate-200 bg-slate-50/80 px-5 py-12 text-center text-sm text-slate-500">Loading recent transactions...</div>
        ) : stats.recentActivity?.length ? (
          <div className="overflow-x-auto admin-scrollbar">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivity.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-4 font-medium text-slate-900">{item.referenceId || `TX-${item.id}`}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900">{item.user?.mobile ? `+91 ${item.user.mobile}` : 'Unknown user'}</p>
                      <p className="text-xs text-slate-500">{item.user?.id ? `User #${item.user.id}` : 'No user id'}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{item.type}</td>
                    <td className="px-4 py-4"><StatusBadge status={item.status} /></td>
                    <td className="px-4 py-4 font-medium text-slate-900">${formatAdminMoney(item.amount)}</td>
                    <td className="px-4 py-4 text-slate-500">{formatAdminDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <AdminEmptyState title="No transactions yet" description="Once deposits or withdrawals are submitted, the latest records will appear here for quick review." />
        )}
      </AdminSurface>
    </div>
  );
}