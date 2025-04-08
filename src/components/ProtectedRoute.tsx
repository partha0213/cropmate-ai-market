
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'farmer' | 'buyer' | 'admin' | 'delivery';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cropmate-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check for role-based access if required
  if (requiredRole && profile?.role !== requiredRole) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Access Restricted</h1>
        <p className="text-gray-600 mb-6 text-center">
          You need to be a {requiredRole} to access this page.
        </p>
        <a href="/" className="text-cropmate-primary hover:underline">
          Return to Home
        </a>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
