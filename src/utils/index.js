export const errMsg = (err, fallback = 'Something went wrong.') =>
  err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback;
export const fieldErrors = (err) => {
  const e = err?.response?.data?.errors;
  if (!e) return {};
  if (Array.isArray(e)) return Object.fromEntries(e.map((x) => [x.field || x.path, x.message]));
  return e;
};
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : '—');
export const toInputDate = (d) => (d ? String(d).slice(0, 10) : '');
export const fmtMoney = (n) => (n === null || n === undefined || n === '' ? '—' : Number(n).toLocaleString(undefined, { maximumFractionDigits: 0 }));
export const slugify = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
