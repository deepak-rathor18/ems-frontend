import useFetch, { unwrap } from "../hooks/useFetch";
import { employeeApi, organizationApi } from "../services/api";

import {
  AsyncState,
  PageHeader,
  StatusBadge,
  Table,
  Td,
} from "../components/ui";

import { Detail } from "./Dashboard";
import { fmtDate } from "../utils";

/* =========================
   MY PROFILE
========================= */

export function Profile() {
  const { data, loading, error, reload } = useFetch(() => employeeApi.me());

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
  */

  const e = data?.data || data?.employee || data || null;

  return (
    <>
      <PageHeader
        title="My profile"
        subtitle="Contact your administrator to change these details."
      />

      <AsyncState
        loading={loading}
        error={error}
        noun="profile"
        onRetry={reload}
      >
        <div className="card">
          <dl className="grid gap-5 sm:grid-cols-2">
            <Detail label="Full name">{e?.fullName}</Detail>

            <Detail label="Email">{e?.email}</Detail>

            <Detail label="Phone">{e?.phone}</Detail>

            <Detail label="Department">{e?.department?.name}</Detail>

            <Detail label="Job title">{e?.jobTitle}</Detail>

            <Detail label="Joining date">{fmtDate(e?.joiningDate)}</Detail>

            <Detail label="Salary">
              {e?.salary != null
                ? `₹${Number(e.salary).toLocaleString("en-IN")}`
                : "—"}
            </Detail>

            <Detail label="Status">
              {e && <StatusBadge status={e.status} />}
            </Detail>
          </dl>
        </div>
      </AsyncState>
    </>
  );
}

/* =========================
   ORGANIZATIONS
========================= */

export function Organizations() {
  const { data, loading, error, reload } = useFetch(() =>
    organizationApi.list(),
  );

  const orgs = unwrap(data);

  return (
    <>
      <PageHeader
        title="Organizations"
        subtitle="Manage and monitor all registered organizations."
      />

      <AsyncState
        loading={loading}
        error={error}
        empty={!orgs.length}
        noun="organizations"
        onRetry={reload}
      >
        <div className="card overflow-hidden">
          <Table
            head={[
              "Organization",
              "Slug",
              "Users",
              "Departments",
              "Employees",
              "Leave Requests",
              "Created",
            ]}
          >
            {orgs.map((org) => (
              <tr key={org.id} className="transition hover:bg-slate-50">
                {/* Organization */}
                <Td>
                  <div>
                    <div className="font-semibold text-slate-900">
                      {org.name}
                    </div>

                    <div className="mt-1 text-xs text-slate-500">
                      ID: #{org.id}
                    </div>
                  </div>
                </Td>

                {/* Slug */}
                <Td>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    {org.slug}
                  </span>
                </Td>

                {/* Users */}
                <Td>
                  <span className="font-medium text-slate-700">
                    {org.counts?.users ?? 0}
                  </span>
                </Td>

                {/* Departments */}
                <Td>
                  <span className="font-medium text-slate-700">
                    {org.counts?.departments ?? 0}
                  </span>
                </Td>

                {/* Employees */}
                <Td>
                  <span className="font-medium text-slate-700">
                    {org.counts?.employees ?? 0}
                  </span>
                </Td>

                {/* Leave Requests */}
                <Td>
                  <span className="font-medium text-slate-700">
                    {org.counts?.leaveRequests ?? 0}
                  </span>
                </Td>

                {/* Created */}
                <Td>
                  <div className="text-sm text-slate-700">
                    {fmtDate(org.createdAt)}
                  </div>
                </Td>
              </tr>
            ))}
          </Table>
        </div>
      </AsyncState>
    </>
  );
}
