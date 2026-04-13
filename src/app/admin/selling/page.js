'use client';

import { useEffect, useState } from 'react';

import { useConfirm } from '@/app/components/ConfirmProvider';
import { useToast } from '@/app/components/ToastProvider';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

import { AdminLoadingSurface, AdminRemarksPanel, AdminTransactionDetailDialog, AdminUserIdentity } from '../components/admin-console';
import { AdminEmptyState, AdminPageHeader, AdminSurface, StatusBadge, formatAdminDate, formatAdminMoney } from '../components/admin-kit';

export default function AdminSellingPage() {
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  async function loadRequests() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/pending-selling-requests', { cache: 'no-store' });
      const data = await response.json();
      if (response.ok) {
        setRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Failed to load selling requests:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function approveRequest() {
    if (!selectedRequest) {
      return;
    }

    const approved = await confirm('Approve sell request', `Approve sell request ${selectedRequest.referenceId} for ${formatAdminMoney(selectedRequest.amount)} ${selectedRequest.currency || 'USDT'}?`);
    if (!approved) {
      return;
    }

    setActing(true);
    try {
      const response = await fetch('/api/admin/confirm-selling-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: selectedRequest.id }),
      });
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || 'Unable to approve sell request', 'error');
        return;
      }

      showToast('Sell request approved', 'success');
      setSelectedRequest(null);
      await loadRequests();
    } catch (error) {
      console.error('Sell approval failed:', error);
      showToast('Unable to approve sell request', 'error');
    } finally {
      setActing(false);
    }
  }

  async function rejectRequest() {
    if (!selectedRequest) {
      return;
    }

    setActing(true);
    try {
      const response = await fetch('/api/admin/reject-selling-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: selectedRequest.id, reason: rejectReason }),
      });
      const data = await response.json();
      if (!response.ok) {
        showToast(data.error || 'Unable to reject sell request', 'error');
        return;
      }

      showToast('Sell request rejected', 'success');
      setRejectReason('');
      setSelectedRequest(null);
      await loadRequests();
    } catch (error) {
      console.error('Sell rejection failed:', error);
      showToast('Unable to reject sell request', 'error');
    } finally {
      setActing(false);
    }
  }

  if (loading) {
    return <AdminLoadingSurface title="Loading selling queue" description="Collecting pending sell requests, bank payout details, and wallet balances." />;
  }

  return (
    <>
      <AdminPageHeader title="Selling" description="Process sell requests with linked bank account details, current wallet posture, and operator remarks." />

      <AdminSurface title="Pending selling requests" description={`Pending items: ${requests.length}`}>
        {requests.length ? (
          <div className="overflow-x-auto admin-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Bank account</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const selectedBank = request.user?.bankCards?.find((card) => card.isSelected) || request.user?.bankCards?.[0];

                  return (
                    <TableRow key={request.id} className="cursor-pointer" onClick={() => { setRejectReason(''); setSelectedRequest(request); }}>
                      <TableCell><AdminUserIdentity user={request.user} href={request.user?.id ? `/admin/users/${request.user.id}` : undefined} muted /></TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-900">{request.referenceId}</div>
                        <div className="text-xs text-slate-500">{request.network || request.address || 'No network provided'}</div>
                      </TableCell>
                      <TableCell className="font-semibold text-slate-900">{formatAdminMoney(request.amount)} {request.currency || 'USDT'}</TableCell>
                      <TableCell>
                        {selectedBank ? (
                          <div className="text-sm text-slate-600">
                            <div className="font-semibold text-slate-900">{selectedBank.bankName}</div>
                            <div>{selectedBank.accountNo}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">No bank linked</span>
                        )}
                      </TableCell>
                      <TableCell>{formatAdminDate(request.createdAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <AdminEmptyState title="Selling queue is clear" description="There are no pending sell requests waiting for manual review right now." />
        )}
      </AdminSurface>

      <AdminTransactionDetailDialog
        open={Boolean(selectedRequest)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequest(null);
            setRejectReason('');
          }
        }}
        transaction={selectedRequest}
        title="Sell request detail"
        description="Review the requested sell amount, payout destination, and wallet state before releasing funds."
        children={selectedRequest ? <AdminRemarksPanel title="Sell request note" remarks={selectedRequest.description} /> : null}
        footer={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="w-full sm:max-w-md">
              <Textarea placeholder="Reason for rejection" value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={rejectRequest} disabled={acting}>Reject</Button>
              <Button onClick={approveRequest} disabled={acting}>{acting ? 'Processing...' : 'Approve sell request'}</Button>
            </div>
          </div>
        }
      />
    </>
  );
}