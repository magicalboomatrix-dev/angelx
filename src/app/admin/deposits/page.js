'use client';
import { useEffect, useState } from 'react';
import styles from '../admin.module.css';
import Modal from '../components/Modal';
import { useToast } from '@/app/components/ToastProvider';
import { useConfirm } from '@/app/components/ConfirmProvider';

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchDeposits = async () => {
    try {
      const res = await fetch('/api/admin/pending-deposits');
      const data = await res.json();
      if (res.ok) setDeposits(data.deposits);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleConfirm = async (id) => {
    const ok = await confirm('Are you sure you want to confirm this deposit?');
    if (!ok) return;
    
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/confirm-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: id }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast('Deposit confirmed ✅', 'success');
        fetchDeposits();
      } else {
        showToast(data.error || 'Failed to confirm deposit', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error confirming deposit', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (deposit) => {
    setSelectedDeposit(deposit);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setRejectionReason('');
    setSelectedDeposit(null);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return showToast('Please provide a rejection reason', 'error');
    
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/reject-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: selectedDeposit.id, reason: rejectionReason }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Deposit rejected ❌', 'success');
        fetchDeposits();
        closeRejectModal();
      } else {
        showToast(data.error || 'Failed to reject deposit', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error rejecting deposit', 'error');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className={styles.loadingState}><i className="fas fa-spinner fa-spin"></i> Loading deposits...</div>;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Deposit Requests</h1>
          <p className={styles.pageSubtitle}>Manage pending crypto deposits</p>
        </div>
      </div>

      {deposits.length === 0 ? (
        <div className={styles.sectionCard} style={{ textAlign: "center", padding: "48px", color: "#6b7280" }}>
          <i className="fas fa-check-circle" style={{ fontSize: "48px", color: "#10b981", marginBottom: "16px" }}></i>
          <p>No pending deposits found.</p>
        </div>
      ) : (
        <div className={styles.sectionCard} style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Network</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: "#111827" }}>{d.user?.email || 'N/A'}</div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>ID: #{d.id}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: "#111827" }}>${d.amount}</div>
                    </td>
                    <td>
                      <span className={`${styles.statBadge} ${styles.badgeBlue}`}>
                        {d.network}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: "14px", color: "#374151" }}>{new Date(d.createdAt).toLocaleDateString()}</div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>{new Date(d.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button 
                          onClick={() => handleConfirm(d.id)} 
                          className={styles.viewAllBtn}
                          style={{ background: "#10b981" }}
                          disabled={processing}
                          title="Confirm Deposit"
                        >
                          <i className="fas fa-check"></i>
                        </button>
                        <button 
                          onClick={() => openRejectModal(d)} 
                          className={styles.viewAllBtn}
                          style={{ background: "#ef4444" }}
                          disabled={processing}
                          title="Reject Deposit"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={closeRejectModal}
        title="Reject Deposit"
        footer={
          <>
            <button className={styles.btnSecondary} onClick={closeRejectModal}>Cancel</button>
            <button className={styles.btnDanger} onClick={handleReject} disabled={processing}>
              {processing ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </>
        }
      >
        <div>
          <p style={{ marginBottom: '16px', color: '#4b5563' }}>
            Please provide a reason for rejecting this deposit. This will be visible to the user.
          </p>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Rejection Reason</label>
            <textarea
              className={styles.formInput}
              rows="4"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Payment not received, Invalid transaction hash..."
            ></textarea>
          </div>
        </div>
      </Modal>
    </>
  );
}
