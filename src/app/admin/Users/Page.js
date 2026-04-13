'use client';

import Link from 'next/link';
import { useDeferredValue, useEffect, useState } from 'react';
import { Search, Users, WalletCards } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { AdminEmptyState, AdminMetricCard, AdminPageHeader, AdminSurface, formatAdminDate, formatAdminMoney } from '../components/admin-kit';

export default function AdminUsersDirectoryPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch]);

  useEffect(() => {
    let cancelled = false;

    async function loadUsers() {
      setLoading(true);
      try {
        const query = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
          search: deferredSearch,
        });
        const response = await fetch(`/api/admin/users?${query.toString()}`, { cache: 'no-store' });
        const data = await response.json();
        if (!cancelled && response.ok) {
          setUsers(Array.isArray(data.users) ? data.users : []);
          setTotal(Number(data.total || 0));
        }
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUsers();

    return () => {
      cancelled = true;
    };
  }, [deferredSearch, page, pageSize]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="User directory"
        description="Search users instantly by mobile number, open a full detail page, and manage linked payout or crypto wallet records."
        actions={
          <div className="relative w-full min-w-65 max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search mobile" className="pl-11" />
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminMetricCard label="Matched users" value={total} detail="Search results across registered mobile numbers." icon={Users} tone="slate" />
        <AdminMetricCard label="Page size" value={pageSize} detail="Users shown per page for quick review without overload." icon={Search} tone="cyan" />
        <AdminMetricCard label="Current page" value={page} detail="Use pagination to move through the full customer directory." icon={WalletCards} tone="emerald" />
      </div>

      <AdminSurface title="Customer accounts" description="Open any user to edit identity fields, linked accounts, and wallet-related records.">
        {loading ? (
          <div className=" border border-dashed border-slate-200 bg-slate-50/80 px-5 py-12 text-center text-sm text-slate-500">Loading users...</div>
        ) : users.length === 0 ? (
          <AdminEmptyState title="No users found" description="Try a different search term or clear the filter to view the full customer base." />
        ) : (
          <div className="overflow-x-auto admin-scrollbar">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Contact</th>
                  <th className="px-4 py-3 font-semibold">Wallet</th>
                  <th className="px-4 py-3 font-semibold">Linked accounts</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center  bg-slate-100 font-semibold text-slate-700">
                          {(user.mobile || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{user.mobile ? `+91 ${user.mobile}` : 'Unknown user'}</p>
                          <p className="text-xs text-slate-500">User #{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900">{user.mobile ? `+91 ${user.mobile}` : 'No mobile'}</p>
                      <p className="text-xs text-slate-500">OTP login account</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">${formatAdminMoney(user.wallet?.usdtAvailable)}</p>
                      <p className="text-xs text-slate-500">Locked ${formatAdminMoney(user.wallet?.usdtLocked)}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      <p>{user.bankCards?.length || 0} bank account(s)</p>
                      <p className="text-xs text-slate-500">{user.cryptoWallets?.length || 0} crypto wallet(s)</p>
                    </td>
                    <td className="px-4 py-4 text-slate-500">{formatAdminDate(user.createdAt)}</td>
                    <td className="px-4 py-4 text-right">
                      <Button asChild variant="secondary">
                        <Link href={`/admin/users/${user.id}`}>Open profile</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-4  border border-slate-200/80 bg-slate-50/70 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-500">Page {page} of {Math.max(1, Math.ceil(total / pageSize))}</p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1}>Previous</Button>
            <Button variant="secondary" onClick={() => setPage((current) => current + 1)} disabled={page * pageSize >= total}>Next</Button>
          </div>
        </div>
      </AdminSurface>
    </div>
  );
}