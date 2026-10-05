import { useEffect, useState } from 'react';
import useFetch, { unwrap } from '../hooks/useFetch';
import { departmentApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { AsyncState, Button, ConfirmDialog, Field, inputCls, Modal, PageHeader, Table, Td } from '../components/ui';
import { errMsg, fieldErrors, fmtDate } from '../utils';

function DepartmentModal({ open, dept, onClose, onSaved }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) { setName(dept?.name || ''); setErr(''); } }, [open, dept]);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setErr('Department name is required.');
    setBusy(true);
    try {
      dept ? await departmentApi.update(dept.id, { name: name.trim() }) : await departmentApi.create({ name: name.trim() });
      toast.success(dept ? 'Department updated.' : 'Department added.');
      onSaved();
    } catch (ex) { setErr(fieldErrors(ex).name || errMsg(ex)); }
    finally { setBusy(false); }
  };
  return (
    <Modal open={open} title={dept ? 'Edit department' : 'Add department'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Name" error={err}><input autoFocus className={inputCls(err)} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={onClose}>Cancel</Button><Button type="submit" loading={busy}>Save</Button></div>
      </form>
    </Modal>
  );
}

export default function Departments() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch(() => departmentApi.list());
  const list = unwrap(data);
  const [modal, setModal] = useState({ open: false, dept: null });
  const [del, setDel] = useState(null);
  const [busy, setBusy] = useState(false);

  const remove = async () => {
    setBusy(true);
    try { await departmentApi.remove(del.id); toast.success('Department deleted.'); setDel(null); reload(); }
    catch (e) { toast.error(errMsg(e)); setDel(null); }
    finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Departments" action={<Button onClick={() => setModal({ open: true, dept: null })}>Add department</Button>} />
      <AsyncState loading={loading} error={error} empty={!list.length} noun="departments" onRetry={reload}>
        <Table head={['Name', 'Employees', 'Created', 'Actions']}>
          {list.map((d) => (
            <tr key={d.id}>
              <Td className="font-medium">{d.name}</Td><Td>{d.employeeCount ?? d._count?.employees ?? 0}</Td><Td>{fmtDate(d.createdAt)}</Td>
              <Td><div className="flex gap-3 text-sm font-semibold">
                <button className="text-brand-600" onClick={() => setModal({ open: true, dept: d })}>Edit</button>
                <button className="text-red-600" onClick={() => setDel(d)}>Delete</button>
              </div></Td>
            </tr>
          ))}
        </Table>
      </AsyncState>
      <DepartmentModal open={modal.open} dept={modal.dept} onClose={() => setModal({ open: false, dept: null })} onSaved={() => { setModal({ open: false, dept: null }); reload(); }} />
      <ConfirmDialog open={!!del} danger loading={busy} title="Delete department" confirmLabel="Delete" message={`Delete "${del?.name}"? This cannot be undone.`} onConfirm={remove} onClose={() => setDel(null)} />
    </>
  );
}
