import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import { ROLES } from './constants';
import { Login, Register } from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeForm from './pages/EmployeeForm';
import Departments from './pages/Departments';
import { LeaveRequests, ApplyLeave, MyLeaves } from './pages/Leaves';
import { Profile, Organizations } from './pages/Misc';

const { ORG_ADMIN, EMPLOYEE, SUPER_ADMIN } = ROLES;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route element={<ProtectedRoute roles={[ORG_ADMIN]} />}>
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/new" element={<EmployeeForm />} />
            <Route path="/employees/:id" element={<EmployeeForm readOnly />} />
            <Route path="/employees/:id/edit" element={<EmployeeForm />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/leaves" element={<LeaveRequests />} />
          </Route>
          <Route element={<ProtectedRoute roles={[EMPLOYEE]} />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-leaves" element={<MyLeaves />} />
            <Route path="/leaves/apply" element={<ApplyLeave />} />
          </Route>
          <Route element={<ProtectedRoute roles={[SUPER_ADMIN]} />}>
            <Route path="/organizations" element={<Organizations />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
