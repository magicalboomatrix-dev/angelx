'use client';

import { useEffect, useState } from 'react';
import { BanknoteArrowDown, Landmark, QrCode, Save } from 'lucide-react';

import { useToast } from '@/app/components/ToastProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { AdminMetricCard, AdminPageHeader, AdminSurface, formatAdminMoney } from '../components/admin-kit';

const initialForm = {
  rate: '',
  depositMin: '',
  withdrawMin: '',
  inviteReward: '',
  trc20Address: '',
  trc20QrUrl: '',
  erc20Address: '',
  erc20QrUrl: '',
};

export default function AdminSettingsPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/settings', { cache: 'no-store' });
        const data = await response.json();
        if (!cancelled && response.ok && data.settings) {
          setForm({
            rate: String(data.settings.rate ?? ''),
            depositMin: String(data.settings.depositMin ?? ''),
            withdrawMin: String(data.settings.withdrawMin ?? ''),
            inviteReward: String(data.settings.inviteReward ?? ''),
            trc20Address: data.settings.trc20Address || '',
            trc20QrUrl: data.settings.trc20QrUrl || '',
            erc20Address: data.settings.erc20Address || '',
            erc20QrUrl: data.settings.erc20QrUrl || '',
          });
        }
      } catch (error) {
        console.error('Failed to load admin settings:', error);
        if (!cancelled) {
          showToast('Failed to load settings', 'error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSettings();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rate: form.rate,
          depositMin: form.depositMin,
          withdrawMin: form.withdrawMin,
          inviteReward: form.inviteReward,
          trc20Address: form.trc20Address,
          trc20QrUrl: form.trc20QrUrl,
          erc20Address: form.erc20Address,
          erc20QrUrl: form.erc20QrUrl,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || 'Failed to save settings', 'error');
        return;
      }

      showToast('Settings updated', 'success');
    } catch (error) {
      console.error('Failed to save settings:', error);
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Platform settings"
        description="Control exchange rate, transaction minimums, invite rewards, and the destination QR and wallet addresses customers use for deposits."
        actions={
          <Button onClick={handleSave} disabled={loading || saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save settings'}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <AdminMetricCard label="Live rate" value={form.rate ? `₹${formatAdminMoney(form.rate)}` : '—'} detail="Current USDT to INR rate applied across the platform." icon={BanknoteArrowDown} tone="slate" />
        <AdminMetricCard label="Minimum deposit" value={form.depositMin ? `${formatAdminMoney(form.depositMin)} USDT` : '—'} detail="Smallest deposit request that can be submitted." icon={Landmark} tone="cyan" />
        <AdminMetricCard label="Minimum withdrawal" value={form.withdrawMin ? `${formatAdminMoney(form.withdrawMin)} USDT` : '—'} detail="Smallest sell or withdrawal request permitted." icon={QrCode} tone="emerald" />
        <AdminMetricCard label="Invite reward" value={form.inviteReward ? `${formatAdminMoney(form.inviteReward)} USDT` : '—'} detail="Reward credited to the inviter whenever a referred user's order is approved by admin." icon={Save} tone="amber" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
        <AdminSurface title="Pricing and limits" description="These values gate customer transaction flow and displayed conversions.">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Rate</label>
              <Input type="number" min="0" step="0.01" value={form.rate} onChange={(event) => setForm((current) => ({ ...current, rate: event.target.value }))} placeholder="102" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Min deposit</label>
              <Input type="number" min="0" step="0.01" value={form.depositMin} onChange={(event) => setForm((current) => ({ ...current, depositMin: event.target.value }))} placeholder="100" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Min withdrawal</label>
              <Input type="number" min="0" step="0.01" value={form.withdrawMin} onChange={(event) => setForm((current) => ({ ...current, withdrawMin: event.target.value }))} placeholder="50" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Invite reward</label>
              <Input type="number" min="0.01" step="0.01" value={form.inviteReward} onChange={(event) => setForm((current) => ({ ...current, inviteReward: event.target.value }))} placeholder="1" />
            </div>
          </div>
        </AdminSurface>

        <AdminSurface title="Save changes" description="Persist treasury settings, invite rewards, and deposit routing configuration.">
          <p className="text-sm leading-6 text-slate-500">These fields update both the public deposit instructions and the admin review context used across the platform.</p>
          <Button className="mt-4 w-full" onClick={handleSave} disabled={loading || saving}>{saving ? 'Saving settings...' : 'Save all settings'}</Button>
        </AdminSurface>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminSurface title="TRC20 deposit target" description="Set the wallet address and QR asset shown to TRC20 depositors.">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">TRC20 wallet address</label>
              <Input value={form.trc20Address} onChange={(event) => setForm((current) => ({ ...current, trc20Address: event.target.value }))} placeholder="TRC20 deposit address" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">TRC20 QR code URL</label>
              <Input value={form.trc20QrUrl} onChange={(event) => setForm((current) => ({ ...current, trc20QrUrl: event.target.value }))} placeholder="/images/trc20.png" />
            </div>
            <div className=" border border-slate-200/80 bg-slate-50/80 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Preview</p>
              <p className="mt-2 break-all">{form.trc20Address || 'No TRC20 address configured yet.'}</p>
              <p className="mt-1 break-all text-slate-500">{form.trc20QrUrl || 'No TRC20 QR configured yet.'}</p>
            </div>
          </div>
        </AdminSurface>

        <AdminSurface title="USDT / ERC20 deposit target" description="Set the alternative network wallet address and QR asset used for USDT deposits.">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">USDT / ERC20 wallet address</label>
              <Input value={form.erc20Address} onChange={(event) => setForm((current) => ({ ...current, erc20Address: event.target.value }))} placeholder="ERC20 deposit address" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">USDT / ERC20 QR code URL</label>
              <Input value={form.erc20QrUrl} onChange={(event) => setForm((current) => ({ ...current, erc20QrUrl: event.target.value }))} placeholder="/images/erc20.png" />
            </div>
            <div className=" border border-slate-200/80 bg-slate-50/80 p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Preview</p>
              <p className="mt-2 break-all">{form.erc20Address || 'No ERC20 address configured yet.'}</p>
              <p className="mt-1 break-all text-slate-500">{form.erc20QrUrl || 'No ERC20 QR configured yet.'}</p>
            </div>
          </div>
        </AdminSurface>
      </div>
    </div>
  );
}