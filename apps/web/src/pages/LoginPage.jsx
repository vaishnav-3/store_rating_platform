import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoginForm from "../components/auth/LoginForm";
import { useEffect } from "react";

const LoginPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Central role-based redirect logic
  const getDefaultRoute = (role) => {
    switch (role) {
      case "admin":
        return "/admin";
      case "store_owner":
        return "/store-owner";
      case "user":
        return "/dashboard";
      default:
        return "/";
    }
  };

  useEffect(() => {
    // Only auto-redirect if already logged in (e.g., trying to visit /login again)
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname;
      navigate(from || getDefaultRoute(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleLoginSuccess = () => {
    // After login, redirect back or go to role-based dashboard
    const from = location.state?.from?.pathname || getDefaultRoute(user?.role);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">StoreRate</h2>
          <p className="mt-2 text-gray-600">Rate and discover amazing stores</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};
  
export default LoginPage;
