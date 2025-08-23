import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  validateEmail,
  validateName,
  validateAddress,
  validatePassword,
} from "../../utils/validators";
import LoadingSpinner from "../common/LoadingSpinner";

const RegisterForm = ({ onSuccess }) => {
  const { register, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // clear error as user types
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    const nameError = validateName(formData.name);
    if (nameError) errors.name = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;

    const addressError = validateAddress(formData.address);
    if (addressError) errors.address = addressError;

    const passwordError = validatePassword(formData.password);
    if (passwordError) errors.password = passwordError;

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await register({
        name: formData.name,
        email: formData.email,
        address: formData.address,
        password: formData.password,
      });
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        address: "",
        password: "",
        confirmPassword: "",
      });
      onSuccess?.();
    } catch {
      // error is handled in AuthContext
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto text-center bg-white p-6 rounded-2xl shadow">
        <div className="text-green-600 text-6xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Registration Successful!
        </h2>
        <p className="text-gray-600 mb-6">
          Your account has been created successfully. You can now sign in with
          your credentials.
        </p>
        <Link
          to="/login"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
        <p className="text-gray-600 mt-2">Join StoreRate community</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.name
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="10–60 characters"
          />
          {formErrors.name && (
            <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            name="address"
            rows={3}
            value={formData.address}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.address
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="Max 400 characters"
          />
          {formErrors.address && (
            <p className="text-red-600 text-sm mt-1">{formErrors.address}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.password
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="8–16 chars, uppercase & special character"
          />
          {formErrors.password && (
            <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              formErrors.confirmPassword
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="Re-enter your password"
          />
          {formErrors.confirmPassword && (
            <p className="text-red-600 text-sm mt-1">
              {formErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <LoadingSpinner size="sm" text="Saving..." inline /> : "Create Account"}
        </button>
      </form>
 
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
