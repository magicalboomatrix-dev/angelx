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
  const { showToast } = useToast();

  const [showAdjustmentForm, setShowAdjustmentForm] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState('CREDIT');
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [total, setTotal] = useState(0);

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

  // Filter users based only on fullName or email
  const filteredUsers = (Array.isArray(users) ? users : []).filter((user) => {
    const searchTerm = search.toLowerCase();
    return (
      (user.fullName || '').toLowerCase().includes(searchTerm) ||
      (user.email || '').toLowerCase().includes(searchTerm)
    );
  });

  if (loading) return <div className={styles.loadingState}><i className="fas fa-spinner fa-spin"></i> Loading users...</div>;

  return (
    <>
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
                        {user.fullName ? user.fullName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
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
                    <button 
                      onClick={() => openUserModal(user)}
                      className={styles.viewAllBtn} 
                    >
                      View Details
                    </button>
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

      <div className={styles.paginationContainer}>
        <button onClick={() => { if (page > 1) fetchUsers(page - 1); }} disabled={page <= 1} className={styles.paginationBtn}>← Previous</button>
        <span style={{ fontSize: '14px', color: '#6b7280' }}>Page {page} of {Math.ceil(total / pageSize) || 1}</span>
        <button onClick={() => { if (page * pageSize < total) fetchUsers(page + 1); }} disabled={page * pageSize >= total} className={styles.paginationBtn}>Next →</button>
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeUserModal}
        title="User Details"
        footer={
          <>
            <button className={styles.btnSecondary} onClick={closeUserModal}>Close</button>
            {!showAdjustmentForm ? (
              <button className={styles.btnPrimary} onClick={() => setShowAdjustmentForm(true)}>
                <i className="fas fa-wallet"></i> Adjust Wallet
              </button>
            ) : (
              <button 
                className={styles.btnPrimary} 
                onClick={handleWalletAdjustment}
                disabled={adjusting}
              >
                {adjusting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>} Confirm Adjustment
              </button>
            )}
          </>
        }
      >
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#e0e7ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: 700 }}>
                {selectedUser.fullName ? selectedUser.fullName.charAt(0).toUpperCase() : selectedUser.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>{selectedUser.fullName || 'N/A'}</h4>
                <p style={{ color: '#6b7280', margin: 0 }}>{selectedUser.email}</p>
                <span className={`${styles.statBadge} ${styles.badgeGreen}`} style={{ marginTop: '8px', display: 'inline-block' }}>Active User</span>
              </div>
            </div>

            <div>
              <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal Information</h5>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>User ID</span>
                <span className={styles.detailValue}>#{selectedUser.id}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Mobile Number</span>
                <span className={styles.detailValue}>{selectedUser.mobile || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Joined Date</span>
                <span className={styles.detailValue}>{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div>
              <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Wallet Overview</h5>
              <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Available Balance</span>
                  <span className={styles.detailValue} style={{ color: '#059669' }}>${selectedUser.wallet?.usdtAvailable ?? 0}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Total Deposited</span>
                  <span className={styles.detailValue}>${selectedUser.wallet?.usdtDeposited ?? 0}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Total Withdrawn</span>
                  <span className={styles.detailValue}>${selectedUser.wallet?.usdtWithdrawn ?? 0}</span>
                </div>
              </div>
            </div>

            {showAdjustmentForm && (
              <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid #bfdbfe', animation: 'fadeIn 0.3s' }}>
                <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#1e40af', marginBottom: '12px' }}>Adjust Wallet Balance</h5>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Type</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      className={adjustmentType === 'CREDIT' ? styles.btnPrimary : styles.btnOutline}
                      onClick={() => setAdjustmentType('CREDIT')}
                      style={{ flex: 1, padding: '8px' }}
                    >
                      Credit (+)
                    </button>
                    <button 
                      className={adjustmentType === 'DEBIT' ? styles.btnDanger : styles.btnOutline}
                      onClick={() => setAdjustmentType('DEBIT')}
                      style={{ flex: 1, padding: '8px' }}
                    >
                      Debit (-)
                    </button>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Amount (USDT)</label>
                  <input 
                    type="number" 
                    className={styles.input} 
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Reason (Optional)</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    placeholder="e.g. Bonus, Correction"
                  />
                </div>
              </div>
            )}

            <div>
              <h5 style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bank Accounts</h5>
              {selectedUser.bankCards && selectedUser.bankCards.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedUser.bankCards.map((bank, idx) => (
                    <div key={idx} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Account Name:</span>
                        <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{bank.payeeName || bank.holderName || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Account No:</span>
                        <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{bank.accountNo || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>IFSC Code:</span>
                        <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{bank.ifsc || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Bank Name:</span>
                        <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{bank.bankName || 'N/A'}</span>
                      </div>
                      {bank.isSelected && (
                        <div style={{ marginTop: '8px', padding: '4px 8px', background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 600, borderRadius: '4px', display: 'inline-block' }}>
                          <i className="fas fa-check-circle" style={{ marginRight: '4px' }}></i>
                          Selected Account
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#9ca3af", fontStyle: "italic", fontSize: '14px' }}>No bank accounts linked</p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
