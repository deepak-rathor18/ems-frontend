# Multi-Tenant EMS – Frontend

React 18 + Vite + Tailwind CSS + Axios + React Router. JWT auth with role-based routing (`SUPER_ADMIN`, `ORG_ADMIN`, `EMPLOYEE`).

## Run

```bash
npm install
cp .env.example .env   # set VITE_API_URL
npm run dev            # http://localhost:5173
```

## Structure

`src/services/api.js` (Axios + every endpoint) · `context/` (Auth, Toast) · `routes/ProtectedRoute.jsx` · `layouts/AppLayout.jsx` · `pages/` · `components/ui.jsx` · `hooks/useFetch.js`

## Assumed REST contract (edit only in `src/services/api.js`)

All routes except login/register require `Authorization: Bearer <jwt>`. Tenant is derived from the JWT on the server; the frontend never sends an organization id.

| Method & path                                          | Body / query                                               | Response                                                                                                                   |
| ------------------------------------------------------ | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| POST `/auth/register`                                  | `companyName, slug, email, password`                       | 201                                                                                                                        |
| POST `/auth/login`                                     | `email, password`                                          | `{ token }`                                                                                                                |
| GET `/auth/me`                                         | –                                                          | `{ id, organizationId, email, role }` (or `{ user }`)                                                                      |
| GET `/dashboard/admin`                                 | –                                                          | `{ totalEmployees, activeEmployees, inactiveEmployees, pendingLeaves, departmentCounts: [{ id, name, count }] }`           |
| GET `/employees`                                       | `?search&departmentId&status`                              | array (or `{ data: [] }`) of `{ id, fullName, email, phone, jobTitle, department:{id,name}, joiningDate, salary, status }` |
| GET `/employees/my-profile`                            | –                                                          | the logged-in employee's record                                                                                            |
| GET/PUT/DELETE `/employees/:id`, POST `/employees`     | employee fields + `departmentId`                           | employee                                                                                                                   |
| GET/POST `/departments`, PUT/DELETE `/departments/:id` | `{ name }`                                                 | `{ id, name, employeeCount, createdAt }`                                                                                   |
| GET `/leaves`                                          | –                                                          | `{ id, employee:{fullName,department:{name}}, leaveType, startDate, endDate, reason, status }[]`                           |
| GET `/leaves/my`, POST `/leaves`                       | `leaveType (CASUAL/SICK/PAID), startDate, endDate, reason` | leave(s)                                                                                                                   |
| PATCH `/leaves/:id/status`                             | `{ status: 'APPROVED' \| 'REJECTED' }`                     | leave                                                                                                                      |
| GET `/organizations`                                   | –                                                          | `{ id, name, slug, employeeCount, createdAt }[]`                                                                           |

Validation errors (422) may return `{ message, errors: { field: "msg" } }` (or an array of `{ field, message }`); they're shown inline.

## Behaviour notes

- 401 on any protected call clears the token and redirects to `/login`; 403/404/422/500 show friendly toasts.
- Role-based routes and hidden buttons are UX only; the backend must enforce authorization.
- Token is kept in `localStorage` for simplicity; use httpOnly cookies if your backend supports them.
- Employee routes: `/employees`, `/employees/new`, `/employees/:id`, `/employees/:id/edit`; employees use `/profile`, `/my-leaves`, `/leaves/apply`.
