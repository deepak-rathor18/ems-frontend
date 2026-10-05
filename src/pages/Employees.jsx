import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useFetch, { unwrap } from '../hooks/useFetch';
import { departmentApi, employeeApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { AsyncState, ConfirmDialog, PageHeader, StatusBadge, Table, Td } from '../components/ui';
import { errMsg, fmtDate, fmtMoney } from '../utils';

export default function Employees() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [status, setStatus] = useState('');
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { const t = setTimeout(() => setQ(search.trim()), 400); return () => clearTimeout(t); }, [search]);

  const depts = unwrap(useFetch(() => departmentApi.list()).data);
  const { data, loading, error, reload } = useFetch(
    () => employeeApi.list(Object.fromEntries(Object.entries({ search: q, departmentId, status }).filter(([, v]) => v))),
    [q, departmentId, status]
  );
  const list = unwrap(data);
  const filtered = q || departmentId || status;

  const remove = async () => {
    setBusy(true);
    try { await employeeApi.remove(del.id); toast.success('Employee removed.'); setDel(null); reload(); }
    catch (e) { toast.error(errMsg(e)); setDel(null); }
    finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Employees" action={<Link to="/employees/new" className="btn-primary">Add employee</Link>} />
      <div className="card mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input className="input" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
          <option value="">All departments</option>{depts.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
        </select>
        <button className="btn-secondary" disabled={!filtered && !search} onClick={() => { setSearch(''); setQ(''); setDepartmentId(''); setStatus(''); }}>Clear filters</button>
      </div>
      <AsyncState loading={loading} error={error} empty={!list.length} noun="employees" onRetry={reload}>
        <Table head={['Full name', 'Email', 'Phone', 'Job title', 'Department', 'Joined', 'Salary', 'Status', 'Actions']}>
          {list.map((e) => (
            <tr key={e.id}>
              <Td className="font-medium">{e.fullName}</Td><Td>{e.email}</Td><Td>{e.phone || '—'}</Td><Td>{e.jobTitle}</Td>
              <Td>{e.department?.name || '—'}</Td><Td>{fmtDate(e.joiningDate)}</Td><Td>{fmtMoney(e.salary)}</Td><Td><StatusBadge status={e.status} /></Td>
              <Td><div className="flex gap-3 text-sm font-semibold">
                <Link className="text-slate-600" to={`/employees/${e.id}`}>View</Link>
                <Link className="text-brand-600" to={`/employees/${e.id}/edit`}>Edit</Link>
                <button className="text-red-600" onClick={() => setDel(e)}>Delete</button>
              </div></Td>
            </tr>
          ))}
        </Table>
      </AsyncState>
      <ConfirmDialog open={!!del} danger loading={busy} title="Remove employee" confirmLabel="Remove" message={`Remove ${del?.fullName}? This may deactivate or delete the record.`} onConfirm={remove} onClose={() => setDel(null)} />
    </>
  );
}
