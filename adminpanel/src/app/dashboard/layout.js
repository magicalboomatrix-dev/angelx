"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Gift,
  DollarSign,
  ScrollText,
  ShieldCheck,
  BellDot,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/deposits", label: "Deposits", icon: ArrowDownCircle },
  { href: "/dashboard/sells", label: "Sell Requests", icon: DollarSign },
  { href: "/dashboard/withdrawals", label: "Withdrawals", icon: ArrowUpCircle },
  { href: "/dashboard/referrals", label: "Referrals", icon: Gift },
  { href: "/dashboard/audit-log", label: "Audit Log", icon: ScrollText },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem("admin_user") || "{}");
      setAdmin(user);
    } catch {
      setAdmin({});
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    router.push("/login");
  };

  const activeItem = navItems.find(
    (item) =>
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname?.startsWith(item.href)),
  );

  return (
    <div className="min-h-screen flex overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-74 transform transition-transform duration-300 lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-74 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{ height: "100vh", overflow: "hidden", top: 0 }}
      >
        <div className="h-full">
          <div className="relative flex h-full flex-col border border-white/10 bg-[linear-gradient(180deg,#0f172a_0%,#13233c_55%,#0f3c4d_100%)] text-white shadow-[0_30px_80px_rgba(15,23,42,0.34)]">
            <div className="absolute -right-10 top-8 h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute bottom-16 left-0 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="flex items-center justify-between px-5 py-5">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-cyan-200/80">
                  AngelX
                </p>
                <h1 className="mt-1 text-xl font-semibold">Admin Control</h1>
              </div>
              <button
                className="rounded-xl border border-white/10 bg-white/5 p-2 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mx-4  border border-white/10 bg-white/6 p-2 backdrop-blur-sm">
              <div className="flex items-center gap-2  bg-emerald-400/10 px-3 py-2 text-xs text-emerald-100 ring-1 ring-emerald-400/10">
                <ShieldCheck size={14} />
                Secure operator session
              </div>
            </div>

            <div className="mt-4 px-4 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400">
              Navigation
            </div>
            <nav
              className="mt-2 flex-1 space-y-1 overflow-y-auto px-1 pb-3 hide-scrollbar"
              style={{ maxHeight: "calc(100vh - 260px)" }}
            >
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-all ${
                      isActive
                        ? "bg-white text-slate-950 shadow-[0_16px_30px_rgba(15,23,42,0.18)]"
                        : "text-slate-200 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${isActive ? "bg-slate-100 text-slate-900" : "bg-white/6 text-slate-300 group-hover:bg-white/12 group-hover:text-white"}`}
                    >
                      <item.icon size={18} />
                    </span>
                    <span className="flex-1">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="border-t border-white/10 p-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center gap-2  border border-white/10 bg-white/6 px-4 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/12"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 lg:ml-[296px]">
        <header className="fixed top-0 left-0 right-0 z-40 w-full lg:left-[296px] lg:w-[calc(100%-296px)]">
          <div className="border border-white/60 bg-white/70 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:px-6 lg:py-4">
            <div className="flex flex-wrap items-center gap-4">
              <button className="border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu size={20} />
              </button>

              <div className="min-w-0">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-sky-700">AngelX Operations</p>
                <h2 className="truncate text-lg font-semibold text-slate-900 lg:text-xl">{activeItem?.label || 'Dashboard'}</h2>
              </div>

              <div className="ml-auto flex flex-wrap items-center gap-2">
                <div className="hidden border border-slate-200/80 bg-slate-50/90 px-3 py-2 text-xs font-medium text-slate-600 sm:flex sm:items-center sm:gap-2">
                  <BellDot size={14} className="text-sky-600" />
                  Live admin workspace
                </div>
                <div className="bg-slate-950 px-3.5 py-2 text-xs font-medium text-slate-100 shadow-lg shadow-slate-900/10">
                  {admin?.email || 'admin@angelx.com'}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-4 pb-6 pt-[88px] lg:px-8 lg:pb-8 lg:pt-[104px]">
          {children}
        </main>
      </div>
    </div>
  );
}
