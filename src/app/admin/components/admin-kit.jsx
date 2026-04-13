import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function formatAdminMoney(value) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatAdminDate(value) {
  if (!value) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function getStatusVariant(status) {
  switch (String(status || '').toUpperCase()) {
    case 'SUCCESS':
      return 'success';
    case 'PENDING':
      return 'warning';
    case 'FAILED':
    case 'REJECTED':
      return 'danger';
    default:
      return 'info';
  }
}

export function StatusBadge({ status, className }) {
  return (
    <Badge variant={getStatusVariant(status)} className={cn('admin-status-badge', className)}>
      {status || 'UNKNOWN'}
    </Badge>
  );
}

export function AdminPageHeader({ eyebrow = 'AngelX admin', title, description, actions }) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-cyan-700/80">{eyebrow}</p>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950 md:text-3xl">{title}</h1>
          <p className="max-w-3xl text-[13px] leading-6 text-slate-600 md:text-sm">{description}</p>
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminSurface({ className, title, description, action, children, contentClassName }) {
  return (
    <Card className={cn('overflow-hidden border-white/80 bg-white/90 backdrop-blur', className)}>
      {(title || description || action) ? (
        <CardHeader className="flex flex-col gap-3 border-b border-slate-200/70 pb-4 md:flex-row md:items-start md:justify-between">
          <div>
            {title ? <CardTitle className="text-base tracking-[-0.02em] md:text-lg">{title}</CardTitle> : null}
            {description ? <CardDescription className="mt-1 text-[13px] leading-5 text-slate-500 md:text-sm">{description}</CardDescription> : null}
          </div>
          {action ? <div className="flex shrink-0 items-center gap-3">{action}</div> : null}
        </CardHeader>
      ) : null}
      <CardContent className={cn('p-4 sm:p-5', contentClassName)}>{children}</CardContent>
    </Card>
  );
}

export function AdminMetricCard({ label, value, detail, icon: Icon, tone = 'slate' }) {
  const toneMap = {
    slate: 'from-slate-950 via-slate-900 to-slate-800 text-white',
    cyan: 'from-cyan-500 via-sky-500 to-blue-600 text-white',
    emerald: 'from-emerald-500 via-emerald-600 to-teal-700 text-white',
    amber: 'from-amber-400 via-orange-500 to-rose-500 text-white',
  };

  return (
    <div className={cn('border border-white/70 bg-linear-to-br p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)] sm:p-5', toneMap[tone])}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/72">{label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-[-0.04em] md:text-[1.75rem]">{value}</p>
        </div>
        {Icon ? (
          <div className="flex h-9 w-9 items-center justify-center bg-white/15 ring-1 ring-white/20 backdrop-blur-sm md:h-10 md:w-10">
            <Icon className="h-4 w-4 md:h-5 md:w-5" />
          </div>
        ) : null}
      </div>
      <p className="mt-4 text-[12px] leading-5 text-white/82 md:text-[13px]">{detail}</p>
    </div>
  );
}

export function AdminEmptyState({ title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-slate-200 bg-slate-50/80 px-4 py-10 text-center sm:px-6 sm:py-12">
      <p className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500 shadow-sm">No items</p>
      <h3 className="mt-4 text-base font-semibold text-slate-900 sm:text-lg">{title}</h3>
      <p className="mt-2 max-w-md text-[13px] leading-6 text-slate-500 md:text-sm">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function AdminKeyValueList({ items, compact = false }) {
  return (
    <div className={cn('grid gap-2.5', compact ? 'sm:grid-cols-2' : 'sm:grid-cols-2 xl:grid-cols-3')}>
      {items.map((item) => (
        <div key={item.label} className="border border-slate-200/80 bg-slate-50/80 px-3 py-2.5 sm:px-4 sm:py-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
          <div className="mt-1.5 break-words text-[13px] leading-5 text-slate-900 md:text-sm">{item.value}</div>
        </div>
      ))}
    </div>
  );
}