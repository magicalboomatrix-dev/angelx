'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import {
  Users, ArrowDownCircle, ArrowUpCircle, DollarSign,
  Clock, CheckCircle, Gift, TrendingUp
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

function StatCard({ title, value, icon: Icon, color, subtext }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 ring-blue-100',
    green: 'bg-emerald-50 text-emerald-600 ring-emerald-100',
    orange: 'bg-orange-50 text-orange-600 ring-orange-100',
    purple: 'bg-violet-50 text-violet-600 ring-violet-100',
    red: 'bg-red-50 text-red-600 ring-red-100',
    cyan: 'bg-cyan-50 text-cyan-600 ring-cyan-100',
    indigo: 'bg-indigo-50 text-indigo-600 ring-indigo-100',
    pink: 'bg-pink-50 text-pink-600 ring-pink-100',
  };

  return (
    <div className=" border border-slate-200/70 bg-white/85 p-4 shadow-[0_16px_34px_rgba(15,23,42,0.08)] backdrop-blur-xl transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_46px_rgba(15,23,42,0.1)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {subtext && <p className="mt-2 text-xs text-slate-400">{subtext}</p>}
        </div>
        <div className={` p-3 ring-1 ${colorClasses[color] || colorClasses.blue}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartDays, setChartDays] = useState(30);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, chartRes] = await Promise.all([
          apiFetch('/api/admin/stats'),
          apiFetch(`/api/admin/chart-data?days=${chartDays}`),
        ]);
        if (statsRes.ok) setStats(await statsRes.json());
        if (chartRes.ok) {
          const data = await chartRes.json();
          setChartData(data.chartData || []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [chartDays]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center text-gray-500 mt-10">Failed to load dashboard data</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden  border border-white/15 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.18),transparent_24%),linear-gradient(135deg,#0f172a_0%,#182642_42%,#125b72_100%)] p-6 text-white shadow-[0_28px_60px_rgba(15,23,42,0.28)] lg:p-8">
        <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-cyan-200/80">Overview</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight lg:text-5xl">Run AngelX operations with faster visibility.</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-200/85 lg:text-base">Monitor transaction flow, user growth, referral payouts, and pending actions from a single responsive command surface.</p>
          </div>
          <div className="grid w-full max-w-xl gap-3 sm:grid-cols-3">
            <div className=" border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Users</p>
              <p className="mt-3 text-2xl font-semibold">{stats.totalUsers}</p>
              <p className="mt-1 text-xs text-slate-300">Live registered accounts</p>
            </div>
            <div className=" border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Pending</p>
              <p className="mt-3 text-2xl font-semibold">{stats.pendingDeposits + stats.pendingWithdrawals + stats.pendingSells}</p>
              <p className="mt-1 text-xs text-slate-300">Actions awaiting review</p>
            </div>
            <div className=" border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Referral Pool</p>
              <p className="mt-3 text-2xl font-semibold">${stats.totalReferralRewards.toFixed(2)}</p>
              <p className="mt-1 text-xs text-slate-300">Distributed rewards</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="blue" />
        <StatCard title="Total Deposits" value={stats.totalDeposits} icon={ArrowDownCircle} color="green" subtext={`$${stats.totalDepositAmount.toFixed(2)} approved`} />
        <StatCard title="Pending Deposits" value={stats.pendingDeposits} icon={Clock} color="orange" />
        <StatCard title="Total Withdrawals" value={stats.totalWithdrawals} icon={ArrowUpCircle} color="purple" subtext={`$${stats.totalWithdrawalAmount.toFixed(2)} approved`} />
        <StatCard title="Pending Withdrawals" value={stats.pendingWithdrawals} icon={Clock} color="red" />
        <StatCard title="Total Sells" value={stats.totalSells} icon={DollarSign} color="cyan" subtext={`$${stats.totalSellAmount.toFixed(2)} approved`} />
        <StatCard title="Pending Sells" value={stats.pendingSells} icon={Clock} color="orange" />
        <StatCard title="Referral Rewards" value={`$${stats.totalReferralRewards.toFixed(2)}`} icon={Gift} color="pink" subtext={`${stats.totalReferrals} referrals`} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_1fr]">
        <div className=" border border-slate-200/70 bg-white/85 p-5 shadow-[0_16px_34px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-teal-700">Analytics</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Transaction Volume</h3>
            </div>
            <div className="flex gap-1">
              {[7, 14, 30].map((d) => (
                <button key={d} onClick={() => setChartDays(d)}
                  className={` border px-3 py-1.5 text-xs font-semibold transition ${chartDays === d ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10' : 'border-slate-200 bg-white/90 text-slate-500 hover:bg-slate-50'}`}>
                  {d}D
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorWithdrawals" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSells" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => `$${Number(v).toFixed(2)}`} labelFormatter={(l) => `Date: ${l}`} />
              <Legend />
              <Area type="monotone" dataKey="deposits" stroke="#10b981" fill="url(#colorDeposits)" strokeWidth={2} name="Deposits" />
              <Area type="monotone" dataKey="withdrawals" stroke="#8b5cf6" fill="url(#colorWithdrawals)" strokeWidth={2} name="Withdrawals" />
              <Area type="monotone" dataKey="sells" stroke="#06b6d4" fill="url(#colorSells)" strokeWidth={2} name="Sells" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className=" border border-slate-200/70 bg-white/85 p-5 shadow-[0_16px_34px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="mb-4">
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-teal-700">Growth</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">New User Registrations</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip labelFormatter={(l) => `Date: ${l}`} />
              <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} name="New Users" />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className=" border border-slate-200 bg-slate-50/80 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Approved Treasury</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">${(stats.totalDepositAmount - stats.totalWithdrawalAmount).toFixed(2)}</p>
            </div>
            <div className=" border border-slate-200 bg-slate-50/80 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Sell Throughput</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">${stats.totalSellAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
