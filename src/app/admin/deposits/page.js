'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDownToLine, Fingerprint, RefreshCw, ShieldCheck } from 'lucide-react';

import { useConfirm } from '@/app/components/ConfirmProvider';
import { useToast } from '@/app/components/ToastProvider';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

import { AdminEmptyState, AdminKeyValueList, AdminMetricCard, AdminPageHeader, AdminSurface, StatusBadge, formatAdminDate, formatAdminMoney } from '../components/admin-kit';

export default function AdminDepositsPage() {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState('');

  const loadDeposits = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/pending-deposits', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || 'Failed to load deposits', 'error');
        return;
      }

      setDeposits(Array.isArray(data.deposits) ? data.deposits : []);
    } catch (error) {
      console.error('Failed to load deposits:', error);
      showToast('Failed to load deposits', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeposits();
  }, []);

  const totalAmount = useMemo(() => deposits.reduce((sum, deposit) => sum + Number(deposit.amount || 0), 0), [deposits]);
  const networkCount = useMemo(() => new Set(deposits.map((deposit) => deposit.network).filter(Boolean)).size, [deposits]);

  const closeDialog = () => {
    setSelectedDeposit(null);
    setReviewNote('');
    setSubmitting('');
  };

  const handleApprove = async () => {
    if (!selectedDeposit) {
      return;
    }

    const accepted = await confirm('Approve deposit?', 'This will credit the user wallet immediately and mark the deposit as settled.');
    if (!accepted) {
      return;
    }

    setSubmitting('approve');
    try {
      const response = await fetch('/api/admin/confirm-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: selectedDeposit.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || 'Failed to approve deposit', 'error');
        return;
      }

      showToast('Deposit approved', 'success');
      closeDialog();
      loadDeposits();
    } catch (error) {
      console.error('Failed to approve deposit:', error);
      showToast('Failed to approve deposit', 'error');
    } finally {
      setSubmitting('');
    }
  };

  const handleReject = async () => {
    if (!selectedDeposit) {
      return;
    }

    if (!reviewNote.trim()) {
      showToast('Rejection reason is required', 'error');
      return;
    }

    const accepted = await confirm('Reject deposit?', 'This will mark the deposit as rejected and keep it out of the wallet balance.');
    if (!accepted) {
      return;
    }

    setSubmitting('reject');
    try {
      const response = await fetch('/api/admin/reject-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: selectedDeposit.id, reason: reviewNote }),
      });
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || 'Failed to reject deposit', 'error');
        return;
      }

      showToast('Deposit rejected', 'success');
      closeDialog();
      loadDeposits();
    } catch (error) {
      console.error('Failed to reject deposit:', error);
      showToast('Failed to reject deposit', 'error');
    } finally {
      setSubmitting('');
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Deposit review queue"
        description="Inspect every pending deposit before it touches the wallet ledger. Open a record to review the customer, network, transaction id, and current wallet context before approving or rejecting it."
        actions={
          <Button variant="secondary" onClick={loadDeposits} disabled={loading}>
            <RefreshCw className="h-4 w-4" />
            Refresh queue
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <AdminMetricCard label="Pending deposits" value={deposits.length} detail="Deposits currently waiting for manual settlement review." icon={ArrowDownToLine} tone="slate" />
        <AdminMetricCard label="Pending value" value={`$${formatAdminMoney(totalAmount)}`} detail="Combined amount queued across all unreviewed deposits." icon={ShieldCheck} tone="cyan" />
        <AdminMetricCard label="Active networks" value={networkCount} detail="Distinct blockchain networks represented in the current queue." icon={Fingerprint} tone="emerald" />
      </div>

      <AdminSurface title="Pending deposit records" description="Every item must be opened and reviewed before approval or rejection.">
        {loading ? (
          <div className=" border border-dashed border-slate-200 bg-slate-50/80 px-5 py-12 text-center text-sm text-slate-500">Loading deposits...</div>
        ) : deposits.length === 0 ? (
          <AdminEmptyState title="Deposit queue is clear" description="There are no pending deposits to review right now." />
        ) : (
          <div className="overflow-x-auto admin-scrollbar">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="px-4 py-3 font-semibold">Reference</th>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Amount</th>
                  <th className="px-4 py-3 font-semibold">Network</th>
                  <th className="px-4 py-3 font-semibold">Submitted</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((deposit) => (
                  <tr key={deposit.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900">{deposit.referenceId}</p>
                      <p className="text-xs text-slate-500">{deposit.txnId || 'No txid submitted'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900">{deposit.user?.mobile ? `+91 ${deposit.user.mobile}` : 'Unknown user'}</p>
                      <p className="text-xs text-slate-500">{deposit.user?.id ? `User #${deposit.user.id}` : 'No contact'}</p>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-900">${formatAdminMoney(deposit.amount)}</td>
                    <td className="px-4 py-4">
                      <StatusBadge status={deposit.network || 'UNKNOWN'} className="px-3 py-1 normal-case tracking-normal" />
                    </td>
                    <td className="px-4 py-4 text-slate-500">{formatAdminDate(deposit.createdAt)}</td>
                    <td className="px-4 py-4 text-right">
                      <Button variant="secondary" onClick={() => setSelectedDeposit(deposit)}>Review deposit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminSurface>

      <Dialog open={Boolean(selectedDeposit)} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        {selectedDeposit ? (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deposit review</DialogTitle>
              <DialogDescription>Inspect the deposit record and user wallet snapshot before approving or rejecting.</DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <AdminKeyValueList compact items={[
                { label: 'Reference', value: selectedDeposit.referenceId },
                { label: 'Amount', value: `$${formatAdminMoney(selectedDeposit.amount)}` },
                { label: 'Network', value: selectedDeposit.network || 'N/A' },
                { label: 'Submitted', value: formatAdminDate(selectedDeposit.createdAt) },
                { label: 'Wallet address', value: selectedDeposit.address || 'N/A' },
                { label: 'Transaction id', value: selectedDeposit.txnId || 'Not provided' },
              ]} />

              <div className="grid gap-4 md:grid-cols-2">
                <div className=" border border-slate-200/80 bg-slate-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-900">Customer</p>
                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    <p>{selectedDeposit.user?.mobile ? `+91 ${selectedDeposit.user.mobile}` : 'Unknown user'}</p>
                    <p>{selectedDeposit.user?.id ? `User #${selectedDeposit.user.id}` : 'No user id'}</p>
                    <p>{selectedDeposit.user?.mobile || 'No mobile'}</p>
                  </div>
                </div>
                <div className=" border border-slate-200/80 bg-slate-50/80 p-4">
                  <p className="text-sm font-semibold text-slate-900">Wallet snapshot</p>
                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    <p>Available: ${formatAdminMoney(selectedDeposit.user?.wallet?.usdtAvailable)}</p>
                    <p>Locked: ${formatAdminMoney(selectedDeposit.user?.wallet?.usdtLocked)}</p>
                    <p>Total deposited: ${formatAdminMoney(selectedDeposit.user?.wallet?.usdtDeposited)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Rejection note</label>
                <Textarea value={reviewNote} onChange={(event) => setReviewNote(event.target.value)} placeholder="Explain why this deposit should be rejected if you do not approve it." />
              </div>
            </div>

            <DialogFooter>
              <Button variant="secondary" onClick={closeDialog} disabled={Boolean(submitting)}>Close</Button>
              <Button variant="destructive" onClick={handleReject} disabled={submitting === 'approve' || submitting === 'reject'}>
                {submitting === 'reject' ? 'Rejecting...' : 'Reject deposit'}
              </Button>
              <Button onClick={handleApprove} disabled={submitting === 'approve' || submitting === 'reject'}>
                {submitting === 'approve' ? 'Approving...' : 'Approve deposit'}
              </Button>
            </DialogFooter>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}