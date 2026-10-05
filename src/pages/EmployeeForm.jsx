import { useEffect, useState } from "react";

import { Link, useNavigate, useParams } from "react-router-dom";

import useFetch, { unwrap } from "../hooks/useFetch";

import { departmentApi, employeeApi } from "../services/api";

import { useToast } from "../context/ToastContext";

import {
  AsyncState,
  Button,
  Field,
  inputCls,
  PageHeader,
} from "../components/ui";

import { errMsg, fieldErrors, isEmail, toInputDate } from "../utils";

const EMPTY = {
  fullName: "",
  email: "",
  phone: "",
  jobTitle: "",
  departmentId: "",
  joiningDate: "",
  salary: "",
  status: "ACTIVE",
  password: "",
};

export default function EmployeeForm({ readOnly = false }) {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();

  const [f, setF] = useState(EMPTY);
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);

  const departmentsFetch = useFetch(() => departmentApi.list());
  const depts = unwrap(departmentsFetch.data);

  const { data, loading, error, reload } = useFetch(
    () => (id ? employeeApi.get(id) : Promise.resolve(null)),
    [id],
  );

  // Load employee data for edit/view
  useEffect(() => {
    const e = data?.employee || data;

    if (e) {
      setF({
        ...EMPTY,
        ...e,
        departmentId: e.departmentId ?? e.department?.id ?? "",
        joiningDate: toInputDate(e.joiningDate),
        phone: e.phone || "",
        salary: e.salary ?? "",
        password: "",
      });
    }
  }, [data]);

  const set = (key) => (e) => {
    setF((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const ro = readOnly;

  const validate = () => {
    const v = {};

    if (!f.fullName.trim()) {
      v.fullName = "Full name is required.";
    }

    if (!isEmail(f.email)) {
      v.email = "Enter a valid email address.";
    }

    if (f.phone && !/^[0-9+\-\s()]{7,15}$/.test(f.phone)) {
      v.phone = "Enter a valid phone number.";
    }

    if (!f.jobTitle.trim()) {
      v.jobTitle = "Job title is required.";
    }

    if (!f.departmentId) {
      v.departmentId = "Select a department.";
    }

    if (!f.joiningDate) {
      v.joiningDate = "Joining date is required.";
    }

    if (
      f.salary === "" ||
      Number(f.salary) < 0 ||
      Number.isNaN(Number(f.salary))
    ) {
      v.salary = "Enter a valid salary (0 or more).";
    }

    // Password is required only while creating employee
    if (!id && !f.password.trim()) {
      v.password = "Password is required.";
    }

    if (!id && f.password && f.password.length < 8) {
      v.password = "Password must be at least 8 characters.";
    }

    return v;
  };

  const submit = async (e) => {
    e.preventDefault();

    const v = validate();

    setErrs(v);

    if (Object.keys(v).length) {
      return;
    }

    setBusy(true);

    const body = {
      fullName: f.fullName.trim(),
      email: f.email.trim(),
      phone: f.phone.trim(),
      jobTitle: f.jobTitle.trim(),
      departmentId: Number(f.departmentId),
      joiningDate: f.joiningDate,
      salary: Number(f.salary),
      status: f.status,
    };

    // Password is only sent when creating a new employee
    if (!id) {
      body.password = f.password;
    }

    try {
      if (id) {
        await employeeApi.update(id, body);
        toast.success("Employee updated.");
      } else {
        await employeeApi.create(body);
        toast.success("Employee added.");
      }

      nav("/employees");
    } catch (ex) {
      setErrs(fieldErrors(ex));
      toast.error(errMsg(ex));
    } finally {
      setBusy(false);
    }
  };

  const input = (key, label, props = {}) => (
    <Field label={label} error={errs[key]}>
      <input
        className={inputCls(errs[key])}
        value={f[key] ?? ""}
        onChange={set(key)}
        disabled={ro}
        {...props}
      />
    </Field>
  );

  return (
    <>
      <PageHeader
        title={ro ? "Employee details" : id ? "Edit employee" : "Add employee"}
        action={
          ro && (
            <Link to={`/employees/${id}/edit`} className="btn-primary">
              Edit
            </Link>
          )
        }
      />

      <AsyncState
        loading={!!id && loading}
        error={error}
        noun="employee"
        onRetry={reload}
      >
        <form
          onSubmit={submit}
          noValidate
          className="card grid gap-4 sm:grid-cols-2"
        >
          {input("fullName", "Full name")}

          {input("email", "Email", {
            type: "email",
            autoComplete: "email",
          })}

          {input("phone", "Phone", {
            type: "tel",
          })}

          {input("jobTitle", "Job title")}

          <Field label="Department" error={errs.departmentId}>
            <select
              className={inputCls(errs.departmentId)}
              value={f.departmentId}
              onChange={set("departmentId")}
              disabled={ro}
            >
              <option value="">Select department</option>

              {depts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>

          {input("joiningDate", "Joining date", {
            type: "date",
          })}

          {input("salary", "Salary", {
            type: "number",
            min: 0,
          })}

          <Field label="Status">
            <select
              className="input"
              value={f.status}
              onChange={set("status")}
              disabled={ro}
            >
              <option value="ACTIVE">Active</option>

              <option value="INACTIVE">Inactive</option>
            </select>
          </Field>

          {/* Password only for new employee */}
          {!id &&
            input("password", "Password", {
              type: "password",
              autoComplete: "new-password",
              placeholder: "Enter password",
            })}

          <div className="flex justify-end gap-2 sm:col-span-2">
            <Link to="/employees" className="btn-secondary">
              {ro ? "Back" : "Cancel"}
            </Link>

            {!ro && (
              <Button type="submit" loading={busy}>
                {id ? "Save changes" : "Add employee"}
              </Button>
            )}
          </div>
        </form>
      </AsyncState>
    </>
  );
}
