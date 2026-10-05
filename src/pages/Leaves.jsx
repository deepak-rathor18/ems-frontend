import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useFetch, { unwrap } from '../hooks/useFetch';
import { leaveApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { AsyncState, Button, ConfirmDialog, Field, inputCls, PageHeader, StatusBadge, Table, Td } from '../components/ui';
import { LEAVE_TYPES } from '../constants';
import { errMsg, fieldErrors, fmtDate } from '../utils';

export function LeaveRequests() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => leaveApi.list());
  const list = unwrap(data);
  const [pending, setPending] = useState(null); // { leave, status }
  const [busy, setBusy] = useState(false);

  const act = async () => {
    setBusy(true);
    try { await leaveApi.setStatus(pending.leave.id, pending.status); toast.success(`Leave ${pending.status.toLowerCase()}.`); setPending(null); reload(); }
    catch (e) { toast.error(errMsg(e)); setPending(null); }
    finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Leave requests" />
      <AsyncState loading={loading} error={error} empty={!list.length} noun="leave requests" onRetry={reload}>
        <Table head={['Employee', 'Department', 'Type', 'Start', 'End', 'Reason', 'Status', 'Actions']}>
          {list.map((l) => (
            <tr key={l.id}>
              <Td className="font-medium">{l.employee?.fullName || '—'}</Td><Td>{l.employee?.department?.name || '—'}</Td><Td>{l.leaveType}</Td>
              <Td>{fmtDate(l.startDate)}</Td><Td>{fmtDate(l.endDate)}</Td><Td className="max-w-xs truncate" >{l.reason}</Td><Td><StatusBadge status={l.status} /></Td>
              <Td>{l.status === 'PENDING' ? (
                <div className="flex gap-3 text-sm font-semibold">
                  <button className="text-emerald-600" onClick={() => setPending({ leave: l, status: 'APPROVED' })}>Approve</button>
                  <button className="text-red-600" onClick={() => setPending({ leave: l, status: 'REJECTED' })}>Reject</button>
                </div>) : <span className="text-slate-400">—</span>}</Td>
            </tr>
          ))}
        </Table>
      </AsyncState>
      <ConfirmDialog open={!!pending} danger={pending?.status === 'REJECTED'} loading={busy} title={pending?.status === 'APPROVED' ? 'Approve leave' : 'Reject leave'}
        confirmLabel={pending?.status === 'APPROVED' ? 'Approve' : 'Reject'} message={`${pending?.status === 'APPROVED' ? 'Approve' : 'Reject'} ${pending?.leave.employee?.fullName || 'this employee'}'s leave request?`} onConfirm={act} onClose={() => setPending(null)} />
    </>
  );
}

export function MyLeaves() {
  const { data, loading, error, reload } = useFetch(() => leaveApi.mine());
  const list = unwrap(data);
  return (
    <>
      <PageHeader title="My leaves" action={<Link to="/leaves/apply" className="btn-primary">Apply leave</Link>} />
      <AsyncState loading={loading} error={error} empty={!list.length} noun="leaves" onRetry={reload}>
        <Table head={['Type', 'Start', 'End', 'Reason', 'Status']}>
          {list.map((l) => <tr key={l.id}><Td>{l.leaveType}</Td><Td>{fmtDate(l.startDate)}</Td><Td>{fmtDate(l.endDate)}</Td><Td className="max-w-xs truncate">{l.reason}</Td><Td><StatusBadge status={l.status} /></Td></tr>)}
        </Table>
      </AsyncState>
    </>
  );
}

export function ApplyLeave() {
  const toast = useToast();
  const nav = useNavigate();
  const [f, setF] = useState({ leaveType: '', startDate: '', endDate: '', reason: '' });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!f.leaveType) v.leaveType = 'Select a leave type.';
    if (!f.startDate) v.startDate = 'Start date is required.';
    if (!f.endDate) v.endDate = 'End date is required.';
    else if (f.startDate && f.endDate < f.startDate) v.endDate = 'End date cannot be before start date.';
    if (!f.reason.trim()) v.reason = 'Reason is required.';
    setErrs(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try { await leaveApi.apply({ ...f, reason: f.reason.trim() }); toast.success('Leave request submitted.'); nav('/my-leaves'); }
    catch (ex) { setErrs(fieldErrors(ex)); toast.error(errMsg(ex)); }
    finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Apply leave" />
      <form onSubmit={submit} noValidate className="card grid max-w-2xl gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><Field label="Leave type" error={errs.leaveType}>
          <select className={inputCls(errs.leaveType)} value={f.leaveType} onChange={set('leaveType')}><option value="">Select type</option>{LEAVE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select>
        </Field></div>
        <Field label="Start date" error={errs.startDate}><input type="date" className={inputCls(errs.startDate)} value={f.startDate} onChange={set('startDate')} /></Field>
        <Field label="End date" error={errs.endDate}><input type="date" min={f.startDate} className={inputCls(errs.endDate)} value={f.endDate} onChange={set('endDate')} /></Field>
        <div className="sm:col-span-2"><Field label="Reason" error={errs.reason}><textarea rows={4} className={inputCls(errs.reason)} value={f.reason} onChange={set('reason')} /></Field></div>
        <div className="flex justify-end gap-2 sm:col-span-2"><Link to="/my-leaves" className="btn-secondary">Cancel</Link><Button type="submit" loading={busy}>Submit request</Button></div>
      </form>
    </>
  );
}
