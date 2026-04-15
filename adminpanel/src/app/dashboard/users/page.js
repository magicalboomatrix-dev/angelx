'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { exportToCSV } from '@/lib/export';
import { useToast } from '@/components/ToastProvider';
import { Search, Download, ChevronUp, ChevronDown } from 'lucide-react';

function SortHeader({ label, field, sortBy, sortOrder, onSort, align }) {
  const active = sortBy === field;
  return (
    <th className={`border-b border-slate-200/80 px-4 py-3 text-[0.76rem] font-bold uppercase tracking-[0.03em] text-slate-500 ${align === 'right' ? 'text-right' : 'text-left'} cursor-pointer select-none hover:text-slate-900 transition`}
      onClick={() => onSort(field)}>
      <span className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
        {label}
        <span className="flex flex-col">
          <ChevronUp size={10} className={active && sortOrder === 'asc' ? 'text-gray-900' : 'text-gray-300'} />
          <ChevronDown size={10} className={active && sortOrder === 'desc' ? 'text-gray-900' : 'text-gray-300'} />
        </span>
      </span>
    </th>
  );
}

export default function UsersPage() {
  const router = useRouter();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const fetchUsers = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 20, sortBy, sortOrder });
      if (search) params.set('search', search);

      const res = await apiFetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setTotal(data.total);
        setPage(p);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, sortOrder]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder((o) => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('desc'); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleExport = () => {
    exportToCSV(users, [
      { key: 'id', label: 'ID' },
      { key: 'phone', label: 'Phone' },
      { key: 'walletBalance', label: 'Balance' },
      { key: 'referralCode', label: 'Referral Code' },
      { key: 'referredBy', label: 'Referred By' },
      { key: 'createdAt', label: 'Joined', csvRender: (v) => new Date(v).toLocaleDateString() },
    ], 'users');
    toast.info('CSV exported');
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-teal-700">Client Directory</p>
          <h1 className="text-[clamp(1.7rem,2vw,2.4rem)] font-bold leading-tight text-slate-900">Users</h1>
          <p className="max-w-3xl text-sm text-slate-500 sm:text-[0.95rem]">Search active accounts, inspect balances, and jump directly into user-level activity management.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <form onSubmit={handleSearch} className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search phone..." value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="min-h-11.5 w-full  border border-slate-300/70 bg-white/90 py-3 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-sky-400/70 focus:ring-4 focus:ring-sky-100" />
          </form>
          <button onClick={handleExport} className="inline-flex h-11 w-11 items-center justify-center  border border-slate-300/70 bg-white/90 text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-50" title="Export CSV">
            <Download size={16} />
          </button>
        </div>
      </div>

      <section className="relative overflow-hidden  border border-white/15 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.18),transparent_24%),linear-gradient(135deg,#0f172a_0%,#182642_42%,#125b72_100%)] p-6 text-white shadow-[0_28px_60px_rgba(15,23,42,0.28)] lg:p-8">
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Directory Snapshot</p>
            <h2 className="mt-3 text-3xl font-semibold">{total} accounts under management</h2>
            <p className="mt-3 max-w-xl text-sm text-slate-200/85">Sort by balance, join date, or id, then open any user to review wallet history, bank cards, and recent transactions.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className=" border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Current page</p>
              <p className="mt-2 text-2xl font-semibold">{page}</p>
            </div>
            <div className=" border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Sort mode</p>
              <p className="mt-2 text-lg font-semibold">{sortBy} · {sortOrder}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-hidden  border border-slate-200/70 bg-white/85 shadow-[0_16px_34px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-180 w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-[linear-gradient(180deg,rgba(244,247,251,0.95)_0%,rgba(237,242,247,0.92)_100%)]">
                <SortHeader label="ID" field="id" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <th className="border-b border-slate-200/80 px-4 py-3 text-left text-[0.76rem] font-bold uppercase tracking-[0.03em] text-slate-500">Phone</th>
                <SortHeader label="Balance" field="walletBalance" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} align="right" />
                <th className="border-b border-slate-200/80 px-4 py-3 text-left text-[0.76rem] font-bold uppercase tracking-[0.03em] text-slate-500">Referral Code</th>
                <SortHeader label="Joined" field="createdAt" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">No users found</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="cursor-pointer transition hover:bg-slate-50/80"
                    onClick={() => router.push(`/dashboard/users/${user.id}`)}>
                    <td className="border-b border-slate-200/80 px-4 py-4 text-slate-400">#{user.id}</td>
                    <td className="border-b border-slate-200/80 px-4 py-4 font-medium text-slate-900">{user.phone}</td>
                    <td className="border-b border-slate-200/80 px-4 py-4 text-right font-semibold text-slate-900">${user.walletBalance.toFixed(2)}</td>
                    <td className="border-b border-slate-200/80 px-4 py-4"><code className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{user.referralCode}</code></td>
                    <td className="border-b border-slate-200/80 px-4 py-4 text-xs text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 px-4 py-4">
            <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => fetchUsers(page - 1)} disabled={page <= 1} className="inline-flex items-center justify-center gap-2  border border-slate-300/70 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
              <button onClick={() => fetchUsers(page + 1)} disabled={page >= totalPages} className="inline-flex items-center justify-center gap-2  border border-slate-300/70 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
