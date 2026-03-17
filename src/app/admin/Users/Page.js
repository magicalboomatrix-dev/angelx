'use client';
import { useEffect, useState } from 'react';
import styles from '../admin.module.css';
import Modal from '../components/Modal';
import { useToast } from '@/app/components/ToastProvider';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { showToast } = useToast();

  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('CREDIT');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

  // SAFE INITIAL (fixes charAt crash)
  const getInitial = (user) => {
    return (user?.fullName || user?.email || '')
      .trim()
      .charAt(0)
      .toUpperCase();
  };

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchUsers = async (p = page) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${p}&pageSize=${pageSize}`);
      const data = await res.json();
      if (res.ok) {
        setUsers(Array.isArray(data.users) ? data.users : []);
        setPage(data.page || p);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      showToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openUserModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const closeUserModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setShowAdjustmentForm(false);
    setAdjustmentAmount('');
    setAdjustmentReason('');
  };

  const handleWalletAdjustment = async () => {
    if (!adjustmentAmount || isNaN(adjustmentAmount) || parseFloat(adjustmentAmount) <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    setAdjusting(true);
    try {
      const res = await fetch('/api/admin/users/adjust-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          amount: adjustmentAmount,
          type: adjustmentType,
          reason: adjustmentReason
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Wallet adjusted successfully', 'success');
        // REAL-TIME UPDATE (no refetch)
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, wallet: { ...u.wallet, usdtAvailable: data.newBalance } } : u));
        setSelectedUser({ ...selectedUser, wallet: { ...selectedUser.wallet, usdtAvailable: data.newBalance } });
        setShowAdjustmentForm(false);
        setAdjustmentAmount('');
        setAdjustmentReason('');
      } else {
        showToast(data.error || 'Adjustment failed', 'error');
      }
    } catch (err) {
      showToast('Adjustment failed', 'error');
    } finally {
      setAdjusting(false);
    }
  };

  // Filter users (debounced)
  const filteredUsers = (Array.isArray(users) ? users : []).filter((user) => {
    const searchTerm = debouncedSearch.toLowerCase();
    return (
      (user.fullName || '').toLowerCase().includes(searchTerm) ||
      (user.email || '').toLowerCase().includes(searchTerm)
    );
  });

  // Analytics
  const totalBalance = users.reduce((acc, u) => acc + (u.wallet?.usdtAvailable || 0), 0);
  const topUser = [...users].sort((a, b) => (b.wallet?.usdtAvailable || 0) - (a.wallet?.usdtAvailable || 0))[0];

  if (loading) return <div className={styles.loadingState}><i className="fas fa-spinner fa-spin"></i> Loading users...</div>;

  return (
    <>
      {/* HEADER */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>User Management</h1>
          <p className={styles.pageSubtitle}>Manage all AngelX Super users</p>
        </div>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>
            <i className="fas fa-search"></i>
          </span>
        </div>
      </div>

      {/* ANALYTICS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '20px' }}>
        <div className={styles.sectionCard}><b>Total Users:</b> {users.length}</div>
        <div className={styles.sectionCard}><b>Total Balance:</b> ${totalBalance}</div>
        <div className={styles.sectionCard}><b>Top User:</b> {topUser?.fullName || 'N/A'}</div>
      </div>

      {/* TABLE */}
      <div className={styles.sectionCard} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Wallet Balance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#e0e7ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                        {getInitial(user)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{user.fullName || "N/A"}</div>
                        <div style={{ fontSize: "12px", color: "#6b7280" }}>ID: #{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: "14px", color: "#374151" }}>{user.email}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>{user.mobile || "N/A"}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "#111827" }}>${user.wallet?.usdtAvailable ?? 0}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>USDT</div>
                  </td>
                  <td>
                    <span className={`${styles.statBadge} ${styles.badgeGreen}`}>Active</span>
                  </td>
                  <td>
                    <button onClick={() => openUserModal(user)} className={styles.viewAllBtn}>View Details</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "32px", color: "#6b7280" }}>
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className={styles.paginationContainer}>
        <button onClick={() => { if (page > 1) fetchUsers(page - 1); }} disabled={page <= 1} className={styles.paginationBtn}>← Previous</button>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>Page {page} of {Math.ceil(total / pageSize) || 1}</span>
        <button onClick={() => { if (page * pageSize < total) fetchUsers(page + 1); }} disabled={page * pageSize >= total} className={styles.paginationBtn}>Next →</button>
      </div>

      {/* MODAL (FULL ORIGINAL KEPT) */}
      <Modal isOpen={isModalOpen} onClose={closeUserModal} title="User Details" footer={<>
        <button className={styles.btnSecondary} onClick={closeUserModal}>Close</button>
        {!showAdjustmentForm ? (
          <button className={styles.btnPrimary} onClick={() => setShowAdjustmentForm(true)}>
            <i className="fas fa-wallet"></i> Adjust Wallet
          </button>
        ) : (
          <button className={styles.btnPrimary} onClick={handleWalletAdjustment} disabled={adjusting}>
            {adjusting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>} Confirm Adjustment
          </button>
        )}
      </>}>
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#e0e7ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 700 }}>
                {getInitial(selectedUser)}
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{selectedUser.fullName || 'N/A'}</h4>
                <p style={{ color: '#6b7280', margin: 0 }}>{selectedUser.email}</p>
                <span className={`${styles.statBadge} ${styles.badgeGreen}`} style={{ marginTop: '8px', display: 'inline-block' }}>Active User</span>
              </div>
            </div>

            <div>
              <h5 style={{ fontSize: '14px', fontWeight: 600 }}>Personal Information</h5>
              <div className={styles.detailRow}><span>User ID</span><span>#{selectedUser.id}</span></div>
              <div className={styles.detailRow}><span>Mobile</span><span>{selectedUser.mobile || 'N/A'}</span></div>
              <div className={styles.detailRow}><span>Joined</span><span>{new Date(selectedUser.createdAt).toLocaleDateString()}</span></div>
            </div>

            <div>
              <h5 style={{ fontSize: '14px', fontWeight: 600 }}>Wallet</h5>
              <div className={styles.detailRow}><span>Available</span><span>${selectedUser.wallet?.usdtAvailable ?? 0}</span></div>
              <div className={styles.detailRow}><span>Deposited</span><span>${selectedUser.wallet?.usdtDeposited ?? 0}</span></div>
              <div className={styles.detailRow}><span>Withdrawn</span><span>${selectedUser.wallet?.usdtWithdrawn ?? 0}</span></div>
            </div>

            {showAdjustmentForm && (
              <div>
                <input type="number" value={adjustmentAmount} onChange={(e) => setAdjustmentAmount(e.target.value)} placeholder="Amount" />
                <input type="text" value={adjustmentReason} onChange={(e) => setAdjustmentReason(e.target.value)} placeholder="Reason" />
                <button onClick={handleWalletAdjustment}>Confirm</button>
              </div>
            )}

            <div>
              <h5>Bank Accounts</h5>
              {selectedUser.bankCards?.length ? selectedUser.bankCards.map((b,i)=>(
                <div key={i}>{b.bankName} - {b.accountNo}</div>
              )) : <p>No bank accounts</p>}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
