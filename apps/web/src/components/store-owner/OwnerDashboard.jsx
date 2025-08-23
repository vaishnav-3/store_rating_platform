import { useState, useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import storeService from '../../services/storeService';

const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use only real API - no fallback to mock
      const data = await storeService.getOwnerDashboard();
      
      // If no recent ratings in dashboard response, fetch them separately
      if (!data.recentRatings || data.recentRatings.length === 0) {
        try {
          const ratingsResponse = await storeService.getOwnerRatings({ limit: 3 });
          
          // Handle different response formats for ratings
          let ratingsData = [];
          if (Array.isArray(ratingsResponse)) {
            ratingsData = ratingsResponse;
          } else if (ratingsResponse && ratingsResponse.data && Array.isArray(ratingsResponse.data)) {
            ratingsData = ratingsResponse.data;
          }
          
          // Add recent ratings to dashboard data
          data.recentRatings = ratingsData.slice(0, 3);
        } catch (ratingsErr) {
          console.warn('Failed to fetch recent ratings:', ratingsErr);
          data.recentRatings = [];
        }
      }
      
      // Debug: Log the response structure
      console.log('Dashboard API response:', data);
      
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
 
  const renderStars = (rating, size = 'text-lg') => {
    const stars = [];
    const numRating = parseFloat(rating) || 0;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`${size} ${
            i <= numRating ? 'text-yellow-400' : 'text-gray-300'
          }`}
        >
          ★
        </span>
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl text-red-400 mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={fetchDashboardData} className="btn-primary">
          🔄 Retry
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl text-gray-300 mb-4">🏪</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No store data available</h3>
        <p className="text-gray-600">Please contact an administrator to set up your store.</p>
      </div>
    );
  }

  // Handle different response structures
  let store = dashboardData.store || dashboardData;
  let recentRatings = dashboardData.recentRatings || dashboardData.ratings || [];

  // Ensure we have default values
  store = {
    name: store?.name || 'Your Store',
    email: store?.email || 'store@example.com',
    address: store?.address || 'Store Address',
    averageRating: store?.averageRating || 0,
    totalRatings: store?.totalRatings || 0,
    ...store
  };

  // Ensure recentRatings is an array
  if (!Array.isArray(recentRatings)) {
    recentRatings = [];
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Store Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button onClick={fetchDashboardData} className="btn-secondary text-sm">
            🔄 Refresh
          </button>
          <span className="text-sm text-gray-500">
            Welcome back, Store Owner
          </span>
        </div>
      </div>

      {/* Store Overview */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{store.name}</h2>
            <p className="text-gray-600 mb-4">{store.email}</p>
            <div className="space-y-1">
              <div>
                <span className="font-medium text-gray-700">Address: </span>
                <span className="text-gray-600">{store.address}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 md:mt-0 md:ml-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {renderStars(store.averageRating, 'text-2xl')}
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                {store.averageRating || 0}/5
              </p>
              <p className="text-sm text-gray-600">
                {store.totalRatings || 0} total reviews
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center text-white text-xl">
              ⭐
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-3xl font-bold text-gray-900">{store.averageRating || 0}</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl">
              📊
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reviews</p>
              <p className="text-3xl font-bold text-gray-900">{store.totalRatings || 0}</p>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow duration-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl">
              📈
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Store Status</p>
              <p className="text-xl font-bold text-green-600">Active</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reviews */}
      {/* <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Reviews</h2>
          <button onClick={() => navigate('/store-owner/ratings')} className="btn-secondary text-sm">
            View All Reviews
          </button>
        </div>

        {recentRatings && recentRatings.length > 0 ? (
          <div className="space-y-4">
            {recentRatings.slice(0, 3).map((rating, index) => (
              <div key={rating.id || index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{rating.user?.name || 'Anonymous User'}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {renderStars(rating.rating, 'text-sm')}
                      <span className="text-sm text-gray-600">({rating.rating || 0}/5)</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    {rating.createdAt ? formatDate(rating.createdAt) : 'Recent'}
                  </p>
                </div>

                {rating.comment && (
                  <p className="text-gray-700">{rating.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl text-gray-300 mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">
              Your store is ready to receive its first customer review.
            </p>
          </div>
        )}
      </div> */}

      {/* Quick Actions */}
      {/* <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/store-owner/settings')}
            className="btn-primary flex items-center justify-center space-x-2"
          >
            <span>⚙️</span>
            <span>Account Settings</span>
          </button>
          <button 
            onClick={() => navigate('/store-owner/ratings')}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <span>⭐</span>
            <span>View All Ratings</span>
          </button>
          <button 
            onClick={() => alert('Analytics feature coming soon!')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2"
          >
            <span>📊</span>
            <span>Analytics</span>
          </button>
        </div>
      </div> */}

      
    </div>
  );
};

export default OwnerDashboard;