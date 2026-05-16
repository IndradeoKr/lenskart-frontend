import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ component, requiredRole }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (requiredRole === 'ADMIN') return <Navigate to="/admin-login" replace />;
    return <Navigate to="/customer-login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user?.role === 'CUSTOMER') return <Navigate to="/products" replace />;
    return <Navigate to="/" replace />;
  }

  return component;
};

export default ProtectedRoute;
