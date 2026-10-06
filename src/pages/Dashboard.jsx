import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useFetch, { unwrap } from "../hooks/useFetch";
import {
  dashboardApi,
  employeeApi,
  leaveApi,
  organizationApi,
} from "../services/api";
import {
  AsyncState,
  PageHeader,
  Stat,
  StatusBadge,
  Table,
  Td,
} from "../components/ui";
import { fmtDate } from "../utils";
import { ROLES } from "../constants";

/* =========================
   ADMIN DASHBOARD
========================= */

function AdminDashboard() {
  const { data, loading, error, reload } = useFetch(() => dashboardApi.admin());

  const depts = data?.departmentWise || [];

  const max = Math.max(1, ...depts.map((d) => d.employeeCount ?? 0));

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Headcount and pending work across your organization."
      />

      <AsyncState
        loading={loading}
        error={error}
        noun="dashboard"
        onRetry={reload}
      >
        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Total employees" value={data?.totalEmployees ?? 0} />

          <Stat
            label="Active"
            value={data?.activeEmployees ?? 0}
            tone="text-emerald-600"
          />

          <Stat
            label="Inactive"
            value={data?.inactiveEmployees ?? 0}
            tone="text-slate-500"
          />

          <Stat
            label="Pending leave requests"
            value={data?.pendingLeaveRequests ?? 0}
            tone="text-amber-600"
          />
        </div>

        {/* Employees by Department */}
        <div className="card mt-6">
          <h2 className="mb-4 font-semibold">Employees by department</h2>

          {depts.length === 0 ? (
            <p className="text-sm text-slate-500">No departments found.</p>
          ) : (
            <ul className="space-y-3">
              {depts.map((d) => {
                const count = d.employeeCount ?? 0;

                return (
                  <li
                    key={d.departmentId}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="w-32 shrink-0 truncate">
                      {d.departmentName}
                    </span>

                    <div className="h-3 flex-1 rounded-full bg-slate-100">
                      <div
                        className="h-3 rounded-full bg-brand-500"
                        style={{
                          width: `${(count / max) * 100}%`,
                        }}
                      />
                    </div>

                    <span className="w-8 text-right font-semibold">
                      {count}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </AsyncState>
    </>
  );
}

/* =========================
   DETAIL COMPONENT
========================= */

export function Detail({ label, children }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>

      <dd className="mt-0.5 text-sm font-medium">{children || "—"}</dd>
    </div>
  );
}

/* =========================
   EMPLOYEE DASHBOARD
========================= */

function EmployeeDashboard() {
  const me = useFetch(() => employeeApi.me());

  const lv = useFetch(() => leaveApi.mine());

  /*
    API response:

    {
      success: true,
      data: {
        id: 10,
        fullName: "Deepak Rathor",
        email: "deepak@gmail.com",
        department: {
          id: 7,
          name: "IT"
        }
      }
    }

    employeeApi.me() + useFetch should give us
    the employee object here.
  */

  const employeeData = me.data?.data || me.data?.employee || me.data || null;

  const leaves = unwrap(lv.data);

  const count = (status) =>
    leaves.filter((leave) => leave.status === status).length;

  return (
    <>
      <PageHeader
        title="Dashboard"
        action={
          <Link to="/leaves/apply" className="btn-primary">
            Apply leave
          </Link>
        }
      />

      {/* Employee Profile */}
      <AsyncState
        loading={me.loading}
        error={me.error}
        noun="profile"
        onRetry={me.reload}
      >
        {employeeData && (
          <div className="card">
            <h2 className="mb-4 font-semibold">Personal details</h2>

            <dl className="grid gap-4 sm:grid-cols-3">
              <Detail label="Name">{employeeData.fullName}</Detail>

              <Detail label="Email">{employeeData.email}</Detail>

              <Detail label="Phone">{employeeData.phone}</Detail>

              <Detail label="Department">
                {employeeData.department?.name}
              </Detail>

              <Detail label="Job title">{employeeData.jobTitle}</Detail>

              <Detail label="Joining date">
                {fmtDate(employeeData.joiningDate)}
              </Detail>

              <Detail label="Salary">
                {employeeData.salary != null
                  ? `₹${Number(employeeData.salary).toLocaleString("en-IN")}`
                  : "—"}
              </Detail>

              <Detail label="Status">
                <StatusBadge status={employeeData.status} />
              </Detail>
            </dl>
          </div>
        )}
      </AsyncState>

      {/* Leave Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Stat
          label="Pending leaves"
          value={count("PENDING")}
          tone="text-amber-600"
        />

        <Stat
          label="Approved leaves"
          value={count("APPROVED")}
          tone="text-emerald-600"
        />

        <Stat
          label="Rejected leaves"
          value={count("REJECTED")}
          tone="text-red-600"
        />
      </div>

      {/* Leave History */}
      <h2 className="mb-3 mt-6 font-semibold">Leave history</h2>

      <AsyncState
        loading={lv.loading}
        error={lv.error}
        empty={!leaves.length}
        noun="leaves"
        onRetry={lv.reload}
      >
        <Table head={["Type", "Start", "End", "Reason", "Status"]}>
          {leaves.map((leave) => (
            <tr key={leave.id}>
              <Td>{leave.leaveType}</Td>

              <Td>{fmtDate(leave.startDate)}</Td>

              <Td>{fmtDate(leave.endDate)}</Td>

              <Td className="max-w-xs truncate">{leave.reason}</Td>

              <Td>
                <StatusBadge status={leave.status} />
              </Td>
            </tr>
          ))}
        </Table>
      </AsyncState>
    </>
  );
}

/* =========================
   SUPER ADMIN DASHBOARD
========================= */

function SuperAdminDashboard() {
  const { data, loading, error, reload } = useFetch(() =>
    organizationApi.list(),
  );

  const orgs = unwrap(data);

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Platform overview." />

      <AsyncState
        loading={loading}
        error={error}
        noun="platform data"
        onRetry={reload}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Stat label="Organizations" value={orgs.length} />

          <Link
            to="/organizations"
            className="card flex items-center font-semibold text-brand-600"
          >
            View all organizations
          </Link>
        </div>
      </AsyncState>
    </>
  );
}

/* =========================
   MAIN DASHBOARD
========================= */

export default function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  if (user.role === ROLES.ORG_ADMIN) {
    return <AdminDashboard />;
  }

  if (user.role === ROLES.SUPER_ADMIN) {
    return <SuperAdminDashboard />;
  }

  return <EmployeeDashboard />;
}
