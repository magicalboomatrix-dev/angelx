'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { CreditCard, QrCode, Save, ShieldCheck, TrendingUp, Wallet } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const isQrField = (key) => key.endsWith('_qr_url');

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

  const handleFileChange = async (key, file) => {
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      handleChange(key, dataUrl);
      toast.success('QR image loaded and ready to save');
    } catch {
      toast.error('Failed to process QR image');
    }
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
    { key: 'cmd_rate', label: 'CMD Rate (INR)', type: 'number' },
    { key: 'imps_rate', label: 'IMPS Rate (INR)', type: 'number' },
    { key: 'min_deposit', label: 'Minimum Deposit ($)', type: 'number' },
    { key: 'min_withdrawal', label: 'Minimum Withdrawal ($)', type: 'number' },
    { key: 'min_sell', label: 'Minimum Sell ($)', type: 'number' },
    { key: 'min_cmd', label: 'Minimum CMD Limit ($)', type: 'number' },
    { key: 'min_imps', label: 'Minimum IMPS Limit ($)', type: 'number' },
    { key: 'referral_reward_amount', label: 'Referral Reward ($)', type: 'number' },
    { key: 'trc20_wallet_address', label: 'TRC20 Wallet Address', type: 'text' },
    { key: 'bep20_wallet_address', label: 'BEP20 Wallet Address', type: 'text' },
    { key: 'trc20_qr_url', label: 'TRC20 QR Code Image', type: 'text' },
    { key: 'bep20_qr_url', label: 'BEP20 QR Code Image', type: 'text' },
    { key: 'support_link', label: 'Customer Support Link', type: 'text' },
  ];

  const sections = [
    {
      title: 'Rate Controls',
      description: 'Manage the live exchange rates used across the user sell flow.',
      icon: TrendingUp,
      fields: ['usdt_rate', 'cmd_rate', 'imps_rate'],
    },
    {
      title: 'Transaction Limits',
      description: 'Define minimum thresholds for deposits, withdrawals, and sell requests.',
      icon: ShieldCheck,
      fields: ['min_deposit', 'min_withdrawal', 'min_sell', 'min_cmd', 'min_imps', 'referral_reward_amount'],
    },
    {
      title: 'Deposit Wallets',
      description: 'Set the wallet addresses users should send funds to for each supported network.',
      icon: Wallet,
      fields: ['trc20_wallet_address', 'bep20_wallet_address'],
    },
    {
      title: 'QR Uploads',
      description: 'Upload the exact QR image users will scan on the deposit page.',
      icon: QrCode,
      fields: ['trc20_qr_url', 'bep20_qr_url'],
    },
    {
      title: 'Customer Support',
      description: 'Set the customer support link (WhatsApp, Telegram, or any other) displayed throughout the user panel.',
      icon: CreditCard,
      fields: ['support_link'],
    },
  ];

  const fieldMeta = {
    usdt_rate: 'Fallback default rate used when no payment-method-specific rate applies.',
    cmd_rate: 'Applied to CMD sell requests in the user panel.',
    imps_rate: 'Applied to IMPS sell requests in the user panel.',
    min_deposit: 'Lowest deposit amount allowed for user submissions.',
    min_withdrawal: 'Lowest withdrawal amount allowed for user submissions.',
    min_sell: 'Lowest sell amount allowed for exchange requests.',
    min_cmd: 'Minimum amount required for CMD withdrawal requests.',
    min_imps: 'Minimum amount required for IMPS withdrawal requests.',
    referral_reward_amount: 'Base referral reward value configured for the platform.',
    trc20_wallet_address: 'Receiving address shown to users selecting the TRC20 network.',
    bep20_wallet_address: 'Receiving address shown to users selecting the BEP20 network.',
    trc20_qr_url: 'Upload the TRC20 QR image directly. It will be stored in the database.',
    bep20_qr_url: 'Upload the BEP20 QR image directly. It will be stored in the database.',
    support_link: 'Customer support link (WhatsApp, Telegram, or any other) displayed throughout the user panel.',
  };

  const fieldMap = Object.fromEntries(fields.map((field) => [field.key, field]));

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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(103,232,249,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_30%)]" />
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Configuration</p>
            <h2 className="mt-3 text-3xl font-semibold">Premium control over rates, wallets, and deposits</h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-200/85">Configure exactly what users see when they deposit, exchange, and interact with network-specific payment rails. QR uploads now store directly in the database, so there is no path management needed.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Fields</p>
              <p className="mt-2 text-2xl font-semibold">{fields.length}</p>
            </div>
            <div className="border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">QR Uploads</p>
              <p className="mt-2 text-2xl font-semibold">2</p>
            </div>
            <div className="border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Live Rates</p>
              <p className="mt-2 text-2xl font-semibold">3</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <section
              key={section.title}
              className="overflow-hidden border border-slate-200/70 bg-white/90 shadow-[0_16px_34px_rgba(15,23,42,0.08)] backdrop-blur-xl"
            >
              <div className="flex flex-col gap-4 border-b border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#eef6ff_100%)] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/10">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{section.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{section.description}</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                  <CreditCard size={14} />
                  {section.fields.length} controls
                </div>
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-2">
                {section.fields.map((fieldKey) => {
                  const f = fieldMap[fieldKey];
                  if (!f) return null;

                  return (
                    <div
                      key={f.key}
                      className="rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] p-4 shadow-sm"
                    >
                      <label className="mb-2 block text-sm font-semibold text-slate-800">{f.label}</label>
                      <p className="mb-3 text-xs leading-5 text-slate-500">{fieldMeta[f.key]}</p>
                      {isQrField(f.key) ? (
                        <div className="space-y-3">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(f.key, e.target.files?.[0])}
                            className="min-h-11.5 w-full rounded-xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400/70 focus:ring-4 focus:ring-sky-100"
                          />
                          {settings[f.key] ? (
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                              <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                                <QrCode size={14} />
                                Current Preview
                              </div>
                              <img
                                src={settings[f.key]}
                                alt={f.label}
                                className="h-32 w-32 rounded-xl border border-slate-200 bg-white object-contain p-2"
                              />
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <input
                          type={f.type}
                          value={settings[f.key] ?? ''}
                          onChange={(e) => handleChange(f.key, e.target.value)}
                          className="min-h-11.5 w-full rounded-xl border border-slate-300/70 bg-white/90 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400/70 focus:ring-4 focus:ring-sky-100"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(29,78,216,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
