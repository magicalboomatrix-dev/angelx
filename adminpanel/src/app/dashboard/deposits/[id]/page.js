'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';

function StatusBadge({ status }) {
  const styles = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${styles[status] || styles.PENDING}`}>
      {status === 'PENDING' && <Clock size={14} />}
      {status === 'APPROVED' && <CheckCircle size={14} />}
      {status === 'REJECTED' && <XCircle size={14} />}
      {status}
    </span>
  );
}

function InfoRow({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between py-2.5 border-b border-gray-50">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[60%] break-all">{value}</span>
    </div>
  );
}

export default function DepositDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const toast = useToast();
  const [deposit, setDeposit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null);
  const [remark, setRemark] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function fetchDeposit() {
      try {
        const res = await apiFetch(`/api/admin/deposits/${id}`);
        if (res.ok) {
          const data = await res.json();
          setDeposit(data.deposit);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDeposit();
  }, [id]);

  const handleAction = async (action) => {
    if (action === 'reject' && !remark.trim()) {
      toast.warning('Remark is required for rejection');
      return;
    }
    setActionLoading(true);
    try {
      const res = await apiFetch(`/api/admin/deposits/${id}/${action}`, {
        method: 'PUT',
        body: JSON.stringify({ remark }),
      });
      if (res.ok) {
        toast.success(`Deposit ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
        setActionModal(null);
        setRemark('');
        const updated = await apiFetch(`/api/admin/deposits/${id}`);
        if (updated.ok) setDeposit((await updated.json()).deposit);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  if (!deposit) return <div className="text-center text-gray-500 mt-10">Deposit not found</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Deposit #{deposit.id}</h2>
          <StatusBadge status={deposit.status} />
        </div>

        <div className="space-y-0">
          <InfoRow label="Amount" value={`$${deposit.amount.toFixed(2)}`} />
          <InfoRow label="Network" value={deposit.network} />
          <InfoRow label="Reference ID" value={deposit.referenceId} />
          <InfoRow label="Transaction Hash" value={deposit.txHash} />
          <InfoRow label="Deposit ID" value={deposit.depositId} />
          <InfoRow label="User" value={
            <Link href={`/dashboard/users/${deposit.user?.id}`} className="text-blue-600 hover:underline">
              {deposit.user?.phone || '—'}
            </Link>
          } />
          <InfoRow label="Phone" value={deposit.user?.phone} />
          <InfoRow label="Admin Remark" value={deposit.adminRemark} />
          <InfoRow label="Created" value={new Date(deposit.createdAt).toLocaleString()} />
          {deposit.reviewedAt && <InfoRow label="Reviewed" value={new Date(deposit.reviewedAt).toLocaleString()} />}
        </div>

        {deposit.status === 'PENDING' && (
          <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
            <button onClick={() => setActionModal('approve')} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2">
              <CheckCircle size={16} /> Approve
            </button>
            <button onClick={() => setActionModal('reject')} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center justify-center gap-2">
              <XCircle size={16} /> Reject
            </button>
          </div>
        )}
      </div>

      {actionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {actionModal === 'approve' ? 'Approve' : 'Reject'} Deposit #{deposit.id}
            </h3>
            <textarea className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={3}
              placeholder={actionModal === 'reject' ? 'Remark is required...' : 'Optional remark...'} value={remark} onChange={(e) => setRemark(e.target.value)} />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setActionModal(null); setRemark(''); }} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleAction(actionModal)} disabled={actionLoading}
                className={`flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 ${actionModal === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {actionLoading ? 'Processing...' : actionModal === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
