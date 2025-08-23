import { useState, useEffect } from 'react';
import { formatDate } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import adminService from '../../services/adminService';

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStores();
    fetchOwners();
  }, []);

  const fetchStores = async (page = 1, limit = 20) => {
    try {
      setLoading(true);
      const storesData = await adminService.getPublicStores(page, limit);
      setStores(storesData.stores || []);
    } catch {
      setError('Failed to load stores');
    } finally {
      setLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      const ownersData = await adminService.getUsers({ role: 'store_owner' });
      setOwners(ownersData.users || []);
    } catch (err) {
      console.error('Failed to fetch owners', err);
    }
  };

  /** ---------- Validation ---------- **/
  const validateForm = () => {
    const errors = {};
    if (!formData.name || formData.name.length < 10) {
      errors.name = 'Store name must be at least 10 characters.';
    }
    if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!formData.address || formData.address.length < 10) {
      errors.address = 'Address must be at least 10 characters.';
    }
    if (!formData.ownerId) {
      errors.ownerId = 'Please select a store owner.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setError('');
    setFormErrors({});

    try {
      await adminService.createStore({ ...formData });
      setShowCreateModal(false);
      setFormData({ name: '', email: '', address: '', ownerId: '' });
      fetchStores();
    } catch (err) {
      setError(err.message || 'Failed to create store');
    } finally {
      setSubmitting(false);
    }
  };

  // const handleDeleteStore = async (id) => {
  //   if (!window.confirm('Are you sure you want to delete this store?')) return;
  //   try {
  //     await adminService.deleteStore(id);
  //     setStores(stores.filter((s) => s.id !== id));
  //   } catch {
  //     alert('Failed to delete store');
  //   }
  // };

  const renderStars = (rating) => {
    const stars = [];
    const numRating = parseFloat(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-lg ${i <= numRating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Store Management</h1>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary">
          + Create New Store
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {/* Stores Grid */}
      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" text="Loading stores..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div
              key={store.id}
              className="card hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {store.name}
                  </h3>
                  <p className="text-sm text-gray-600">{store.email}</p>
                </div>
                <div className="flex items-center space-x-1">
                  {renderStars(store.averageRating)}
                  <span className="text-sm text-gray-600 ml-1">
                    ({store.totalRatings})
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  <strong>Address:</strong> {store.address}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Owner:</strong> {store.owner?.name} ({store.owner?.email})
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Created:</strong> {formatDate(store.createdAt)}
                </p>

                
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Store Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-gray-200 shadow-lg animate-in slide-in-from-bottom-4 zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Store</h2>
            <div className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 mb-2 rounded ">
          {error}
        </div>
            <form onSubmit={handleCreateStore} className="space-y-5">
              {/* Store Name */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">Store Name</label>
                <input
                  type="text"
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none ${
                    formErrors.name ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-400'
                  }`}
                  placeholder="e.g. Sunrise Café"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 10 characters long.</p>
                {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">Store Email</label>
                <input
                  type="email"
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none ${
                    formErrors.email ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-400'
                  }`}
                  placeholder="e.g. info@sunrisecafe.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Must be a valid email format.</p>
                {formErrors.email && <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">Address</label>
                <textarea
                  rows={3}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none ${
                    formErrors.address ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-400'
                  }`}
                  placeholder="123 Main Street, Springfield"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">Must be at least 10 characters long.</p>
                {formErrors.address && <p className="text-red-600 text-sm mt-1">{formErrors.address}</p>}
              </div>

              {/* Owner */}
              <div>
                <label className="block text-gray-700 font-medium mb-1">Store Owner</label>
                <select
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none ${
                    formErrors.ownerId ? 'border-red-500 focus:ring-red-400' : 'border-gray-300 focus:ring-indigo-400'
                  }`}
                  value={formData.ownerId}
                  onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                >
                  <option value="">Select store owner</option>
                  {owners.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name} ({o.email})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">You must assign an owner to the store.</p>
                {formErrors.ownerId && <p className="text-red-600 text-sm mt-1">{formErrors.ownerId}</p>}
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  {submitting ? 'Creating...' : 'Create Store'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormErrors({});
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && stores.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl text-gray-300 mb-4">🏪</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No stores found</h3>
          <p className="text-gray-600 mb-6">Create your first store to get started.</p>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary">
            Create First Store
          </button>
        </div>
      )}
    </div>
  );
};

export default StoreManagement;
