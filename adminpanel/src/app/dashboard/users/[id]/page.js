'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { ArrowLeft, Phone, Wallet, Calendar } from 'lucide-react';

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

function formatMoney(value) {
  return moneyFormatter.format(Number(value || 0));
}

function formatMoneyOrDash(value) {
  return value == null ? '-' : formatMoney(value);
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

function sortByCreatedAt(items = [], sortOrder = 'desc') {
  return [...items].sort((left, right) => {
    const leftTime = new Date(left.createdAt).getTime();
    const rightTime = new Date(right.createdAt).getTime();
    return sortOrder === 'asc' ? leftTime - rightTime : rightTime - leftTime;
  });
}

function getWalletSourceLabel(source) {
  const labels = {
    ADJUSTMENT: 'Manual Adjustment',
    DEPOSIT: 'Deposit Approval',
    SELL: 'Sell Approval',
    WITHDRAWAL: 'Withdrawal Approval',
    REFERRAL: 'Referral Reward',
  };
  return labels[source] || source;
}

function StatusBadge({ status }) {
  const styles = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.PENDING}`}>
      {status}
    </span>
  );
}

function WalletTypeBadge({ type }) {
  const styles = {
    CREDIT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DEBIT: 'bg-red-50 text-red-700 border-red-200',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[type] || styles.CREDIT}`}>
      {type}
    </span>
  );
}

function TabButton({ active, label, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-medium transition ${active
        ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'}`}
    >
      {label}
      {typeof count === 'number' && <span className={`ml-2 text-xs ${active ? 'text-blue-100' : 'text-gray-400'}`}>{count}</span>}
    </button>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-white p-10 text-center shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-500">{description}</p>
    </div>
  );
}

function SummaryCard({ label, value, meta }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-2 text-xl font-bold text-gray-900">{value}</p>
      {meta ? <p className="mt-1 text-xs text-gray-500">{meta}</p> : null}
    </div>
  );
}

export default function UserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('wallet');
  const [sortOrder, setSortOrder] = useState('desc');
  const [savingAdjustment, setSavingAdjustment] = useState(false);
  const [walletForm, setWalletForm] = useState({
    type: 'CREDIT',
    amount: '',
    remarks: '',
    source: 'ADJUSTMENT',
  });

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/admin/users/${id}`);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error || 'Failed to load user details');
        setUser(null);
        return;
      }

      setUser(data.user);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load user details');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const sortedCollections = useMemo(() => {
    if (!user) {
      return {
        bankCards: [],
        cryptoWallets: [],
        deposits: [],
        sells: [],
        withdrawals: [],
        walletHistories: [],
      };
    }

    return {
      bankCards: sortByCreatedAt(user.bankCards, sortOrder),
      cryptoWallets: sortByCreatedAt(user.cryptoWallets, sortOrder),
      deposits: sortByCreatedAt(user.deposits, sortOrder),
      sells: sortByCreatedAt(user.sells, sortOrder),
      withdrawals: sortByCreatedAt(user.withdrawals, sortOrder),
      walletHistories: sortByCreatedAt(user.walletHistories, sortOrder),
    };
  }, [user, sortOrder]);

  const tabs = useMemo(() => ([
    { id: 'wallet', label: 'Wallet' },
    { id: 'bankCards', label: 'Bank Cards', count: user?.bankCards?.length || 0 },
    { id: 'cryptoWallets', label: 'Crypto Wallets', count: user?.cryptoWallets?.length || 0 },
    { id: 'deposits', label: 'Deposits', count: user?.deposits?.length || 0 },
    { id: 'sells', label: 'Sells', count: user?.sells?.length || 0 },
    { id: 'withdrawals', label: 'Withdrawals', count: user?.withdrawals?.length || 0 },
    { id: 'walletHistory', label: 'Wallet History', count: user?.walletHistories?.length || 0 },
  ]), [user]);

  async function handleWalletAdjustment(event) {
    event.preventDefault();
    const numericAmount = Number.parseFloat(walletForm.amount);
    const remarks = walletForm.remarks.trim();

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      toast.warning('Enter a valid wallet amount');
      return;
    }

    if (!remarks) {
      toast.warning('Remarks are required');
      return;
    }

    setSavingAdjustment(true);
    try {
      const res = await apiFetch(`/api/admin/users/${id}/wallet-adjustments`, {
        method: 'POST',
        body: JSON.stringify({
          type: walletForm.type,
          amount: numericAmount,
          remarks,
          source: walletForm.source,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || 'Failed to update wallet');
        return;
      }

      toast.success(data.message || 'Wallet updated successfully');
      setWalletForm({ type: 'CREDIT', amount: '', remarks: '', source: 'ADJUSTMENT' });
      setActiveTab('walletHistory');
      await fetchUser();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update wallet');
    } finally {
      setSavingAdjustment(false);
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  }

  if (!user) {
    return <div className="text-center text-gray-500 mt-10">User not found</div>;
  }

  return (
    <div className="space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition">
        <ArrowLeft size={16} /> Back to Users
      </button>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600">
            {user.phone?.[0] || '?'}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">{user.phone}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1"><Phone size={14} />{user.phone}</span>
              <span className="flex items-center gap-1"><Calendar size={14} />Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Wallet Balance</p>
            <p className="text-2xl font-bold text-gray-900">{formatMoney(user.walletBalance)}</p>
            <code className="text-xs bg-gray-100 px-2 py-0.5 rounded mt-1 inline-block">Ref: {user.referralCode}</code>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <SummaryCard label="Balance" value={formatMoney(user.walletBalance)} meta="Current available wallet" />
        <SummaryCard label="Bank Cards" value={user.bankCards?.length || 0} meta="Saved payout accounts" />
        <SummaryCard label="Crypto Wallets" value={user.cryptoWallets?.length || 0} meta="Linked withdrawal wallets" />
        <SummaryCard label="Deposits" value={user.deposits?.length || 0} meta="Sorted by activity date" />
        <SummaryCard label="Sells" value={user.sells?.length || 0} meta="Sorted by activity date" />
        <SummaryCard label="Wallet History" value={user.walletHistories?.length || 0} meta="Credits, debits, remarks" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                label={tab.label}
                count={tab.count}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1 self-start">
            <button
              type="button"
              onClick={() => setSortOrder('desc')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${sortOrder === 'desc' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Newest first
            </button>
            <button
              type="button"
              onClick={() => setSortOrder('asc')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${sortOrder === 'asc' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Oldest first
            </button>
          </div>
        </div>

        {activeTab === 'wallet' ? (
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">Wallet Control</p>
                  <h3 className="mt-1 text-2xl font-bold text-gray-900">{formatMoney(user.walletBalance)}</h3>
                  <p className="mt-2 text-sm text-gray-500">Use manual credit or debit only when you need an admin-side correction. Every change is stored with remarks in wallet history.</p>
                </div>
                <div className="rounded-xl bg-white px-4 py-3 text-right shadow-sm border border-gray-100">
                  <p className="text-xs uppercase tracking-wide text-gray-400">Last Wallet Event</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">{sortedCollections.walletHistories[0] ? getWalletSourceLabel(sortedCollections.walletHistories[0].source) : 'No history yet'}</p>
                  <p className="mt-1 text-xs text-gray-500">{sortedCollections.walletHistories[0] ? formatDate(sortedCollections.walletHistories[0].createdAt) : 'No wallet movement recorded'}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-3">
                <SummaryCard label="Joined" value={new Date(user.createdAt).toLocaleDateString()} meta="Account creation date" />
                <SummaryCard label="Referral Code" value={user.referralCode} meta="User invite code" />
                <SummaryCard label="Withdrawals" value={user.withdrawals?.length || 0} meta="Approved, pending and rejected" />
              </div>
            </div>

            <form onSubmit={handleWalletAdjustment} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Edit Wallet</h3>
                <p className="mt-1 text-sm text-gray-500">Apply a credit or debit with a clear admin remark.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <label className="space-y-2 text-sm font-medium text-gray-700">
                  <span>Action</span>
                  <select
                    value={walletForm.type}
                    onChange={(event) => setWalletForm((current) => ({ ...current, type: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="CREDIT">Credit</option>
                    <option value="DEBIT">Debit</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-gray-700">
                  <span>Source</span>
                  <select
                    value={walletForm.source}
                    onChange={(event) => setWalletForm((current) => ({ ...current, source: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="ADJUSTMENT">Manual Adjustment</option>
                    <option value="REFERRAL_BONUS">Referral Bonus</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm font-medium text-gray-700">
                  <span>Amount</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={walletForm.amount}
                    onChange={(event) => setWalletForm((current) => ({ ...current, amount: event.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="0.00"
                  />
                </label>
              </div>

              <label className="block space-y-2 text-sm font-medium text-gray-700">
                <span>Remarks</span>
                <textarea
                  rows={4}
                  value={walletForm.remarks}
                  onChange={(event) => setWalletForm((current) => ({ ...current, remarks: event.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Explain why this credit or debit is being applied"
                />
              </label>

              <button
                type="submit"
                disabled={savingAdjustment}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingAdjustment ? 'Saving...' : walletForm.type === 'CREDIT' ? 'Credit Wallet' : 'Debit Wallet'}
              </button>
            </form>
          </div>
        ) : null}

        {activeTab === 'bankCards' ? (
          sortedCollections.bankCards.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {sortedCollections.bankCards.map((bankCard) => (
                <div key={bankCard.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-gray-900">{bankCard.payeeName}</p>
                      <p className="mt-1 text-sm text-gray-500">{bankCard.accountNo} · {bankCard.ifsc}</p>
                    </div>
                    {bankCard.isSelected ? <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">Selected</span> : null}
                  </div>
                  <p className="mt-3 text-xs text-gray-400">{bankCard.bankName || 'Bank name not provided'}</p>
                  <p className="mt-4 text-xs text-gray-400">Added {formatDate(bankCard.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No bank cards" description="This user has not added any bank payout cards yet." />
          )
        ) : null}

        {activeTab === 'cryptoWallets' ? (
          sortedCollections.cryptoWallets.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {sortedCollections.cryptoWallets.map((walletItem) => (
                <div key={walletItem.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                  <p className="text-base font-semibold text-gray-900">{walletItem.network} ({walletItem.currency})</p>
                  <p className="mt-2 break-all text-sm text-gray-500">{walletItem.address}</p>
                  <p className="mt-4 text-xs text-gray-400">Added {formatDate(walletItem.createdAt)}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No crypto wallets" description="This user has not added any crypto wallet addresses yet." />
          )
        ) : null}

        {activeTab === 'deposits' ? (
          <TxTable
            title="Deposits"
            items={sortedCollections.deposits}
            type="deposit"
            emptyTitle="No deposits"
            emptyDescription="No deposit requests are available for this user."
            columns={[
              { key: 'referenceId', label: 'Ref ID' },
              { key: 'amount', label: 'Amount', render: (value) => formatMoney(value) },
              { key: 'network', label: 'Network' },
              { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
              { key: 'createdAt', label: 'Date', render: (value) => formatDate(value) },
            ]}
          />
        ) : null}

        {activeTab === 'sells' ? (
          <TxTable
            title="Sells"
            items={sortedCollections.sells}
            type="sell"
            emptyTitle="No sells"
            emptyDescription="No sell requests are available for this user."
            columns={[
              { key: 'referenceId', label: 'Ref ID' },
              { key: 'amount', label: 'Amount', render: (value) => formatMoney(value) },
              { key: 'paymentMethod', label: 'Method', render: (value) => value || '-' },
              { key: 'payeeName', label: 'Bank', render: (value, item) => value || item.bankName || '-' },
              { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
              { key: 'createdAt', label: 'Date', render: (value) => formatDate(value) },
            ]}
          />
        ) : null}

        {activeTab === 'withdrawals' ? (
          <TxTable
            title="Withdrawals"
            items={sortedCollections.withdrawals}
            type="withdrawal"
            emptyTitle="No withdrawals"
            emptyDescription="No withdrawal requests are available for this user."
            columns={[
              { key: 'referenceId', label: 'Ref ID' },
              { key: 'amount', label: 'Amount', render: (value) => formatMoney(value) },
              { key: 'currency', label: 'Currency', render: (value) => value || 'USDT' },
              { key: 'network', label: 'Network' },
              { key: 'status', label: 'Status', render: (value) => <StatusBadge status={value} /> },
              { key: 'createdAt', label: 'Date', render: (value) => formatDate(value) },
            ]}
          />
        ) : null}

        {activeTab === 'walletHistory' ? (
          <WalletHistoryTable items={sortedCollections.walletHistories} />
        ) : null}
      </div>
    </div>
  );
}

function TxTable({ title, items, columns, type, emptyTitle, emptyDescription }) {
  const detailPath = type === 'deposit' ? 'deposits' : type === 'sell' ? 'sells' : 'withdrawals';
  if (!items.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              {columns.map((c) => (
                <th key={c.key} className="text-left px-4 py-2.5 font-semibold text-gray-600">{c.label}</th>
              ))}
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Details</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-2.5">{c.render ? c.render(item[c.key], item) : item[c.key]}</td>
                ))}
                <td className="px-4 py-2.5">
                  <Link href={`/dashboard/${detailPath}/${item.id}`} className="text-blue-600 hover:underline text-xs">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WalletHistoryTable({ items }) {
  if (!items.length) {
    return <EmptyState title="No wallet history" description="Wallet changes will appear here after credits, debits, deposits, sells, withdrawals or referral rewards." />;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold">Wallet History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Date</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Type</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Source</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Amount</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Before</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">After</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Reference</th>
              <th className="text-left px-4 py-2.5 font-semibold text-gray-600">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                <td className="px-4 py-2.5 whitespace-nowrap">{formatDate(item.createdAt)}</td>
                <td className="px-4 py-2.5"><WalletTypeBadge type={item.type} /></td>
                <td className="px-4 py-2.5">{getWalletSourceLabel(item.source)}</td>
                <td className={`px-4 py-2.5 font-semibold ${item.type === 'CREDIT' ? 'text-emerald-700' : 'text-red-700'}`}>
                  {item.type === 'CREDIT' ? '+' : '-'}{formatMoney(item.amount)}
                </td>
                <td className="px-4 py-2.5">{formatMoneyOrDash(item.balanceBefore)}</td>
                <td className="px-4 py-2.5">{formatMoneyOrDash(item.balanceAfter)}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{item.referenceId || '-'}</td>
                <td className="px-4 py-2.5 text-gray-600 min-w-65">{item.remarks || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
