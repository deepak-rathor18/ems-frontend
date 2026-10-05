import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui';

/** Requires login; optionally restricts by `roles`. Backend remains the real security layer. */
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner className="h-6 w-6" /></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
