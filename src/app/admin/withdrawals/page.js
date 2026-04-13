'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowUpFromLine, Building2, Landmark, RefreshCw } from 'lucide-react';

import { useConfirm } from '@/app/components/ConfirmProvider';
import { useToast } from '@/app/components/ToastProvider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

import { AdminEmptyState, AdminKeyValueList, AdminMetricCard, AdminPageHeader, AdminSurface, StatusBadge, formatAdminDate, formatAdminMoney } from '../components/admin-kit';

function getPreferredBank(request) {
  return request?.user?.bankCards?.find((card) => card.isSelected) || request?.user?.bankCards?.[0] || null;
}

export default function AdminWithdrawalsPage() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/pending-selling-requests', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || 'Failed to load withdrawals', 'error');
        return;
      }

      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (error) {
      console.error('Failed to load withdrawals:', error);
      showToast('Failed to load withdrawals', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const totalAmount = useMemo(() => requests.reduce((sum, request) => sum + Number(request.amount || 0), 0), [requests]);
  const withSelectedBank = useMemo(() => requests.filter((request) => getPreferredBank(request)).length, [requests]);

  const closeDialog = () => {
    setSelectedRequest(null);
    setReviewNote('');
    setSubmitting('');
  };

  const handleApprove = async () => {
    if (!selectedRequest) {
      return;
    }

    const accepted = await confirm('Approve withdrawal?', 'This will finalize the sell request and settle the user balance.');
    if (!accepted) {
      return;
    }

    setSubmitting('approve');
    try {
      const response = await fetch('/api/admin/confirm-selling-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: selectedRequest.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || 'Failed to approve withdrawal', 'error');
        return;
      }

      showToast('Withdrawal approved', 'success');
      closeDialog();
      loadRequests();
    } catch (error) {
      console.error('Failed to approve withdrawal:', error);
      showToast('Failed to approve withdrawal', 'error');
    } finally {
      setSubmitting('');
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) {
      return;
    }

    if (!reviewNote.trim()) {
      showToast('Rejection reason is required', 'error');
      return;
    }

    const accepted = await confirm('Reject withdrawal?', 'This will reject the sell request and release any reserved funds back to the user.');
    if (!accepted) {
      return;
    }

    setSubmitting('reject');
    try {
      const response = await fetch('/api/admin/reject-selling-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: selectedRequest.id, reason: reviewNote }),
      });
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || 'Failed to reject withdrawal', 'error');
        return;
      }

      showToast('Withdrawal rejected', 'success');
      closeDialog();
      loadRequests();
    } catch (error) {
      console.error('Failed to reject withdrawal:', error);
      showToast('Failed to reject withdrawal', 'error');
    } finally {
      setSubmitting('');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Withdrawal settlement queue"
        description="Review user sell-to-bank requests with the linked payout account and wallet context before approving or rejecting settlement."
        actions={
          <Button variant="secondary" onClick={loadRequests} disabled={loading}>
            <RefreshCw className="h-4 w-4" />
            Refresh queue
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminMetricCard label="Pending withdrawals" value={requests.length} detail="Bank settlement requests currently awaiting review." icon={ArrowUpFromLine} tone="slate" />
        <AdminMetricCard label="Queued amount" value={`$${formatAdminMoney(totalAmount)}`} detail="Combined value of all open sell requests pending settlement." icon={Landmark} tone="amber" />
        <AdminMetricCard label="Payout accounts ready" value={withSelectedBank} detail="Requests that already have a selected bank account available for payout." icon={Building2} tone="emerald" />
      </div>

      <AdminSurface title="Pending withdrawal records" description="Open a request to review user data, selected payout account, and wallet balances before taking action.">
        {loading ? (
          <div className=" border border-dashed border-slate-200 bg-slate-50/80 px-5 py-12 text-center text-sm text-slate-500">Loading withdrawals...</div>
        ) : requests.length === 0 ? (
          <AdminEmptyState title="Withdrawal queue is clear" description="There are no pending withdrawal requests at the moment." />
        ) : (
          <div className="overflow-x-auto admin-scrollbar">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Payout account</th>
                  <th className="px-4 py-3 font-semibold">Submitted</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => {
                  const bank = getPreferredBank(request);
                  return (
                    <tr key={request.id} className="border-b border-slate-100 last:border-b-0">
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-900">{request.referenceId}</p>
                        <p className="text-xs text-slate-500">{request.network || 'BANK'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-900">{request.user?.mobile ? `+91 ${request.user.mobile}` : 'Unknown user'}</p>
                        <p className="text-xs text-slate-500">{request.user?.id ? `User #${request.user.id}` : 'No contact'}</p>
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-900">${formatAdminMoney(request.amount)}</td>
                      <td className="px-4 py-4 text-slate-600">
                        <p>{bank?.payeeName || 'No payout account selected'}</p>
                        <p className="text-xs text-slate-500">{bank?.accountNo || 'No account number'}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-500">{formatAdminDate(request.createdAt)}</td>
                      <td className="px-4 py-4 text-right">
                        <Button variant="secondary" onClick={() => setSelectedRequest(request)}>Review withdrawal</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminSurface>

      <Dialog open={Boolean(selectedRequest)} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        {selectedRequest ? (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Withdrawal review</DialogTitle>
              <DialogDescription>Confirm the payout account and wallet context before settling the request.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <AdminKeyValueList compact items={[
                { label: 'Reference', value: selectedRequest.referenceId },
                { label: 'Amount', value: `$${formatAdminMoney(selectedRequest.amount)}` },
                { label: 'Status', value: <StatusBadge status={selectedRequest.status} /> },
                { label: 'Submitted', value: formatAdminDate(selectedRequest.createdAt) },
                { label: 'Destination', value: selectedRequest.address || 'N/A' },
                { label: 'Description', value: selectedRequest.description || 'No description' },
              ]} />

              <div className="grid gap-4 md:grid-cols-2">
                <div className=" border border-slate-200/80 bg-slate-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-900">Customer</p>
                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    <p>{selectedRequest.user?.mobile ? `+91 ${selectedRequest.user.mobile}` : 'Unknown user'}</p>
                    <p>{selectedRequest.user?.id ? `User #${selectedRequest.user.id}` : 'No user id'}</p>
                    <p>{selectedRequest.user?.mobile || 'No mobile'}</p>
                    <p>Available: ${formatAdminMoney(selectedRequest.user?.wallet?.usdtAvailable)}</p>
                    <p>Locked: ${formatAdminMoney(selectedRequest.user?.wallet?.usdtLocked)}</p>
                  </div>
                </div>

                <div className=" border border-slate-200/80 bg-slate-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-900">Payout account</p>
                  {getPreferredBank(selectedRequest) ? (
                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                      <p>{getPreferredBank(selectedRequest).payeeName || 'No payee name'}</p>
                      <p>{getPreferredBank(selectedRequest).bankName || 'No bank name'}</p>
                      <p>{getPreferredBank(selectedRequest).accountNo || 'No account number'}</p>
                      <p>{getPreferredBank(selectedRequest).ifsc || 'No IFSC'}</p>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-rose-600">No payout account is selected for this user.</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Rejection note</label>
                <Textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Explain why this payout should be rejected if you do not approve it." />
              </div>
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={closeDialog} disabled={Boolean(submitting)}>Close</Button>
              <Button variant="destructive" onClick={handleReject} disabled={submitting === 'approve' || submitting === 'reject'}>
                {submitting === 'reject' ? 'Rejecting...' : 'Reject withdrawal'}
              </Button>
              <Button onClick={handleApprove} disabled={submitting === 'approve' || submitting === 'reject'}>
                {submitting === 'approve' ? 'Approving...' : 'Approve withdrawal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}