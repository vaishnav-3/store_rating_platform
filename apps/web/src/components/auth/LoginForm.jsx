import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { validateEmail } from "../../utils/validators";
import LoadingSpinner from "../common/LoadingSpinner";

const LoginForm = ({ onSuccess }) => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8 || formData.password.length > 16) {
      errors.password = "Password must be 8–16 characters long";
    } else if (!/[A-Z]/.test(formData.password)) {
      errors.password = "Password must contain at least one uppercase letter";
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      errors.password = "Password must contain at least one special character";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const user = await login(formData.email, formData.password);
      
      // Call onSuccess if provided
      onSuccess?.();
      
      // Redirect based on user role
      switch (user?.role) {
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        case 'store_owner':
          navigate('/store-owner', { replace: true });
          break;
        case 'user':
          navigate('/dashboard', { replace: true });
          break;
        default:
          navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      // Error is already handled by AuthContext
      console.error('Login error:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
        <p className="text-gray-600 mt-2">Welcome back to StoreRate</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.email
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="Enter your email"
          />
          {formErrors.email && (
            <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.password
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="Enter your password"
          />
          {formErrors.password && (
            <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <LoadingSpinner size="sm" text="Signing in..." inline /> : "Sign In"}
        </button> 
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign up here
          </Link>
        </p>
      </div>

      {import.meta.env.DEV && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Demo Credentials:</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>
              <strong>Admin:</strong> admin@example.com / Pass123!
            </p>
            <p>
              <strong>User:</strong> user@example.com / Pass123!
            </p>
            <p>
              <strong>Store Owner:</strong> owner@example.com / Pass123!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginForm;