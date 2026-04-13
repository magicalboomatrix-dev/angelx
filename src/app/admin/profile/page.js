'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';

import { useToast } from '@/app/components/ToastProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { AdminMetricCard, AdminPageHeader, AdminSurface } from '../components/admin-kit';

export default function AdminProfilePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [adminId, setAdminId] = useState(null);
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/profile', { cache: 'no-store' });
        const data = await response.json();
        if (!cancelled && response.ok && data.admin) {
          setAdminId(data.admin.id || null);
          setEmail(data.admin.email || '');
        }
      } catch (error) {
        console.error('Failed to load admin profile:', error);
        if (!cancelled) {
          showToast('Failed to load admin profile', 'error');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          newEmail: email,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || 'Failed to update profile', 'error');
        return;
      }

      showToast('Admin profile updated', 'success');
      setCurrentPassword('');
      setNewPassword('');

      if (data.emailChanged) {
        router.replace('/admin/login');
      }
    } catch (error) {
      console.error('Failed to update admin profile:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Admin profile" description="Manage the administrator identity used for login and secure console access." />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminMetricCard label="Admin id" value={adminId || '—'} detail="Primary identifier for the current administrator account." icon={ShieldCheck} tone="slate" />
        <AdminMetricCard label="Email" value={email || '—'} detail="Current address used for administrator authentication." icon={Mail} tone="cyan" />
        <AdminMetricCard label="Password" value={newPassword ? 'Updating' : 'Protected'} detail="Set a new password here if you need to rotate credentials." icon={LockKeyhole} tone="emerald" />
      </div>

      <AdminSurface title="Account credentials" description="Changing the admin email may require signing in again with the new address.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Email address</label>
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@angelx.com" disabled={loading} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Current password</label>
            <Input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Enter current password" disabled={loading} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">New password</label>
            <Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Leave blank to keep current password" disabled={loading} />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={loading || saving}>{saving ? 'Saving...' : 'Save account changes'}</Button>
        </div>
      </AdminSurface>
    </div>
  );
}