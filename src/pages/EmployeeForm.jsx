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

// Supports common Axios and API response structures.
function getEmployeeResponse(response) {
  let result = response;

  // Axios response: { data: ... }
  if (result?.data !== undefined) {
    result = result.data;
  }

  // API response: { employee: ... }
  if (result?.employee !== undefined) {
    result = result.employee;
  }

  // Also support an additional nested response wrapper.
  if (result?.data?.employee !== undefined) {
    result = result.data.employee;
  }

  return result;
}

export default function EmployeeForm({ readOnly = false }) {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();

  const [f, setF] = useState({ ...EMPTY });
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);

  // Load departments for the dropdown.
  const departmentsFetch = useFetch(() => departmentApi.list());

  const depts = unwrap(departmentsFetch.data) || [];

  // Load employee details for View/Edit.
  const { data, loading, error, reload } = useFetch(
    () => (id ? employeeApi.get(id) : Promise.resolve(null)),
    [id],
  );

  // Populate form after the employee API responds.
  useEffect(() => {
    if (!id || !data) return;

    const employee = getEmployeeResponse(data);

    if (!employee || typeof employee !== "object" || Array.isArray(employee)) {
      return;
    }

    setF({
      ...EMPTY,
      ...employee,
      departmentId: employee.departmentId ?? employee.department?.id ?? "",
      joiningDate: toInputDate(employee.joiningDate),
      phone: employee.phone ?? "",
      salary: employee.salary ?? "",
      status: employee.status ?? "ACTIVE",
      password: "",
    });

    setErrs({});
  }, [id, data]);

  // Reset the form when switching between Add and Edit routes.
  useEffect(() => {
    if (!id) {
      setF({ ...EMPTY });
      setErrs({});
    }
  }, [id]);

  // Update one field without changing other fields.
  const set = (key) => (event) => {
    const value = event.target.value;

    setF((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrs((prev) => {
      if (!prev[key]) return prev;

      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const ro = readOnly;

  // Validate form before sending the request.
  const validate = () => {
    const v = {};

    if (!f.fullName.trim()) {
      v.fullName = "Full name is required.";
    }

    if (!f.email.trim() || !isEmail(f.email.trim())) {
      v.email = "Enter a valid email address.";
    }

    if (f.phone && !/^[0-9+\-\s()]{7,15}$/.test(f.phone.trim())) {
      v.phone = "Enter a valid phone number.";
    }

    if (!f.jobTitle.trim()) {
      v.jobTitle = "Job title is required.";
    }

    if (
      f.departmentId === "" ||
      !Number.isInteger(Number(f.departmentId)) ||
      Number(f.departmentId) <= 0
    ) {
      v.departmentId = "Select a valid department.";
    }

    if (!f.joiningDate) {
      v.joiningDate = "Joining date is required.";
    }

    const salary = Number(f.salary);

    if (f.salary === "" || !Number.isFinite(salary) || salary < 0) {
      v.salary = "Enter a valid salary (0 or more).";
    }

    // Password is mandatory only when creating an employee.
    if (!id && !f.password.trim()) {
      v.password = "Password is required.";
    } else if (!id && f.password.length < 8) {
      v.password = "Password must be at least 8 characters.";
    }

    return v;
  };

  const submit = async (event) => {
    event.preventDefault();

    if (ro || busy) return;

    const validationErrors = validate();

    setErrs(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please correct the validation errors.");
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

    // Do not send the password when editing.
    if (!id) {
      body.password = f.password;
    }

    try {
      if (id) {
        await employeeApi.update(id, body);
        toast.success("Employee updated successfully.");
      } else {
        await employeeApi.create(body);
        toast.success("Employee added successfully.");
      }

      nav("/employees");
    } catch (ex) {
      const apiErrors = fieldErrors(ex) || {};

      setErrs(apiErrors);

      toast.error(errMsg(ex) || "Unable to save employee. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  // Reusable input field.
  const input = (key, label, props = {}) => (
    <Field label={label} error={errs[key]}>
      <input
        className={inputCls(errs[key])}
        name={key}
        value={f[key] ?? ""}
        onChange={set(key)}
        disabled={ro || busy}
        {...props}
      />
    </Field>
  );

  const pageTitle = ro
    ? "Employee details"
    : id
      ? "Edit employee"
      : "Add employee";

  return (
    <>
      <PageHeader
        title={pageTitle}
        action={
          ro ? (
            <Link to={`/employees/${id}/edit`} className="btn-primary">
              Edit
            </Link>
          ) : null
        }
      />

      <AsyncState
        loading={Boolean(id && loading)}
        error={id ? error : null}
        noun="employee"
        onRetry={reload}
      >
        <form
          onSubmit={submit}
          noValidate
          className="card grid gap-4 sm:grid-cols-2"
        >
          {input("fullName", "Full name", {
            type: "text",
            autoComplete: "name",
            placeholder: "Enter full name",
          })}

          {input("email", "Email", {
            type: "email",
            autoComplete: "email",
            placeholder: "Enter email address",
          })}

          {input("phone", "Phone", {
            type: "tel",
            autoComplete: "tel",
            placeholder: "Enter phone number",
          })}

          {input("jobTitle", "Job title", {
            type: "text",
            placeholder: "Enter job title",
          })}

          <Field label="Department" error={errs.departmentId}>
            <select
              className={inputCls(errs.departmentId)}
              name="departmentId"
              value={f.departmentId ?? ""}
              onChange={set("departmentId")}
              disabled={ro || busy}
            >
              <option value="">Select department</option>

              {Array.isArray(depts) &&
                depts.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
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
            step: "any",
            placeholder: "Enter salary",
          })}

          <Field label="Status" error={errs.status}>
            <select
              className={inputCls(errs.status)}
              name="status"
              value={f.status}
              onChange={set("status")}
              disabled={ro || busy}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </Field>

          {!id &&
            input("password", "Password", {
              type: "password",
              autoComplete: "new-password",
              placeholder: "Enter password (minimum 8 characters)",
            })}

          <div className="flex justify-end gap-2 sm:col-span-2">
            <Link to="/employees" className="btn-secondary">
              {ro ? "Back" : "Cancel"}
            </Link>

            {!ro && (
              <Button type="submit" loading={busy}>
                {busy ? "Saving..." : id ? "Save changes" : "Add employee"}
              </Button>
            )}
          </div>
        </form>
      </AsyncState>
    </>
  );
}
