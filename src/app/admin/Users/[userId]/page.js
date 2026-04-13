'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Landmark, Plus, Wallet, WalletCards } from 'lucide-react';

import { useToast } from '@/app/components/ToastProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { AdminEmptyState, AdminKeyValueList, AdminMetricCard, AdminPageHeader, AdminSurface, StatusBadge, formatAdminDate, formatAdminMoney } from '../../components/admin-kit';

function createEmptyBankCard() {
  return {
    id: null,
    bankName: '',
    accountNo: '',
    ifsc: '',
    payeeName: '',
    isSelected: false,
  };
}

function createEmptyCryptoWallet() {
  return {
    id: null,
    address: '',
    network: 'TRC20',
    label: '',
    currency: 'USDT',
    isSelected: false,
  };
}

function mapUserToForm(user) {
  return {
    mobile: user?.mobile || '',
    bankCards: Array.isArray(user?.bankCards) && user.bankCards.length ? user.bankCards : [createEmptyBankCard()],
    cryptoWallets: Array.isArray(user?.cryptoWallets) && user.cryptoWallets.length ? user.cryptoWallets : [createEmptyCryptoWallet()],
  };
}

export default function AdminUserDetailPage() {
  const { showToast } = useToast();
  const params = useParams();
  const userId = params?.userId;

  const [user, setUser] = useState(null);
  const [form, setForm] = useState(mapUserToForm(null));
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('CREDIT');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjustingWallet, setAdjustingWallet] = useState(false);

  useEffect(() => {
    if (!userId) {
      return;
    }

    let cancelled = false;

    async function loadUser() {
      setLoading(true);
      try {
        const response = await fetch(`/api/admin/users/${userId}`, { cache: 'no-store' });
        const data = await response.json();
        if (!cancelled && response.ok) {
          setUser(data.user);
          setForm(mapUserToForm(data.user));
        } else if (!cancelled) {
          showToast(data.error || 'Failed to load user', 'error');
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        if (!cancelled) {
          showToast('Failed to load user', 'error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, [showToast, userId]);

  const updateBankCard = (index, key, value) => {
    setForm((current) => ({
      ...current,
      bankCards: current.bankCards.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return key === 'isSelected' && value ? { ...item, isSelected: false } : item;
        }

        return { ...item, [key]: value };
      }),
    }));
  };

  const updateCryptoWallet = (index, key, value) => {
    setForm((current) => ({
      ...current,
      cryptoWallets: current.cryptoWallets.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return key === 'isSelected' && value ? { ...item, isSelected: false } : item;
        }

        return { ...item, [key]: value };
      }),
    }));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const payload = {
        mobile: form.mobile,
        bankCards: form.bankCards.filter((item) => item.accountNo || item.ifsc || item.payeeName || item.bankName),
        cryptoWallets: form.cryptoWallets.filter((item) => item.address),
      };

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        showToast(data.error || 'Failed to save user', 'error');
        return;
      }

      setUser(data.user);
      setForm(mapUserToForm(data.user));
      showToast('User profile updated', 'success');
    } catch (error) {
      console.error('Failed to save user:', error);
      showToast('Failed to save user', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleWalletAdjustment = async () => {
    if (!adjustmentAmount) {
      showToast('Enter an adjustment amount', 'error');
      return;
    }

    setAdjustingWallet(true);
    try {
      const response = await fetch('/api/admin/users/adjust-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: adjustmentAmount,
          type: adjustmentType,
          reason: adjustmentReason,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || 'Failed to adjust wallet', 'error');
        return;
      }

      setUser((current) => ({ ...current, wallet: data.wallet }));
      setAdjustmentAmount('');
      setAdjustmentReason('');
      showToast('Wallet updated', 'success');
    } catch (error) {
      console.error('Failed to adjust wallet:', error);
      showToast('Failed to adjust wallet', 'error');
    } finally {
      setAdjustingWallet(false);
    }
  };

  if (loading) {
    return <div className=" border border-dashed border-slate-200 bg-white/70 px-6 py-14 text-center text-sm text-slate-500">Loading user profile...</div>;
  }

  if (!user) {
    return <AdminEmptyState title="User not found" description="This account may have been removed or the requested id is invalid." action={<Button asChild variant="secondary"><Link href="/admin/Users">Back to users</Link></Button>} />;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={user.mobile ? `+91 ${user.mobile}` : `User #${user.id}`}
        description="Edit account information, manage linked bank or crypto wallets, and make wallet balance adjustments from one record."
        actions={<Button asChild variant="secondary"><Link href="/admin/Users">Back to users</Link></Button>}
      />

      <div className="grid gap-4 md:grid-cols-4">
        <AdminMetricCard label="Available" value={`$${formatAdminMoney(user.wallet?.usdtAvailable)}`} detail="Spendable balance currently in the user wallet." icon={Wallet} tone="slate" />
        <AdminMetricCard label="Locked" value={`$${formatAdminMoney(user.wallet?.usdtLocked)}`} detail="Funds reserved for pending sell settlements." icon={WalletCards} tone="cyan" />
        <AdminMetricCard label="Deposited" value={`$${formatAdminMoney(user.wallet?.usdtDeposited)}`} detail="Cumulative approved deposit value." icon={Landmark} tone="emerald" />
        <AdminMetricCard label="Withdrawn" value={`$${formatAdminMoney(user.wallet?.usdtWithdrawn)}`} detail="Completed sell and withdrawal value settled from the wallet." icon={Wallet} tone="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <AdminSurface title="User profile" description="Primary login mobile and account metadata used across the platform.">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Mobile</label>
              <Input value={form.mobile} onChange={(event) => setForm((current) => ({ ...current, mobile: event.target.value }))} placeholder="9876543210" />
            </div>
          </div>

          <div className="mt-6">
            <AdminKeyValueList compact items={[
              { label: 'User id', value: `#${user.id}` },
              { label: 'Created', value: formatAdminDate(user.createdAt) },
              { label: 'Last updated', value: formatAdminDate(user.updatedAt) },
              { label: 'Wallet updated', value: formatAdminDate(user.wallet?.updatedAt) },
            ]} />
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveProfile} disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save profile changes'}</Button>
          </div>
        </AdminSurface>

        <AdminSurface title="Wallet adjustment" description="Credit or debit the available balance with an audited reason.">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant={adjustmentType === 'CREDIT' ? 'success' : 'secondary'} onClick={() => setAdjustmentType('CREDIT')}>Credit</Button>
            <Button variant={adjustmentType === 'DEBIT' ? 'destructive' : 'secondary'} onClick={() => setAdjustmentType('DEBIT')}>Debit</Button>
          </div>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Amount</label>
              <Input type="number" min="0" step="0.01" value={adjustmentAmount} onChange={(event) => setAdjustmentAmount(event.target.value)} placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Reason</label>
              <Textarea value={adjustmentReason} onChange={(event) => setAdjustmentReason(event.target.value)} placeholder="Explain the adjustment for the audit trail" />
            </div>
            <Button className="w-full" onClick={handleWalletAdjustment} disabled={adjustingWallet}>{adjustingWallet ? 'Updating wallet...' : 'Apply wallet adjustment'}</Button>
          </div>
        </AdminSurface>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminSurface
          title="Bank accounts"
          description="Edit payout accounts and choose the selected destination account."
          action={<Button variant="secondary" onClick={() => setForm((current) => ({ ...current, bankCards: [...current.bankCards, createEmptyBankCard()] }))}><Plus className="h-4 w-4" /> Add bank</Button>}
        >
          <div className="space-y-4">
            {form.bankCards.map((bankCard, index) => (
              <div key={bankCard.id || `bank-${index}`} className=" border border-slate-200/80 bg-slate-50/70 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">Bank account {index + 1}</p>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      <input type="checkbox" checked={Boolean(bankCard.isSelected)} onChange={(event) => updateBankCard(index, 'isSelected', event.target.checked)} />
                      Selected
                    </label>
                    <Button variant="ghost" onClick={() => setForm((current) => {
                      const nextBankCards = current.bankCards.filter((_, itemIndex) => itemIndex !== index);
                      return { ...current, bankCards: nextBankCards.length ? nextBankCards : [createEmptyBankCard()] };
                    })}>Remove</Button>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Bank name</label>
                    <Input value={bankCard.bankName || ''} onChange={(event) => updateBankCard(index, 'bankName', event.target.value)} placeholder="HDFC Bank" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Payee name</label>
                    <Input value={bankCard.payeeName || ''} onChange={(event) => updateBankCard(index, 'payeeName', event.target.value)} placeholder="Account holder name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Account number</label>
                    <Input value={bankCard.accountNo || ''} onChange={(event) => updateBankCard(index, 'accountNo', event.target.value)} placeholder="Account number" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">IFSC</label>
                    <Input value={bankCard.ifsc || ''} onChange={(event) => updateBankCard(index, 'ifsc', event.target.value.toUpperCase())} placeholder="IFSC code" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AdminSurface>

        <AdminSurface
          title="Crypto wallets"
          description="Edit linked user wallet addresses and mark the preferred selection."
          action={<Button variant="secondary" onClick={() => setForm((current) => ({ ...current, cryptoWallets: [...current.cryptoWallets, createEmptyCryptoWallet()] }))}><Plus className="h-4 w-4" /> Add wallet</Button>}
        >
          <div className="space-y-4">
            {form.cryptoWallets.map((cryptoWallet, index) => (
              <div key={cryptoWallet.id || `wallet-${index}`} className=" border border-slate-200/80 bg-slate-50/70 p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">Wallet {index + 1}</p>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      <input type="checkbox" checked={Boolean(cryptoWallet.isSelected)} onChange={(event) => updateCryptoWallet(index, 'isSelected', event.target.checked)} />
                      Selected
                    </label>
                    <Button variant="ghost" onClick={() => setForm((current) => {
                      const nextCryptoWallets = current.cryptoWallets.filter((_, itemIndex) => itemIndex !== index);
                      return { ...current, cryptoWallets: nextCryptoWallets.length ? nextCryptoWallets : [createEmptyCryptoWallet()] };
                    })}>Remove</Button>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Wallet address</label>
                    <Input value={cryptoWallet.address || ''} onChange={(event) => updateCryptoWallet(index, 'address', event.target.value)} placeholder="Wallet address" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Network</label>
                    <Input value={cryptoWallet.network || ''} onChange={(event) => updateCryptoWallet(index, 'network', event.target.value.toUpperCase())} placeholder="TRC20" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Currency</label>
                    <Input value={cryptoWallet.currency || ''} onChange={(event) => updateCryptoWallet(index, 'currency', event.target.value.toUpperCase())} placeholder="USDT" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Label</label>
                    <Input value={cryptoWallet.label || ''} onChange={(event) => updateCryptoWallet(index, 'label', event.target.value)} placeholder="Main payout wallet" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={handleSaveProfile} disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save linked accounts'}</Button>
          </div>
        </AdminSurface>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminSurface title="Recent transactions" description="Latest platform transactions tied to this user record.">
          {user.transactions?.length ? (
            <div className="space-y-3">
              {user.transactions.map((transaction) => (
                <div key={transaction.id} className=" border border-slate-200/80 bg-slate-50/80 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{transaction.referenceId}</p>
                      <p className="mt-1 text-sm text-slate-500">{transaction.type} · {formatAdminDate(transaction.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={transaction.status} />
                      <p className="text-sm font-semibold text-slate-900">${formatAdminMoney(transaction.amount)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AdminEmptyState title="No transaction history" description="Transactions will appear here once this user starts depositing or selling USDT." />
          )}
        </AdminSurface>

        <AdminSurface title="Wallet ledger" description="Recent balance-affecting ledger entries for this user.">
          {user.walletLedger?.length ? (
            <div className="space-y-3">
              {user.walletLedger.map((entry) => (
                <div key={entry.id} className=" border border-slate-200/80 bg-slate-50/80 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{entry.type}</p>
                      <p className="mt-1 text-sm text-slate-500">{entry.referenceId || 'No reference'} · {formatAdminDate(entry.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{entry.amount >= 0 ? '+' : ''}{formatAdminMoney(entry.amount)} USDT</p>
                      <p className="mt-1 text-xs text-slate-500">Balance after {formatAdminMoney(entry.balanceAfter)} USDT</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AdminEmptyState title="No ledger entries yet" description="Balance adjustments and approved financial actions will populate the ledger history." />
          )}
        </AdminSurface>
      </div>
    </div>
  );
}