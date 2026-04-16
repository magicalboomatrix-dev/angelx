'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ensureAdminSession } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
      const token = await ensureAdminSession();
      if (!cancelled && token) {
        router.replace('/dashboard');
      }
    }

    bootstrapSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.admin));
      router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-10">
      <div className="absolute -left-32 -top-20 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
      <div className="absolute -bottom-20 -right-24 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden  border border-white/50 bg-white/70 shadow-[0_32px_100px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        <div className="hidden w-[46%] flex-col justify-between bg-[linear-gradient(160deg,#0f172a_0%,#13233c_48%,#135f74_100%)] p-10 text-white lg:flex">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.3em] text-cyan-200/80">AngelX Admin</p>
            <h1 className="mt-5 max-w-sm text-4xl font-semibold leading-tight">Premium control center for users, treasury, and live transaction reviews.</h1>
            <p className="mt-5 max-w-md text-sm leading-6 text-slate-300">Review deposits, sells, withdrawals, wallets, and audit trails from a single responsive workspace built for operator speed.</p>
          </div>

          <div className="grid gap-4">
            <div className=" border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Workspace qualities</p>
              <div className="mt-4 grid gap-3 text-sm text-slate-100">
                <div className="flex items-center justify-between  bg-white/8 px-4 py-3">
                  <span>Responsive operations</span>
                  <span className="text-emerald-200">All devices</span>
                </div>
                <div className="flex items-center justify-between  bg-white/8 px-4 py-3">
                  <span>Secure admin session</span>
                  <span className="text-sky-200">Protected</span>
                </div>
                <div className="flex items-center justify-between  bg-white/8 px-4 py-3">
                  <span>Audit visibility</span>
                  <span className="text-amber-200">Tracked</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-[54%] lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-teal-700">Secure Sign In</p>
              <h2 className="mt-3 text-3xl font-semibold text-slate-900">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-500">Enter your admin credentials to access the AngelX operations workspace.</p>
            </div>

            {error && (
              <div className="mb-6  border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-h-11.5 w-full  border border-slate-300/70 bg-white/90 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400/70 focus:ring-4 focus:ring-sky-100"
                  placeholder="admin@angelx.com"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-h-11.5 w-full  border border-slate-300/70 bg-white/90 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400/70 focus:ring-4 focus:ring-sky-100"
                  placeholder="Enter password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2  bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_26px_rgba(29,78,216,0.24)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Signing in...' : 'Enter Dashboard'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
