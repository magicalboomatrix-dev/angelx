'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { exportToCSV } from '@/lib/export';
import { useToast } from '@/components/ToastProvider';
import { Download, Filter } from 'lucide-react';

const ACTION_COLORS = {
  APPROVE: 'bg-green-100 text-green-700',
  REJECT: 'bg-red-100 text-red-700',
  UPDATE: 'bg-blue-100 text-blue-700',
};

function getActionColor(action) {
  if (action.includes('APPROVE')) return ACTION_COLORS.APPROVE;
  if (action.includes('REJECT')) return ACTION_COLORS.REJECT;
  if (action.includes('UPDATE')) return ACTION_COLORS.UPDATE;
  return 'bg-gray-100 text-gray-700';
}

export default function AuditLogPage() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchLogs = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: p, limit: 25 });
      if (action) params.set('action', action);
      if (entityType) params.set('entityType', entityType);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const res = await apiFetch(`/api/admin/audit-logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.total);
        setPage(p);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [action, entityType, dateFrom, dateTo]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const clearFilters = () => {
    setAction(''); setEntityType(''); setDateFrom(''); setDateTo('');
  };

  const handleExport = () => {
    exportToCSV(logs, [
      { key: 'id', label: 'ID' },
      { key: 'adminEmail', label: 'Admin' },
      { key: 'action', label: 'Action' },
      { key: 'entityType', label: 'Entity Type' },
      { key: 'entityId', label: 'Entity ID' },
      { key: 'details', label: 'Details' },
      { key: 'ipAddress', label: 'IP' },
      { key: 'createdAt', label: 'Date', csvRender: (v) => new Date(v).toLocaleString() },
    ], 'audit-logs');
    toast.info('CSV exported');
  };

  const totalPages = Math.ceil(total / 25);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-teal-700">Security & Traceability</p>
          <h1 className="text-[clamp(1.7rem,2vw,2.4rem)] font-bold leading-tight text-slate-900">Audit Log</h1>
          <p className="max-w-3xl text-sm text-slate-500 sm:text-[0.95rem]">Review administrative actions, approvals, rejections, and configuration changes with filterable trace history.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center justify-center gap-2  border border-slate-300/70 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 ${showFilters ? 'border-sky-200 bg-sky-50 text-sky-700' : ''}`}>
            <Filter size={14} /> Filters
          </button>
          <button onClick={handleExport} className="inline-flex h-11 w-11 items-center justify-center  border border-slate-300/70 bg-white/90 text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-50" title="Export CSV">
            <Download size={16} />
          </button>
        </div>
      </div>

      <section className="relative overflow-hidden  border border-white/15 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.18),transparent_24%),linear-gradient(135deg,#0f172a_0%,#182642_42%,#125b72_100%)] p-6 text-white shadow-[0_28px_60px_rgba(15,23,42,0.28)] lg:p-8">
        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-cyan-200/80">Oversight</p>
            <h2 className="mt-3 text-3xl font-semibold">{total} recorded admin events</h2>
            <p className="mt-3 max-w-xl text-sm text-slate-200/85">Filter by action, entity, and date to isolate operator decisions and keep reviews fast on desktop or mobile.</p>
          </div>
          <div className=" border border-white/10 bg-white/8 px-4 py-3 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-300">Current page</p>
            <p className="mt-2 text-2xl font-semibold">{page}</p>
          </div>
        </div>
      </section>

      {showFilters && (
        <div className="grid grid-cols-1 gap-4  border border-slate-200/70 bg-white/85 p-4 shadow-[0_16px_34px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Action</label>
            <select value={action} onChange={(e) => setAction(e.target.value)}
              className="min-h-11.5 w-full  border border-slate-300/70 bg-white/90 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400/70 focus:ring-4 focus:ring-sky-100">
              <option value="">All Actions</option>
              <option value="APPROVE_DEPOSIT">Approve Deposit</option>
              <option value="REJECT_DEPOSIT">Reject Deposit</option>
              <option value="APPROVE_SELL">Approve Sell</option>
              <option value="REJECT_SELL">Reject Sell</option>
              <option value="APPROVE_WITHDRAWAL">Approve Withdrawal</option>
              <option value="REJECT_WITHDRAWAL">Reject Withdrawal</option>
              <option value="UPDATE_SETTINGS">Update Settings</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Entity Type</label>
            <select value={entityType} onChange={(e) => setEntityType(e.target.value)}
              className="min-h-11.5 w-full  border border-slate-300/70 bg-white/90 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400/70 focus:ring-4 focus:ring-sky-100">
              <option value="">All Types</option>
              <option value="Deposit">Deposit</option>
              <option value="Sell">Sell</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="SystemSetting">System Setting</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="min-h-11.5 w-full  border border-slate-300/70 bg-white/90 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400/70 focus:ring-4 focus:ring-sky-100" />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="min-h-11.5 w-full  border border-slate-300/70 bg-white/90 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-sky-400/70 focus:ring-4 focus:ring-sky-100" />
          </div>
          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button onClick={clearFilters} className="inline-flex items-center justify-center gap-2  border border-slate-300/70 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50">Clear all</button>
          </div>
        </div>
      )}

      <div className="overflow-hidden  border border-slate-200/70 bg-white/85 shadow-[0_16px_34px_rgba(15,23,42,0.08)] backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-180 w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="bg-[linear-gradient(180deg,rgba(244,247,251,0.95)_0%,rgba(237,242,247,0.92)_100%)]">
                <th className="border-b border-slate-200/80 px-4 py-3 text-left text-[0.76rem] font-bold uppercase tracking-[0.03em] text-slate-500">Date</th>
                <th className="border-b border-slate-200/80 px-4 py-3 text-left text-[0.76rem] font-bold uppercase tracking-[0.03em] text-slate-500">Admin</th>
                <th className="border-b border-slate-200/80 px-4 py-3 text-left text-[0.76rem] font-bold uppercase tracking-[0.03em] text-slate-500">Action</th>
                <th className="border-b border-slate-200/80 px-4 py-3 text-left text-[0.76rem] font-bold uppercase tracking-[0.03em] text-slate-500">Entity</th>
                <th className="border-b border-slate-200/80 px-4 py-3 text-left text-[0.76rem] font-bold uppercase tracking-[0.03em] text-slate-500">Details</th>
                <th className="border-b border-slate-200/80 px-4 py-3 text-left text-[0.76rem] font-bold uppercase tracking-[0.03em] text-slate-500">IP</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">Loading audit logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-slate-500">No audit logs found</td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="transition hover:bg-slate-50/80">
                    <td className="border-b border-slate-200/80 px-4 py-4 text-xs text-slate-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="border-b border-slate-200/80 px-4 py-4 text-slate-700">{log.adminEmail}</td>
                    <td className="border-b border-slate-200/80 px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="border-b border-slate-200/80 px-4 py-4 text-slate-500">{log.entityType} #{log.entityId}</td>
                    <td className="border-b border-slate-200/80 px-4 py-4 max-w-50 truncate text-slate-500" title={log.details}>{log.details || '—'}</td>
                    <td className="border-b border-slate-200/80 px-4 py-4 text-xs font-mono text-slate-400">{log.ipAddress || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/80 px-4 py-4">
            <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => fetchLogs(page - 1)} disabled={page <= 1} className="inline-flex items-center justify-center gap-2  border border-slate-300/70 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
              <button onClick={() => fetchLogs(page + 1)} disabled={page >= totalPages} className="inline-flex items-center justify-center gap-2  border border-slate-300/70 bg-white/90 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
