import { useState } from "react";
import { validatePassword } from "../../utils/validators";
import LoadingSpinner from "../common/LoadingSpinner";
import UserService from "../../services/userService"; // Import the service

const UserProfile = () => {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Password form
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [loadingPassword, setLoadingPassword] = useState(false);

  // ---------------- Validation ----------------
  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordData.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    const passwordError = validatePassword(passwordData.newPassword);
    if (passwordError) errors.newPassword = passwordError;

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ---------------- Submit Handler ----------------
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setLoadingPassword(true);
    setError("");
    setSuccess("");

    try {
      // Use UserService instead of direct fetch
      await UserService.updatePassword(passwordData);

      setSuccess("Password updated successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Password update error:", err);
      // Handle different error response formats
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Failed to update password. Please try again.";
      setError(errorMessage);
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Change Password</h1>
        <p className="text-gray-600 mt-2">
          Update your account password
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="card">
        {/* Password Form */}
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Current Password
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              className={`input-field ${
                passwordErrors.currentPassword ? "border-red-300" : ""
              }`}
            />
            {passwordErrors.currentPassword && (
              <p className="text-red-600 text-sm">
                {passwordErrors.currentPassword}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              className={`input-field ${
                passwordErrors.newPassword ? "border-red-300" : ""
              }`}
            />
            {passwordErrors.newPassword && (
              <p className="text-red-600 text-sm">
                {passwordErrors.newPassword}
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              className={`input-field ${
                passwordErrors.confirmPassword ? "border-red-300" : ""
              }`}
            />
            {passwordErrors.confirmPassword && (
              <p className="text-red-600 text-sm">
                {passwordErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loadingPassword}
            className="btn-primary w-full flex justify-center"
          >
            {loadingPassword ? (
              <LoadingSpinner size="sm" text="Updating..." inline />
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
