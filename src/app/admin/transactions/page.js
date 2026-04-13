'use client';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Filter, ListFilter, Search, TimerReset } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { AdminEmptyState, AdminMetricCard, AdminPageHeader, AdminSurface, StatusBadge, formatAdminDate, formatAdminMoney } from '../components/admin-kit';

const PAGE_SIZE = 20;

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, status, type]);

  useEffect(() => {
    let cancelled = false;

    async function loadTransactions() {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: String(page),
          pageSize: String(PAGE_SIZE),
          search: deferredSearch,
          type,
          status,
        });
        const response = await fetch(`/api/admin/transactions?${query.toString()}`, { cache: 'no-store' });
        const data = await response.json();
        if (!cancelled && response.ok) {
          setTransactions(Array.isArray(data.transactions) ? data.transactions : []);
          setTotal(Number(data.total || 0));
        }
      } catch (error) {
        console.error('Failed to load transactions:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTransactions();
    return () => {
      cancelled = true;
    };
  }, [deferredSearch, page, status, type]);

  const pendingCount = useMemo(() => transactions.filter((item) => item.status === 'PENDING').length, [transactions]);
  const currentPageTotal = useMemo(() => transactions.reduce((sum, item) => sum + Number(item.amount || 0), 0), [transactions]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Transaction feed"
        description="Search and filter the full admin ledger across deposits and withdrawals to investigate platform activity quickly."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminMetricCard label="Matched records" value={total} detail="Total records returned by the current filters." icon={ListFilter} tone="slate" />
        <AdminMetricCard label="Pending on page" value={pendingCount} detail="Open items visible in the current result window." icon={TimerReset} tone="amber" />
        <AdminMetricCard label="Page value" value={`$${formatAdminMoney(currentPageTotal)}`} detail="Combined amount represented in the current page of results." icon={Filter} tone="cyan" />
      </div>

      <AdminSurface title="Filter transactions" description="Search by reference or user mobile, then narrow by type or settlement status.">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_200px_200px_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reference or mobile" className="pl-11" />
          </div>
          <select value={type} onChange={(event) => setType(event.target.value)} className="h-11  border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
            <option value="">All types</option>
            <option value="DEPOSIT">Deposit</option>
            <option value="SELL">Withdrawal</option>
            <option value="WITHDRAW">Withdraw</option>
            <option value="BUY">Buy</option>
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-11  border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SUCCESS">Success</option>
            <option value="REJECTED">Rejected</option>
            <option value="FAILED">Failed</option>
          </select>
          <Button variant="secondary" onClick={() => { setSearch(''); setType(''); setStatus(''); }}>Reset filters</Button>
        </div>
      </AdminSurface>

      <AdminSurface title="Results" description="Sorted by most recent activity first.">
        {loading ? (
          <div className=" border border-dashed border-slate-200 bg-slate-50/80 px-5 py-12 text-center text-sm text-slate-500">Loading transactions...</div>
        ) : transactions.length === 0 ? (
          <AdminEmptyState title="No transactions match these filters" description="Try clearing the search or broadening the selected status and type." />
        ) : (
          <div className="overflow-x-auto admin-scrollbar">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Network</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900">{transaction.referenceId}</p>
                      <p className="text-xs text-slate-500">{transaction.description || 'No description'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900">{transaction.user?.mobile ? `+91 ${transaction.user.mobile}` : 'Unknown user'}</p>
                      <p className="text-xs text-slate-500">{transaction.user?.id ? `User #${transaction.user.id}` : 'No user id'}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-700">{transaction.type}</td>
                    <td className="px-4 py-4"><StatusBadge status={transaction.status} /></td>
                    <td className="px-4 py-4 font-semibold text-slate-900">${formatAdminMoney(transaction.amount)}</td>
                    <td className="px-4 py-4 text-slate-500">{transaction.network || 'N/A'}</td>
                    <td className="px-4 py-4 text-slate-500">{formatAdminDate(transaction.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4  border border-slate-200/80 bg-slate-50/70 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">Page {page} of {Math.max(1, Math.ceil(total / PAGE_SIZE))}</p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}>Previous</Button>
            <Button variant="secondary" onClick={() => setPage((current) => current + 1)} disabled={page * PAGE_SIZE >= total}>Next</Button>
          </div>
        </div>
      </AdminSurface>
    </div>
  );
}