"use client";
import { useEffect, useState } from "react";
import styles from '../admin.module.css';
import Modal from '../components/Modal';
import { useToast } from '@/app/components/ToastProvider';
import { useConfirm } from '@/app/components/ConfirmProvider';

export default function AdminSellingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pending-selling-requests");
      const data = await res.json();
      if (res.ok) setRequests(data.requests);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    const ok = await confirm('Confirm this selling request?');
    if (!ok) return;
    
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/confirm-selling-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: id }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Selling request confirmed ✅', 'success');
        fetchRequests();
        closeDetailsModal();
      } else showToast(data.error || 'Failed to confirm request', 'error');
    } catch (err) {
      console.error(err);
      showToast('Error confirming request', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return showToast('Please provide a rejection reason', 'error');
    
    setProcessing(true);
    try {
      const res = await fetch('/api/admin/reject-selling-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: selectedRequest.id, reason: rejectionReason }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Selling request rejected ❌', 'success');
        fetchRequests();
        closeRejectModal();
        closeDetailsModal();
      } else showToast(data.error || 'Failed to reject request', 'error');
    } catch (err) {
      console.error(err);
      showToast('Error rejecting request', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const openDetailsModal = (request) => {
    setSelectedRequest(request);
    setIsDetailsModalOpen(true);
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setRejectionReason('');
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedRequest(null);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return <div className={styles.loadingState}><i className="fas fa-spinner fa-spin"></i> Loading requests...</div>;

  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Selling Requests</h1>
          <p className={styles.pageSubtitle}>Manage pending crypto sell requests</p>
        </div>
      </div>

      <div className={styles.sectionCard} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Account</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? requests.map((r) => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "#111827" }}>{r.user?.email || 'N/A'}</div>
                    <div style={{ fontSize: "12px", color: "#6b7280" }}>ID: #{r.id}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: "#111827" }}>${r.amount}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px', color: '#374151' }}>
                      {r.user?.bankCards && r.user.bankCards.length > 0 ? (
                        <>
                          <div style={{ fontWeight: 600 }}>{r.user.bankCards[0].payeeName || r.user.bankCards[0].holderName || 'N/A'}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{r.user.bankCards[0].accountNo || 'N/A'}</div>
                        </>
                      ) : (
                        <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>No bank linked</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.statBadge} ${styles.badgeYellow}`}>
                      <i className="fas fa-clock" style={{ marginRight: "4px" }}></i> {r.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        onClick={() => openDetailsModal(r)} 
                        className={styles.viewAllBtn}
                        style={{ background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db" }}
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => handleConfirm(r.id)} 
                        className={styles.viewAllBtn}
                        style={{ background: "#10b981" }}
                        disabled={processing}
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button 
                        onClick={() => openRejectModal(r)} 
                        className={styles.viewAllBtn}
                        style={{ background: "#ef4444" }}
                        disabled={processing}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "32px", color: "#6b7280" }}>
                    No pending selling requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={closeDetailsModal}
        title="Withdrawal Details"
        footer={
          <>
            <button className={styles.btnSecondary} onClick={closeDetailsModal}>Close</button>
            <button className={styles.btnDanger} onClick={() => openRejectModal(selectedRequest)}>Reject</button>
            <button className={styles.btnPrimary} onClick={() => handleConfirm(selectedRequest?.id)}>Confirm Withdrawal</button>
          </>
        }
      >
        {selectedRequest && (
          <div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Transaction ID</span>
              <span className={styles.detailValue}>#{selectedRequest.id}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>User Email</span>
              <span className={styles.detailValue}>{selectedRequest.user?.email}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Amount</span>
              <span className={styles.detailValue} style={{ fontSize: '18px', color: '#059669' }}>${selectedRequest.amount}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Status</span>
              <span className={`${styles.statBadge} ${styles.badgeYellow}`}>{selectedRequest.status}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Date</span>
              <span className={styles.detailValue}>{new Date(selectedRequest.createdAt).toLocaleString()}</span>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Bank Account Details</h4>
              {selectedRequest.user?.bankCards && selectedRequest.user.bankCards.length > 0 ? (
                <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                  {selectedRequest.user.bankCards.map((bank, idx) => (
                    <div key={idx} style={{ marginBottom: idx < selectedRequest.user.bankCards.length - 1 ? '16px' : '0', paddingBottom: idx < selectedRequest.user.bankCards.length - 1 ? '16px' : '0', borderBottom: idx < selectedRequest.user.bankCards.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Account Name:</span>
                        <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{bank.payeeName || bank.holderName || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Account Number:</span>
                        <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{bank.accountNo || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>IFSC Code:</span>
                        <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{bank.ifsc || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '8px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280' }}>Bank Name:</span>
                        <span style={{ fontSize: '13px', color: '#111827', fontWeight: 500 }}>{bank.bankName || 'N/A'}</span>
                      </div>
                      {bank.isSelected && (
                        <div style={{ marginTop: '8px', padding: '4px 8px', background: '#dcfce7', color: '#166534', fontSize: '11px', fontWeight: 600, borderRadius: '4px', display: 'inline-block' }}>
                          Selected Account
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '8px', border: '1px solid #fbbf24', color: '#92400e', fontSize: '13px' }}>
                  <i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }}></i>
                  No bank account linked to this user
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Rejection Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={closeRejectModal}
        title="Reject Request"
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
            Please provide a reason for rejecting this request. This will be visible to the user.
          </p>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Rejection Reason</label>
            <textarea
              className={styles.formInput}
              rows="4"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Invalid bank details, Suspicious activity..."
            ></textarea>
          </div>
        </div>
      </Modal>
    </>
  );
}
