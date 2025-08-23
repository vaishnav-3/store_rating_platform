import { useState, useEffect } from 'react';
import { formatDate } from '../../utils/helpers';
import LoadingSpinner from '../common/LoadingSpinner';
import Pagination from '../common/Pagination';
import storeService from '../../services/storeService';

const StoreRatings = () => {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRatings, setTotalRatings] = useState(0);
  const ratingsPerPage = 10;

  useEffect(() => {
    fetchRatings();
  }, [currentPage]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try API → fallback to mock
      let response = await storeService.getOwnerRatings({ page: currentPage, limit: ratingsPerPage })
        .catch(() => storeService.mockGetOwnerRatings());

      console.log('Raw API response:', response);

      // Handle different response formats
      let ratingsData = [];
      if (Array.isArray(response)) {
        // Direct array response
        ratingsData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        // Response with data property
        ratingsData = response.data;
      } else if (response && response.ratings && Array.isArray(response.ratings)) {
        // Response with ratings property
        ratingsData = response.ratings;
      } else if (response && typeof response === 'object') {
        // Try to find an array in the response object
        const possibleArrays = Object.values(response).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          ratingsData = possibleArrays[0];
        }
      }

      // Ensure we have an array
      if (!Array.isArray(ratingsData)) {
        console.warn('Expected array but got:', typeof ratingsData, ratingsData);
        ratingsData = [];
      }

      setTotalRatings(ratingsData.length);
      const startIndex = (currentPage - 1) * ratingsPerPage;
      setRatings(ratingsData.slice(startIndex, startIndex + ratingsPerPage));
    } catch (err) {
      console.error("Failed to load ratings:", err);
      setError("Unable to load ratings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, size = 'text-lg') => {
    const stars = [];
    const numRating = parseFloat(rating);

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`${size} ${i <= numRating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </span>
      );
    }

    return stars;
  };

  const getAverageRating = () => {
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating.rating, 0);
    return (sum / ratings.length).toFixed(2);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratings.forEach(r => { distribution[r.rating]++; });
    return distribution;
  };

  const distribution = getRatingDistribution();

  // ---- Error State ----
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl text-red-400 mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Reviews</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button onClick={fetchRatings} className="btn-primary">
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Store Ratings & Reviews</h1>
        <div className="flex items-center space-x-4">
          <button onClick={fetchRatings} className="btn-secondary text-sm">🔄 Refresh</button>
          <span className="text-sm text-gray-500">{totalRatings} total reviews</span>
        </div>
      </div>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Rating */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Overall Rating</h2>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              {renderStars(getAverageRating(), 'text-3xl')}
            </div>
            <p className="text-4xl font-bold text-gray-900 mb-1">{getAverageRating()}/5</p>
            <p className="text-gray-600">Based on {totalRatings} reviews</p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Rating Distribution</h2>
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(star => (
              <div key={star} className="flex items-center space-x-3">
                <span className="text-sm font-medium w-6">{star}★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{
                      width: totalRatings > 0 ? `${(distribution[star] / totalRatings) * 100}%` : '0%'
                    }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 w-8">{distribution[star]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" text="Loading reviews..." />
          </div> 
        ) : ratings.length > 0 ? (
          <div className="space-y-6">
            {ratings.map(rating => (
              <div key={rating.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{rating.user?.name || 'Anonymous'}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {renderStars(rating.rating, 'text-sm')}
                      <span className="text-sm text-gray-600">({rating.rating}/5)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{formatDate(rating.createdAt)}</p>
                    {rating.updatedAt !== rating.createdAt }
                  </div>
                </div>
                {rating.comment && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700 leading-relaxed">{rating.comment}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">Your store hasn't received any reviews yet.</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && ratings.length > 0 && totalRatings > ratingsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalRatings}
            itemsPerPage={ratingsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  );
};

export default StoreRatings;