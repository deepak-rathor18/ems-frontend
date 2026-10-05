import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../services/api';
import { Button, Field, inputCls } from '../components/ui';
import { errMsg, fieldErrors, isEmail, slugify } from '../utils';

function Shell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center text-2xl font-bold">EMS<span className="text-brand-500">.</span></div>
        <div className="card p-6 shadow-sm">
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="mb-5 mt-1 text-sm text-slate-500">{subtitle}</p>
          {children}
        </div>
        <p className="mt-4 text-center text-sm text-slate-600">{footer}</p>
      </div>
    </div>
  );
}

export function Login() {
  const { login, user } = useAuth();
  const toast = useToast();
  const nav = useNavigate();
  const loc = useLocation();
  const [f, setF] = useState({ email: '', password: '' });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!isEmail(f.email)) v.email = 'Enter a valid email address.';
    if (!f.password) v.password = 'Password is required.';
    setErrs(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try { await login(f.email, f.password); nav(loc.state?.from?.pathname || '/dashboard', { replace: true }); }
    catch (err) { toast.error(errMsg(err, 'Login failed.')); }
    finally { setBusy(false); }
  };

  return (
    <Shell title="Welcome back" subtitle="Log in to your organization's workspace." footer={<>New organization? <Link className="font-semibold text-brand-600" to="/register">Register</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email" error={errs.email}><input type="email" className={inputCls(errs.email)} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} autoComplete="email" /></Field>
        <Field label="Password" error={errs.password}><input type="password" className={inputCls(errs.password)} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="current-password" /></Field>
        <Button type="submit" loading={busy} className="w-full">Log in</Button>
      </form>
    </Shell>
  );
}

export function Register() {
  const toast = useToast();
  const nav = useNavigate();
  const [f, setF] = useState({ companyName: '', slug: '', email: '', password: '' });
  const [slugTouched, setSlugTouched] = useState(false);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value, ...(k === 'companyName' && !slugTouched ? { slug: slugify(e.target.value) } : {}) }));

  const submit = async (e) => {
    e.preventDefault();
    const v = {};
    if (!f.companyName.trim()) v.companyName = 'Company name is required.';
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(f.slug)) v.slug = 'Use lowercase letters, numbers and hyphens only.';
    if (!isEmail(f.email)) v.email = 'Enter a valid email address.';
    if (f.password.length < 8) v.password = 'Password must be at least 8 characters.';
    setErrs(v);
    if (Object.keys(v).length) return;
    setBusy(true);
    try { await authApi.registerOrganization(f); toast.success('Organization created. Please log in.'); nav('/login'); }
    catch (err) { setErrs(fieldErrors(err)); toast.error(errMsg(err, 'Registration failed.')); }
    finally { setBusy(false); }
  };

  return (
    <Shell title="Create your organization" subtitle="You'll be the admin of this workspace." footer={<>Already registered? <Link className="font-semibold text-brand-600" to="/login">Log in</Link></>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Company name" error={errs.companyName}><input className={inputCls(errs.companyName)} value={f.companyName} onChange={set('companyName')} /></Field>
        <Field label="Domain / slug" error={errs.slug} hint="Unique identifier for your organization."><input className={inputCls(errs.slug)} value={f.slug} onChange={(e) => { setSlugTouched(true); setF({ ...f, slug: e.target.value }); }} /></Field>
        <Field label="Admin email" error={errs.email}><input type="email" className={inputCls(errs.email)} value={f.email} onChange={set('email')} /></Field>
        <Field label="Password" error={errs.password}><input type="password" className={inputCls(errs.password)} value={f.password} onChange={set('password')} autoComplete="new-password" /></Field>
        <Button type="submit" loading={busy} className="w-full">Create organization</Button>
      </form>
    </Shell>
  );
}
