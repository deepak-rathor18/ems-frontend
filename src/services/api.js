/**
 * Centralized Axios instance + all endpoint definitions.
 * REST contract is documented in README.md. Change URLs only here.
 */
import axios from "axios";
import { TOKEN_KEY } from "../constants";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const isAuthCall =
      url.startsWith("/auth/login") || url.startsWith("/auth/register");
    if (status === 401 && !isAuthCall) onUnauthorized();
    const fallback = {
      401: "Invalid credentials or session expired.",
      403: "You do not have permission to do this.",
      404: "The requested resource was not found.",
      422: "Please check the highlighted fields.",
      500: "Server error. Please try again later.",
    }[status];
    if (!error.response)
      error.message = "Cannot reach the server. Check your connection.";
    else if (fallback && !error.response.data?.message)
      error.response.data = {
        ...(error.response.data || {}),
        message: fallback,
      };
    return Promise.reject(error);
  },
);

const d = (p) => p.then((r) => r.data);

export const authApi = {
  registerOrganization: (body) => d(api.post("/auth/register", body)),
  login: (body) => d(api.post("/auth/login", body)),
  me: () => d(api.get("/auth/me")),
};
export const employeeApi = {
  list: (params) => d(api.get("/employees", { params })),
  get: (id) => d(api.get(`/employees/${id}`)),
  me: () => d(api.get("/employees/my-profile")),
  create: (body) => d(api.post("/employees", body)),
  update: (id, body) => d(api.put(`/employees/${id}`, body)),
  remove: (id) => d(api.delete(`/employees/${id}`)),
};
export const departmentApi = {
  list: () => d(api.get("/departments")),
  create: (body) => d(api.post("/departments", body)),
  update: (id, body) => d(api.put(`/departments/${id}`, body)),
  remove: (id) => d(api.delete(`/departments/${id}`)),
};
// export const leaveApi = {
//   list: () => d(api.get("/leaves")),
//   mine: () => d(api.get("/leaves/my")),
//   apply: (body) => d(api.post("/leaves", body)),
//   setStatus: (id, status) => d(api.patch(`/leaves/${id}/status`, { status })),
// };

export const leaveApi = {
  mine: () => d(api.get("/leaves/my")),

  list: (params) => d(api.get("/leaves", { params })),

  approve: (id) => d(api.patch(`/leaves/${id}/approve`)),

  reject: (id) => d(api.patch(`/leaves/${id}/reject`)),

  setStatus: (id, status) => {
    if (status === "APPROVED") {
      return d(api.patch(`/leaves/${id}/approve`));
    }

    if (status === "REJECTED") {
      return d(api.patch(`/leaves/${id}/reject`));
    }

    throw new Error(`Invalid leave status: ${status}`);
  },
};

export const dashboardApi = { admin: () => d(api.get("/dashboard/admin")) };
// export const organizationApi = { list: () => d(api.get("/organizations")) };
export const organizationApi = {
  list: (params) => d(api.get("/super-admin/organizations", { params })),

  get: (id) => d(api.get(`/super-admin/organizations/${id}`)),
};
export default api;
