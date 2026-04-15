'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await apiFetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings(data.settings || {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      });
      if (res.ok) {
        toast.success('Settings saved successfully');
      } else {
        const err = await res.json();
        toast.error(err.message || 'Failed to save');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setSaving(false);
    }
  };

  const fields = [
    { key: 'usdt_rate', label: 'USDT Rate (INR)', type: 'number' },
    { key: 'min_deposit', label: 'Minimum Deposit ($)', type: 'number' },
    { key: 'min_withdrawal', label: 'Minimum Withdrawal ($)', type: 'number' },
    { key: 'min_sell', label: 'Minimum Sell ($)', type: 'number' },
    { key: 'referral_reward_amount', label: 'Referral Reward ($)', type: 'number' },
    { key: 'trc20_wallet_address', label: 'TRC20 Wallet Address', type: 'text' },
    { key: 'bep20_wallet_address', label: 'BEP20 Wallet Address', type: 'text' },
    { key: 'trc20_qr_url', label: 'TRC20 QR Code URL', type: 'text' },
    { key: 'bep20_qr_url', label: 'BEP20 QR Code URL', type: 'text' },
  ];

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-teal-700">System Controls</p>
          <h1 className="text-[clamp(1.7rem,2vw,2.4rem)] font-bold leading-tight text-slate-900">Settings</h1>
          <p className="max-w-3xl text-sm text-slate-500 sm:text-[0.95rem]">Tune wallet addresses, transaction floors, rates, and referral rules from one responsive configuration surface.</p>
        </div>
      </div>

      <section className="relative overflow-hidden  border border-white/15 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.18),transparent_24%),linear-gradient(135deg,#0f172a_0%,#182642_42%,#125b72_100%)] p-6 text-white shadow-[0_28px_60px_rgba(15,23,42,0.28)] lg:p-8">
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Configuration</p>
            <h2 className="mt-3 text-3xl font-semibold">Core operational parameters</h2>
            <p className="mt-3 max-w-xl text-sm text-slate-200/85">These values drive deposits, withdrawals, referral rewards, and admin wallet routing. Keep them current before going live.</p>
          </div>
          <div className=" border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Fields available</p>
            <p className="mt-2 text-2xl font-semibold">{fields.length}</p>
          </div>
        </div>
      </section>

      <div className="max-w-4xl  border border-slate-200/70 bg-white/85 p-5 shadow-[0_16px_34px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="grid gap-5 md:grid-cols-2">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="mb-2 block text-sm font-medium text-slate-700">{f.label}</label>
              <input
                type={f.type}
                value={settings[f.key] ?? ''}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className="min-h-11.5 w-full  border border-slate-300/70 bg-white/90 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400/70 focus:ring-4 focus:ring-sky-100"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2  bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(29,78,216,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
