import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wait for user data to be loaded before checking roles
  // This prevents the role check from failing when user is null during initial load
  if (!user && isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading user data..." />
      </div>
    );
  }

  // Check role permissions only if roles are specified and user data is available
  if (allowedRoles.length > 0) {
    // If user is still loading or doesn't have role data, show loading
    if (!user || !user.role) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading user data..." />
        </div>
      );
    }
    
    // Check if user role is allowed
    if (!allowedRoles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;