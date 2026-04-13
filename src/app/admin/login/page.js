'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LockKeyhole, Mail, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch('/api/admin/check-session', { cache: 'no-store' });
        if (!cancelled && response.ok) {
          router.replace('/admin/dashboard');
        }
      } catch {
      }
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid credentials');
        return;
      }

      router.replace('/admin/dashboard');
    } catch (loginError) {
      console.error('Admin login failed:', loginError);
      setError('Unable to sign in right now');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <div className="hidden border border-white/70 bg-[linear-gradient(135deg,#07111f_0%,#0f3b52_52%,#1d4ed8_100%)] px-8 py-10 text-white shadow-[0_28px_60px_rgba(15,23,42,0.22)] lg:flex lg:flex-col lg:justify-between xl:px-10 xl:py-12">
          <div className="space-y-5">
            <div className="flex h-12 w-12 items-center justify-center bg-white/12 backdrop-blur-sm xl:h-14 xl:w-14">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-300">AngelX control room</p>
              <h1 className="font-display max-w-lg text-4xl font-semibold leading-[0.95] tracking-[-0.06em] xl:text-[2.8rem]">A premium admin surface for live crypto operations.</h1>
              <p className="max-w-xl text-[13px] leading-6 text-slate-200/86 md:text-sm md:leading-7">Review deposits, approve withdrawals, edit customer records, and control treasury settings from one secure console.</p>
            </div>
          </div>

          <div className="grid gap-3 border border-white/10 bg-white/6 p-5 backdrop-blur-sm xl:p-6">
            <p className="text-[13px] font-medium text-slate-100 md:text-sm">Security controls enabled</p>
            <div className="grid gap-2.5 text-[13px] text-slate-300 md:text-sm">
              <p>HttpOnly JWT-based admin sessions</p>
              <p>Rate-limited login handling</p>
              <p>Atomic settlement and wallet audit logging</p>
            </div>
          </div>
        </div>

        <Card className="border-white/80 bg-white/92 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
          <CardHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center bg-slate-950 text-white shadow-lg shadow-slate-950/12 lg:hidden">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl tracking-[-0.04em] md:text-3xl">Sign in to AngelX Admin</CardTitle>
            <CardDescription className="text-[13px] leading-6 md:text-sm">Use your administrator credentials to access users, queues, and settlement controls.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@angelxsuper.com" required className="pl-11" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Password</label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required className="pl-11" />
                </div>
              </div>

              {error ? <div className=" border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? 'Signing in...' : 'Open admin dashboard'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}