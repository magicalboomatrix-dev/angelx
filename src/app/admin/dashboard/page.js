"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from '../admin.module.css';
import AdminDepositsPage from "../deposits/page";
import AdminSellingRequests from "../Sellings/page";
import Users from "../Users/Page";
import AdminSettingsPage from "../settings/page";
import AdminProfilePage from "../profile/page";
import AdminTransactionsPage from "../transactions/page";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");
  const [adminEmail, setAdminEmail] = useState("Admin");
  const [stats, setStats] = useState({ deposits: 0, sells: 0, users: 0, recentActivity: [] });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const sessionRes = await fetch("/api/admin/check-session");
        if (!sessionRes.ok) {
          router.replace("/admin/login");
          return;
        }
        const sessionData = await sessionRes.json();
        setAdminEmail(sessionData.email || "Admin");

        const statsRes = await fetch("/api/admin/stats");
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }
        setLoading(false);
      } catch (err) {
        router.replace("/admin/login");
      }
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      router.replace("/admin/login");
    }
  };

  if (loading) return <div className={styles.loadingState}><i className="fas fa-spinner fa-spin"></i> Loading dashboard...</div>;

  const renderContent = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <>
            <div className={styles.pageHeader}>
              <h2 className={styles.pageTitle}>Dashboard Overview</h2>
              <p className={styles.pageSubtitle}>Welcome back, here's what's happening today.</p>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div className={`${styles.iconWrapper} ${styles.iconBlue}`}>
                    <i className="fas fa-exchange-alt"></i>
                  </div>
                  <span className={styles.statLabel}>Pending Sells</span>
                </div>
                <div className={styles.statValue}>{stats.sells}</div>
                <div className={styles.statTrend}>
                  <span className={styles.trendLabel}>Requests waiting</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div className={`${styles.iconWrapper} ${styles.iconGreen}`}>
                    <i className="fas fa-wallet"></i>
                  </div>
                  <span className={styles.statLabel}>Pending Deposits</span>
                </div>
                <div className={styles.statValue}>{stats.deposits}</div>
                <div className={styles.statTrend}>
                  <span className={styles.trendLabel}>Requests waiting</span>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div className={`${styles.iconWrapper} ${styles.iconPurple}`}>
                    <i className="fas fa-users"></i>
                  </div>
                  <span className={styles.statLabel}>Total Users</span>
                </div>
                <div className={styles.statValue}>{stats.users}</div>
                <div className={styles.statTrend}>
                  <span className={styles.trendLabel}>Registered users</span>
                </div>
              </div>
            </div>

            <div className={styles.dashboardGrid}>
              <div className={styles.sectionCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>Recent Activities</h3>
                  <button className={styles.viewAllBtn} onClick={() => setActivePage('transactions')}>View All</button>
                </div>
                <div className={styles.activityList}>
                  {stats.recentActivity && stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((txn) => (
                      <div key={txn.id} className={styles.activityItem}>
                        <div className={styles.activityIcon}>
                          <i className={`fas ${txn.type === 'DEPOSIT' ? 'fa-wallet' : 'fa-exchange-alt'}`} style={{ color: txn.type === 'DEPOSIT' ? '#10b981' : '#f59e0b' }}></i>
                        </div>
                        <div className={styles.activityContent}>
                          <div className={styles.activityTitle}>{txn.type} - {txn.status}</div>
                          <div className={styles.activityDesc}>{txn.amount} {txn.currency} by {txn.user?.fullName || txn.user?.email || 'User'}</div>
                          <div className={styles.activityTime}>{new Date(txn.createdAt).toLocaleString()}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No recent activity</div>
                  )}
                </div>
              </div>
            </div>
          </>
        );
      case "users":
        return <Users />;
      case "deposits":
        return <AdminDepositsPage />;
      case "withdrawals":
        return <AdminSellingRequests />;
      case "settings":
        return <AdminSettingsPage />;
      case "profile":
        return <AdminProfilePage />;
      case "transactions":
        return <AdminTransactionsPage />;
      default:
        return null;
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "fas fa-th-large" },
    { id: "users", label: "Users", icon: "fas fa-users" },
    { id: "deposits", label: "Deposits", icon: "fas fa-wallet" },
    { id: "withdrawals", label: "Withdrawals", icon: "fas fa-exchange-alt" },
    { id: "transactions", label: "Transactions", icon: "fas fa-list" },
    { id: "settings", label: "Settings", icon: "fas fa-cog" },
    { id: "profile", label: "Profile", icon: "fas fa-user-circle" },
  ];

  return (
    <div className={styles.adminShell}>
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className={styles.sidebarOverlay} 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Top Navigation Bar */}
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <button 
            className={styles.mobileMenuBtn} 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <i className="fas fa-bars"></i>
          </button>
          <div className={styles.brandIcon}>
            <i className="fas fa-bolt"></i>
          </div>
          <div className={styles.brandText}>AngelX Super</div>
        </div>
        
        <button className={styles.userMenuBtn}>
          <div className={styles.userAvatar}>
            <i className="fas fa-user"></i>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div className={styles.userName}>{adminEmail}</div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Administrator</div>
          </div>
        </button>
      </header>

      {/* Sidebar */}
      <aside className={`${styles.adminSidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.mobileSidebarHeader}>
            <div className={styles.brandText}>Menu</div>
            <button className={styles.closeSidebarBtn} onClick={() => setIsMobileMenuOpen(false)}>
                <i className="fas fa-times"></i>
            </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          {navItems.map((item) => (
            <div
              key={item.id}
              className={`${styles.navItem} ${activePage === item.id ? styles.active : ''}`}
              onClick={() => {
                setActivePage(item.id);
                setIsMobileMenuOpen(false);
              }}
            >
              <span className={styles.navIcon}><i className={item.icon}></i></span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #e5e7eb" }}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.adminMain}>
        {renderContent()}
      </main>
    </div>
  );
}
