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

  const getInitial = (user) => {
    return (user?.fullName || user?.email || '')
      .trim()
      .charAt(0)
      .toUpperCase();
  };

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

        setUsers(users.map(u =>
          u.id === selectedUser.id
            ? { ...u, wallet: { ...u.wallet, usdtAvailable: data.newBalance } }
            : u
        ));

        setSelectedUser({
          ...selectedUser,
          wallet: { ...selectedUser.wallet, usdtAvailable: data.newBalance }
        });

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

  const filteredUsers = (Array.isArray(users) ? users : []).filter((user) => {
    const searchTerm = search.toLowerCase();
    return (
      (user.fullName || '').toLowerCase().includes(searchTerm) ||
      (user.email || '').toLowerCase().includes(searchTerm)
    );
  });

  if (loading)
    return (
      <div className={styles.loadingState}>
        <i className="fas fa-spinner fa-spin"></i> Loading users...
      </div>
    );

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>User Management</h1>
          <p className={styles.pageSubtitle}>Manage all AngelX users</p>
        </div>

        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <div className={styles.sectionCard} style={{ padding: 0 }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Contact</th>
              <th>Wallet</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        background: '#6366f1',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700
                      }}>
                        {getInitial(user)}
                      </div>

                      <div>
                        <div style={{ fontWeight: 600 }}>{user.fullName || 'N/A'}</div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>#{user.id}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div>{user.email || 'N/A'}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {user.mobile || 'N/A'}
                    </div>
                  </td>

                  <td>
                    <strong>${user.wallet?.usdtAvailable ?? 0}</strong>
                  </td>

                  <td>
                    <span className={`${styles.statBadge} ${styles.badgeGreen}`}>
                      Active
                    </span>
                  </td>

                  <td>
                    <button
                      onClick={() => openUserModal(user)}
                      className={styles.viewAllBtn}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: 20 }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.paginationContainer}>
        <button onClick={() => fetchUsers(page - 1)} disabled={page <= 1}>
          Prev
        </button>

        <span>
          Page {page} / {Math.ceil(total / pageSize) || 1}
        </span>

        <button
          onClick={() => fetchUsers(page + 1)}
          disabled={page * pageSize >= total}
        >
          Next
        </button>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeUserModal}
        title="User Details"
      >
        {selectedUser && (
          <div>
            <h3>{selectedUser.fullName || 'N/A'}</h3>
            <p>{selectedUser.email}</p>

            <p>
              Balance: ${selectedUser.wallet?.usdtAvailable ?? 0}
            </p>

            <button onClick={() => setShowAdjustmentForm(!showAdjustmentForm)}>
              Adjust Wallet
            </button>

            {showAdjustmentForm && (
              <div>
                <input
                  type="number"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                  placeholder="Amount"
                />

                <button onClick={handleWalletAdjustment} disabled={adjusting}>
                  {adjusting ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
