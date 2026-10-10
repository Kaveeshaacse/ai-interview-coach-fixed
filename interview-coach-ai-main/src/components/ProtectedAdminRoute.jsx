import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0a0a1a]"><LoadingSpinner size="lg" /></div>;
  if (!isAuthenticated) return <Navigate to="/staff-login" replace />;

  return children;
}
