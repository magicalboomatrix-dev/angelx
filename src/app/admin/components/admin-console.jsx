'use client';

import Link from 'next/link';
import { Search, ChevronLeft, ChevronRight, UserRound, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

import {
  AdminEmptyState,
  AdminKeyValueList,
  AdminSurface,
  StatusBadge,
  formatAdminDate,
  formatAdminMoney,
} from './admin-kit';

export function AdminSearchField({ value, onChange, placeholder = 'Search' }) {
  return (
    <label className="relative block min-w-55">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input className="pl-11" value={value} onChange={onChange} placeholder={placeholder} />
    </label>
  );
}

export function AdminPagination({ page, pageSize, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));

  return (
    <div className="flex flex-col gap-3  border border-slate-200/80 bg-white/85 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-900">{total === 0 ? 0 : (page - 1) * pageSize + 1}</span>
        {' '}to{' '}
        <span className="font-semibold text-slate-900">{Math.min(page * pageSize, total)}</span>
        {' '}of{' '}
        <span className="font-semibold text-slate-900">{total}</span> entries
      </p>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <div className=" border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
          Page {page} / {totalPages}
        </div>
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function AdminUserIdentity({ user, href, muted = false }) {
  const content = (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center  bg-slate-100 text-slate-600 ring-1 ring-slate-200">
        <UserRound className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">{user?.mobile ? `+91 ${user.mobile}` : user?.id ? `User #${user.id}` : 'Unknown user'}</p>
        <p className="truncate text-xs text-slate-500">{user?.id ? `User #${user.id}` : 'No contact available'}</p>
      </div>
    </div>
  );

  if (!href) {
    return content;
  }

  return (
    <Link href={href} className={muted ? 'opacity-90 transition hover:opacity-100' : 'transition hover:opacity-85'}>
      {content}
    </Link>
  );
}

export function AdminLoadingSurface({ title = 'Loading data', description = 'Fetching the latest records from the operations backend.' }) {
  return (
    <AdminSurface>
      <div className="flex flex-col items-center justify-center gap-4 py-10 text-center sm:py-12">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />
        <div>
          <p className="text-base font-semibold text-slate-900 md:text-lg">{title}</p>
          <p className="mt-2 text-[13px] text-slate-500 md:text-sm">{description}</p>
        </div>
      </div>
    </AdminSurface>
  );
}

export function AdminTransactionDetailDialog({
  open,
  onOpenChange,
  transaction,
  title = 'Transaction details',
  description = 'Inspect the full settlement context and associated user information.',
  children,
  footer,
}) {
  if (!transaction) {
    return null;
  }

  const userItems = transaction.user
    ? [
        { label: 'User', value: transaction.user.mobile ? `+91 ${transaction.user.mobile}` : `User #${transaction.user.id}` },
        { label: 'User ID', value: transaction.user.id ? `#${transaction.user.id}` : 'Not provided' },
        { label: 'Mobile', value: transaction.user.mobile || 'Not provided' },
      ]
    : [];

  const transactionItems = [
    { label: 'Reference ID', value: transaction.referenceId || 'N/A' },
    { label: 'Transaction type', value: transaction.type || 'N/A' },
    { label: 'Status', value: <StatusBadge status={transaction.status} /> },
    { label: 'Amount', value: `${formatAdminMoney(transaction.amount)} ${transaction.currency || 'USDT'}` },
    { label: 'Network', value: transaction.network || 'N/A' },
    { label: 'Address', value: transaction.address || 'N/A' },
    { label: 'Blockchain Txn ID', value: transaction.txnId || 'N/A' },
    { label: 'Created at', value: formatAdminDate(transaction.createdAt) },
    { label: 'Reviewed at', value: transaction.reviewedAt ? formatAdminDate(transaction.reviewedAt) : 'Not reviewed' },
    { label: 'Reviewed by', value: transaction.reviewedBy?.email || 'N/A' },
    { label: 'Description', value: transaction.description || 'No description' },
    { label: 'Review note', value: transaction.reviewNote || 'No review note' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto admin-scrollbar sm:max-w-230">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {transaction.user ? (
            <AdminSurface
              title="Account overview"
              description="Linked user and wallet posture at the time of review."
              contentClassName="space-y-5"
            >
              <AdminUserIdentity user={transaction.user} />
              <AdminKeyValueList
                compact
                items={[
                  ...userItems,
                  { label: 'Available wallet', value: `${formatAdminMoney(transaction.user?.wallet?.usdtAvailable || 0)} USDT` },
                  { label: 'Locked wallet', value: `${formatAdminMoney(transaction.user?.wallet?.usdtLocked || 0)} USDT` },
                  { label: 'Deposited total', value: `${formatAdminMoney(transaction.user?.wallet?.usdtDeposited || 0)} USDT` },
                  { label: 'Withdrawn total', value: `${formatAdminMoney(transaction.user?.wallet?.usdtWithdrawn || 0)} USDT` },
                ]}
              />
            </AdminSurface>
          ) : null}

          <AdminSurface title="Transaction breakdown" description="Operational metadata, ledger linkage, and approval context.">
            <AdminKeyValueList items={transactionItems} />
          </AdminSurface>

          {children}
        </div>

        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}

export function AdminRemarksPanel({ title = 'Remarks', remarks }) {
  return (
    <AdminSurface title={title} description="Operator comments, freeform notes, and review observations.">
      {remarks ? (
        <div className=" border border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
          {remarks}
        </div>
      ) : (
        <AdminEmptyState
          title="No remarks yet"
          description="This record does not have any operator remarks or review notes attached yet."
          action={<FileText className="h-4 w-4 text-slate-400" />}
        />
      )}
    </AdminSurface>
  );
}