import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { NAV } from "../constants";

export default function AppLayout() {
  const { user, logout } = useAuth();

  const [open, setOpen] = useState(false);

  const nav = useNavigate();

  const role = user?.role;

  const links = NAV[role] || [];

  const doLogout = () => {
    logout();
    nav("/login");
  };

  const sidebar = (
    <nav className="flex h-full w-64 flex-col bg-slate-900 p-4 text-slate-300">
      <div className="mb-8 px-2 text-xl font-bold text-white">
        EMS
        <span className="text-brand-500">.</span>
      </div>

      <ul className="space-y-1">
        {links.map((l) => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              end
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-brand-600 text-white" : "hover:bg-slate-800"
                }`
              }
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 hidden lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50"
            onClick={() => setOpen(false)}
          />

          <div className="relative h-full w-64">{sidebar}</div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
          <button
            className="rounded p-2 hover:bg-slate-100 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>

          <div className="hidden text-sm text-slate-500 lg:block">
            {role?.replace("_", " ").toLowerCase() || ""}
          </div>

          <div className="flex items-center gap-3">
            <span className="max-w-[160px] truncate text-sm font-medium sm:max-w-none">
              {user?.email || ""}
            </span>

            <button onClick={doLogout} className="btn-secondary px-3 py-1.5">
              Log out
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
