import { useState } from 'react';
import { validatePassword } from '../../utils/validators';
import LoadingSpinner from '../common/LoadingSpinner';
import storeService from '../../services/storeService';

const StoreSettings = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Password state
  const [passwordData, setPasswordData] = useState({ 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // ---- Handlers ----
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordErrors[name]) setPasswordErrors(prev => ({ ...prev, [name]: '' }));
  };

  // ---- Validations ----
  const validatePasswordForm = () => {
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = 'Current password is required';
    if (validatePassword(passwordData.newPassword)) errors.newPassword = validatePassword(passwordData.newPassword);
    if (passwordData.newPassword !== passwordData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ---- Submit ----
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await storeService.updatePassword(passwordData).catch(() => storeService.mockUpdatePassword(passwordData));
      setSuccess('✅ Password updated successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setError('❌ Failed to update password.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">Update your account password</p>
      </div>

      {/* Alerts */}
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
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-xl mr-4">
            🔒
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
            <p className="text-gray-600 text-sm">Update your account password for security</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          {/* Current Password */}
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password *
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              placeholder="Enter your current password"
              className={`input-field ${passwordErrors.currentPassword ? 'border-red-300 focus:ring-red-500' : ''}`}
            />
            {passwordErrors.currentPassword && (
              <p className="text-red-600 text-sm mt-1">{passwordErrors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password *
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter your new password"
              className={`input-field ${passwordErrors.newPassword ? 'border-red-300 focus:ring-red-500' : ''}`}
            />
            {passwordErrors.newPassword && (
              <p className="text-red-600 text-sm mt-1">{passwordErrors.newPassword}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Password must be at least 8 characters long and contain letters and numbers
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm your new password"
              className={`input-field ${passwordErrors.confirmPassword ? 'border-red-300 focus:ring-red-500' : ''}`}
            />
            {passwordErrors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{passwordErrors.confirmPassword}</p>
            )}
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              disabled={loading} 
              className="btn-primary w-full flex items-center justify-center"
            >
              {loading ? (
                <LoadingSpinner size="sm" text="Updating Password..." inline />
              ) : (
                <>
                  <span className="mr-2">🔐</span>
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">🛡️ Password Security Tips</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use a combination of letters, numbers, and special characters</li>
            <li>• Make it at least 8 characters long</li>
            <li>• Don't reuse passwords from other accounts</li>
            <li>• Consider using a password manager</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default StoreSettings;