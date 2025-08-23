import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { formatDate } from "../../utils/helpers";
import LoadingSpinner from "../common/LoadingSpinner";
import RatingForm from "./RatingForm";
import storeService from "../../services/storeService";
import ratingService from "../../services/ratingService";
import { useCallback } from "react";

const StoreDetails = () => {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRatingForm, setShowRatingForm] = useState(false);


  const fetchStoreDetails = useCallback(async () => {
    try {
      setLoading(true);

      // Replace mocks with API calls
      const storeData = await storeService.getStoreById(id);
      const ratingsData = await ratingService.getRatingsByStore(id);

      setStore(storeData);
      setRatings(ratingsData);
    } catch (err) {
      console.error("Failed to fetch store details:", err);
      setStore(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStoreDetails();
  }, [fetchStoreDetails]);

  const renderStars = (rating, size = "text-lg") => {
    const stars = [];
    const numRating = parseFloat(rating || 0);

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`${size} ${i <= numRating ? "text-yellow-400" : "text-gray-300"}`}
        >
          ★
        </span>
      );
    }

    return stars;
  };

  const handleRatingSubmit = async (ratingData) => {
    try {
      if (store.userRating && store.userRating.id) {
        await ratingService.updateRating(store.userRating.id, ratingData);
      } else {
        await ratingService.submitRating(ratingData);
      }

      await fetchStoreDetails(); // refresh after submit
    } catch (err) {
      console.error("Failed to submit rating:", err);
    } finally {
      setShowRatingForm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading store details..." />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl text-gray-300 mb-4">🏪</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Store not found</h3>
        <p className="text-gray-600">The store you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Store Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{store.name}</h1>
            <p className="text-lg text-gray-600 mb-4">{store.email}</p>

            <div className="space-y-2">
              <div>
                <span className="font-medium text-gray-700">Address: </span>
                <span className="text-gray-600">{store.address}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Owner: </span>
                <span className="text-gray-600">{store.owner?.name}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Established: </span>
                <span className="text-gray-600">{formatDate(store.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 md:mt-0 md:ml-6 text-center">
            <div className="flex items-center justify-center mb-2">
              {renderStars(store.averageRating, "text-2xl")}
            </div>
            <p className="text-3xl font-bold text-gray-900 mb-1">
              {store.averageRating}/5
            </p>
            <p className="text-sm text-gray-600">
              Based on {store.totalRatings} reviews
            </p>

            <button
              onClick={() => setShowRatingForm(true)}
              className={`mt-4 w-full px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                store.userRating
                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                  : "btn-primary"
              }`}
            >
              {store.userRating ? "Update Your Rating" : "Rate This Store"}
            </button>
          </div>
        </div>
      </div>

      {/* User's Current Rating */}
      {store.userRating && (
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Your Rating</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {renderStars(store.userRating.rating)}
              <span className="text-lg font-medium text-blue-700">
                ({store.userRating.rating}/5)
              </span>
            </div>
            <button
              onClick={() => setShowRatingForm(true)}
              className="btn-secondary text-sm"
            >
              Edit Rating
            </button>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

        {ratings.length > 0 ? (
          <div className="space-y-6">
            {ratings.map((rating) => (
              <div key={rating.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{rating.user.name}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {renderStars(rating.rating, "text-sm")}
                      <span className="text-sm text-gray-600">({rating.rating}/5)</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{formatDate(rating.createdAt)}</p>
                </div>

                {rating.comment && (
                  <p className="text-gray-700 leading-relaxed">{rating.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl text-gray-300 mb-4">💬</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600 mb-4">
              Be the first to share your experience with this store.
            </p>
            <button onClick={() => setShowRatingForm(true)} className="btn-primary">
              Write First Review
            </button>
          </div>
        )}
      </div>

      {/* Rating Form Modal */}
      {showRatingForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <RatingForm
              store={store}
              currentRating={store.userRating?.rating || 0}
              onSubmit={handleRatingSubmit}
              onCancel={() => setShowRatingForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreDetails;
