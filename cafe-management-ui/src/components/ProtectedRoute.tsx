import { Navigate, Outlet } from 'react-router-dom';
import { isAuthenticated, getRole } from '../utils/auth';

interface ProtectedRouteProps {
  requiredRole?: string;
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const role = getRole();

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/admin/businesses" replace />;
  }

  if (!requiredRole && role === 'superadmin') {
    return <Navigate to="/admin/businesses" replace />;
  }

  return <Outlet />;
}
