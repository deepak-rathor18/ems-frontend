import { useEffect } from 'react';

export function Spinner({ className = 'h-4 w-4' }) {
  return <span className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`} aria-hidden />;
}

export function Button({ loading, children, variant = 'primary', className = '', ...p }) {
  return (
    <button {...p} disabled={loading || p.disabled} className={`btn-${variant} ${className}`}>
      {loading && <Spinner />}{children}
    </button>
  );
}

export function Field({ label, error, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export const inputCls = (err) => `input ${err ? 'input-err' : ''}`;

/** Wraps a fetch result: loading / error / empty / content. */
export function AsyncState({ loading, error, empty, noun = 'items', onRetry, children }) {
  if (loading) return <div className="flex items-center justify-center gap-2 py-16 text-slate-500"><Spinner className="h-5 w-5" />Loading {noun}...</div>;
  if (error) return (
    <div className="py-16 text-center">
      <p className="text-red-600">Failed to load {noun}.</p>
      <p className="mt-1 text-sm text-slate-500">{error}</p>
      {onRetry && <button onClick={onRetry} className="btn-secondary mt-4">Try again</button>}
    </div>
  );
  if (empty) return <div className="py-16 text-center text-slate-500">No {noun} found.</div>;
  return children;
}

const BADGES = {
  ACTIVE: 'bg-emerald-50 text-emerald-700', INACTIVE: 'bg-slate-100 text-slate-600',
  PENDING: 'bg-amber-50 text-amber-700', APPROVED: 'bg-emerald-50 text-emerald-700', REJECTED: 'bg-red-50 text-red-700',
};
export function StatusBadge({ status }) {
  const s = String(status || '').toUpperCase();
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGES[s] || 'bg-slate-100 text-slate-600'}`}>{s.charAt(0) + s.slice(1).toLowerCase()}</span>;
}

export function Modal({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onMouseDown={(e) => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger, loading, onConfirm, onClose }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant={danger ? 'danger' : 'primary'} loading={loading} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div><h1 className="text-2xl font-bold">{title}</h1>{subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}</div>
      {action}
    </div>
  );
}

export function Stat({ label, value, tone = 'text-slate-900' }) {
  return <div className="card"><p className="text-sm text-slate-500">{label}</p><p className={`mt-1 text-3xl font-bold ${tone}`}>{value ?? 0}</p></div>;
}

export function Table({ head, children }) {
  return (
    <div className="card overflow-x-auto p-0">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>{head.map((h) => <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">{children}</tbody>
      </table>
    </div>
  );
}
export const Td = ({ children, className = '' }) => <td className={`px-4 py-3 ${className}`}>{children}</td>;
