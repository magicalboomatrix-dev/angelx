'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { exportToCSV } from '@/lib/export';
import { useToast } from '@/components/ToastProvider';
import { CheckCircle, XCircle, Clock, Download, ChevronUp, ChevronDown, Filter, X } from 'lucide-react';

function StatusBadge({ status }) {
  const styles = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.PENDING}`}>
      {status === 'PENDING' && <Clock size={12} />}
      {status === 'APPROVED' && <CheckCircle size={12} />}
      {status === 'REJECTED' && <XCircle size={12} />}
      {status}
    </span>
  );
}

function SortHeader({ label, field, sortBy, sortOrder, onSort }) {
  const active = sortBy === field;
  return (
    <th className="text-left px-4 py-3 font-semibold text-gray-600 cursor-pointer select-none hover:text-gray-900 transition"
      onClick={() => onSort(field)}>
      <span className="flex items-center gap-1">
        {label}
        <span className="flex flex-col">
          <ChevronUp size={10} className={active && sortOrder === 'asc' ? 'text-gray-900' : 'text-gray-300'} />
          <ChevronDown size={10} className={active && sortOrder === 'desc' ? 'text-gray-900' : 'text-gray-300'} />
        </span>
      </span>
    </th>
  );
}

export default function SellsPage() {
  const router = useRouter();
  const toast = useToast();
  const [sells, setSells] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null);
  const [remark, setRemark] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [amountMin, setAmountMin] = useState('');
  const [amountMax, setAmountMax] = useState('');

  const fetchSells = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 20, sortBy, sortOrder });
      if (statusFilter) params.set('status', statusFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      if (amountMin) params.set('amountMin', amountMin);
      if (amountMax) params.set('amountMax', amountMax);

      const res = await apiFetch(`/api/admin/sells?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSells(data.sells);
        setTotal(data.total);
        setPage(p);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, sortBy, sortOrder, dateFrom, dateTo, amountMin, amountMax]);

  useEffect(() => { fetchSells(); }, [fetchSells]);

  const handleSort = (field) => {
    if (sortBy === field) setSortOrder((o) => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('desc'); }
  };

  const handleAction = async (id, action) => {
    if (action === 'reject' && !remark.trim()) {
      toast.warning('Remark is required for rejection');
      return;
    }
    setActionLoading(true);
    try {
      const res = await apiFetch(`/api/admin/sells/${id}/${action}`, {
        method: 'PUT',
        body: JSON.stringify({ remark }),
      });
      if (res.ok) {
        toast.success(`Sell request ${action === 'approve' ? 'approved' : 'rejected'}`);
        setActionModal(null);
        setRemark('');
        fetchSells(page);
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

  const handleExport = () => {
    exportToCSV(sells, [
      { key: 'id', label: 'ID' },
      { key: 'user', label: 'Phone', csvRender: (v) => v?.phone || '' },
      { key: 'amount', label: 'Amount' },
      { key: 'paymentMethod', label: 'Method' },
      { key: 'payeeName', label: 'Payee' },
      { key: 'accountNo', label: 'Account No' },
      { key: 'ifsc', label: 'IFSC' },
      { key: 'status', label: 'Status' },
      { key: 'adminRemark', label: 'Remark' },
      { key: 'createdAt', label: 'Date', csvRender: (v) => new Date(v).toLocaleString() },
    ], 'sells');
    toast.info('CSV exported');
  };

  const clearFilters = () => { setDateFrom(''); setDateTo(''); setAmountMin(''); setAmountMax(''); };
  const totalPages = Math.ceil(total / 20);
  const hasFilters = dateFrom || dateTo || amountMin || amountMax;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Sell Requests ({total})</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {['', 'PENDING', 'APPROVED', 'REJECTED'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-sm rounded-lg border transition ${statusFilter === s ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}>
              {s || 'All'}
            </button>
          ))}
          <button onClick={() => setShowFilters(!showFilters)}
            className={`p-1.5 rounded-lg border transition ${showFilters || hasFilters ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'}`} title="Filters">
            <Filter size={16} />
          </button>
          <button onClick={handleExport} className="p-1.5 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 transition" title="Export CSV">
            <Download size={16} />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Min Amount</label>
            <input type="number" value={amountMin} onChange={(e) => setAmountMin(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-28" placeholder="0" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Max Amount</label>
            <input type="number" value={amountMax} onChange={(e) => setAmountMax(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-28" placeholder="∞" />
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 pb-1"><X size={12} /> Clear</button>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <SortHeader label="ID" field="id" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <th className="text-left px-4 py-3 font-semibold text-gray-600">User</th>
                <SortHeader label="Amount" field="amount" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Method</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Bank</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Remark</th>
                <SortHeader label="Date" field="createdAt" sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort} />
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-500">Loading...</td></tr>
              ) : sells.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-500">No sell requests found</td></tr>
              ) : (
                sells.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition cursor-pointer"
                    onClick={() => router.push(`/dashboard/sells/${s.id}`)}>
                    <td className="px-4 py-3 text-gray-500">#{s.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{s.user?.phone || '—'}</div>
                      <div className="text-xs text-gray-400">{s.user?.phone || ''}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">${s.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs font-medium text-gray-700">{s.paymentMethod || 'IMPS'}</td>
                    <td className="px-4 py-3 text-xs">
                      {s.payeeName && <div>{s.payeeName}</div>}
                      {s.accountNo && <div className="text-gray-400">{s.accountNo}</div>}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-30 truncate" title={s.adminRemark}>{s.adminRemark || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(s.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      {s.status === 'PENDING' && (
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => setActionModal({ id: s.id, action: 'approve' })} className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition" title="Approve"><CheckCircle size={16} /></button>
                          <button onClick={() => setActionModal({ id: s.id, action: 'reject' })} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition" title="Reject"><XCircle size={16} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => fetchSells(page - 1)} disabled={page <= 1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Previous</button>
              <button onClick={() => fetchSells(page + 1)} disabled={page >= totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {actionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {actionModal.action === 'approve' ? 'Approve' : 'Reject'} Sell #{actionModal.id}
            </h3>
            <textarea className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" rows={3}
              placeholder={actionModal.action === 'reject' ? 'Remark is required...' : 'Optional remark...'} value={remark} onChange={(e) => setRemark(e.target.value)} />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setActionModal(null); setRemark(''); }} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleAction(actionModal.id, actionModal.action)} disabled={actionLoading}
                className={`flex-1 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 ${actionModal.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}>
                {actionLoading ? 'Processing...' : actionModal.action === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
