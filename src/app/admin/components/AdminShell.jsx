'use client';

import Link from 'next/link';
import { startTransition, useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  ChartColumnBig,
  CreditCard,
  History,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  Wallet,
  X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: ChartColumnBig },
  { href: '/admin/Users', label: 'Users', icon: Users },
  { href: '/admin/deposits', label: 'Deposits', icon: ArrowDownToLine },
  { href: '/admin/withdrawals', label: 'Withdrawals', icon: ArrowUpFromLine },
  { href: '/admin/selling', label: 'Selling', icon: ArrowLeftRight },
  { href: '/admin/transactions', label: 'History', icon: History },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/profile', label: 'Admin profile', icon: UserCog },
];

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState({ loading: true, email: '' });
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoginPage = pathname === '/admin/login';

  const activeItem = useMemo(() => {
    return navItems.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  }, [pathname]);

  const handleSessionExpired = useCallback(() => {
    setSession({ loading: false, email: '' });
    startTransition(() => {
      router.replace('/admin/login');
    });
  }, [router]);

  useEffect(() => {
    if (isLoginPage) {
      setSession({ loading: false, email: '' });
      return;
    }

    let cancelled = false;

    async function checkSession() {
      setSession((current) => ({ ...current, loading: true }));
      try {
        const response = await fetch('/api/admin/check-session', { cache: 'no-store' });
        if (!response.ok) {
          if (!cancelled) {
            handleSessionExpired();
          }
          return;
        }

        const data = await response.json();
        if (!cancelled) {
          setSession({ loading: false, email: data.email || 'admin@angelx' });
        }
      } catch (error) {
        console.error('Admin session check failed:', error);
        if (!cancelled) {
          handleSessionExpired();
        }
      }
    }

    checkSession();

    return () => {
      cancelled = true;
    };
  }, [handleSessionExpired, isLoginPage, pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (error) {
      console.error('Admin logout failed:', error);
    } finally {
      startTransition(() => {
        router.replace('/admin/login');
      });
    }
  };

  if (isLoginPage) {
    return children;
  }

  if (session.loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-loading-card">
          <div className="admin-loading-orb" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-cyan-700/80">AngelX admin</p>
          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 md:text-3xl">Preparing control room</h1>
          <p className="max-w-md text-center text-[13px] leading-6 text-slate-500 md:text-sm">Loading the moderation console, settlement queues, and admin session context.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <div className="admin-shell__aurora" />

      <aside className={cn('admin-sidebar', mobileOpen ? 'admin-sidebar--open' : '')}>
        <div className="flex items-start justify-between gap-3 lg:block">
          <div>
            <div className="flex h-10 w-10 items-center justify-center bg-slate-950 text-white shadow-xl shadow-slate-950/20 md:h-11 md:w-11">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="mt-3 space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-700/75">Operations suite</p>
              <h1 className="font-display text-2xl font-semibold tracking-[-0.05em] text-slate-950 md:text-[26px]">AngelX Admin</h1>
            </div>
          </div>

          <button type="button" className=" border border-slate-200 bg-white p-2 text-slate-600 lg:hidden" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn('admin-nav-link', active && 'admin-nav-link--active')}
                onClick={() => setMobileOpen(false)}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 border border-slate-200/80 bg-slate-50/80 p-3.5 md:p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center bg-cyan-100 text-cyan-700 md:h-10 md:w-10">
              <CreditCard className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Active session</p>
              <p className="mt-1 text-[13px] font-medium text-slate-900 md:text-sm">{session.email}</p>
            </div>
          </div>
          <Button variant="secondary" className="w-full justify-between" onClick={handleLogout}>
            Sign out
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {mobileOpen ? <button type="button" className="admin-sidebar-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close navigation" /> : null}

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">Current workspace</p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-[-0.03em] text-slate-950 md:text-2xl">{activeItem?.label || 'Admin'}</h2>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="admin-page-frame">{children}</main>
      </div>
    </div>
  );
}