import { useState } from 'react';
import { validateEmail, validateName, validateAddress, validatePassword, validateRole } from '../../utils/validators';
import { USER_ROLES } from '../../utils/constants';
import LoadingSpinner from '../common/LoadingSpinner';
import adminService from "../../services/adminService";

const CreateUserForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: USER_ROLES.USER
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (validateName(formData.name)) errors.name = validateName(formData.name);
    if (validateEmail(formData.email)) errors.email = validateEmail(formData.email);
    if (validateAddress(formData.address)) errors.address = validateAddress(formData.address);
    if (validatePassword(formData.password)) errors.password = validatePassword(formData.password);
    if (validateRole(formData.role)) errors.role = validateRole(formData.role);

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setSuccess(false);

    try {
      await adminService.createUser({ ...formData });
      setSuccess(true);
      setFormData({ name: '', email: '', address: '', password: '', role: USER_ROLES.USER });
    } catch (error) {
      setFormErrors({ submit: error.message || 'Failed to create user. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case USER_ROLES.ADMIN: return 'Full system access with user and store management capabilities';
      case USER_ROLES.STORE_OWNER: return 'Can manage their own store and view ratings';
      case USER_ROLES.USER: return 'Can browse stores and submit ratings';
      default: return '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow-lg space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
        <p className="text-gray-500 mt-1">Add a new user to the system with specific role and permissions.</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg transition-all">
          ✅ User created successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-gray-700 font-medium mb-1">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
            autoComplete="off"
          />
          {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
            autoComplete="off"
          />
          {formErrors.email && <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>}
        </div>

        {/* Role */}
        <div>
          <label htmlFor="role" className="block text-gray-700 font-medium mb-1">Role</label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${formErrors.role ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value={USER_ROLES.USER}>User</option>
            <option value={USER_ROLES.STORE_OWNER}>Store Owner</option>
            <option value={USER_ROLES.ADMIN}>Admin</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">{getRoleDescription(formData.role)}</p>
          {formErrors.role && <p className="text-red-600 text-sm mt-1">{formErrors.role}</p>}
        </div>

        {/* Address */}
        <div>
          <label htmlFor="address" className="block text-gray-700 font-medium mb-1">Address</label>
          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${formErrors.address ? 'border-red-500' : 'border-gray-300'}`}
            autoComplete="off"
          />
          {formErrors.address && <p className="text-red-600 text-sm mt-1">{formErrors.address}</p>}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-gray-700 font-medium mb-1">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`}
            autoComplete="new-password"
          />
          {formErrors.password && <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>}
        </div>

        {formErrors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {formErrors.submit}
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 btn-primary text-white font-semibold py-2 rounded-lg  focus:outline-none focus:ring-2 focus:btn-primary transition flex items-center justify-center"
          >
            {loading ? <LoadingSpinner size="sm" inline showText={false} /> : 'Create User'}
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({ name: '', email: '', address: '', password: '', role: USER_ROLES.USER });
              setFormErrors({});
            }}
            className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateUserForm;
