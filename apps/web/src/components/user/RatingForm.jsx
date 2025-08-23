import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Star, X, MapPin, Store } from "lucide-react";
import { useRatings } from "../../hooks/useRatings"; // Add this import
import { useAuth } from "../../context/AuthContext"; // Add this import

// Shadcn Rating Component
const Rating = ({ rating, onRatingChange, className = "" }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hoverRating || rating);
        return (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                filled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200 hover:fill-yellow-200 hover:text-yellow-200"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
};

// Mock LoadingSpinner component
const LoadingSpinner = ({ size = "md" }) => (
  <div
    className={`animate-spin rounded-full border-2 border-white border-t-transparent ${
      size === "sm" ? "w-4 h-4" : "w-6 h-6"
    }`}
  ></div>
);

// Mock validator
const validateRating = (rating) => {
  if (!rating || rating < 1 || rating > 5) {
    return "Please select a rating from 1 to 5 stars";
  }
  return null;
};

const RatingForm = ({ store, currentRating, onSubmit, onCancel }) => {
  const { user } = useAuth(); // Get user from auth context
  const { submitRating, updateRating } = useRatings(user?.id); // Use the hook methods
  
  const [rating, setRating] = useState(currentRating?.rating || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleRatingChange = (value) => {
    setRating(value);
    setError("");
  };

  const handleSubmit = async () => {
    const ratingError = validateRating(rating);
    if (ratingError) {
      setError(ratingError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const ratingData = {
        storeId: store.id,
        rating: rating,
      };

      let success = false;
      
      // Debug log to see what currentRating contains
      console.log('currentRating:', currentRating);
      console.log('currentRating.id:', currentRating?.id);
      
      if (currentRating && currentRating.id) {
        // Update existing rating using the hook method
        console.log('Updating rating with ID:', currentRating.id);
        success = await updateRating(currentRating.id, ratingData);
      } else {
        // Submit new rating using the hook method
        console.log('Submitting new rating');
        success = await submitRating(ratingData);
      }

      if (success) {
        onSubmit && onSubmit();
      } else {
        setError("Failed to submit rating. Please try again.");
      }
    } catch (err) {
      console.error('Rating submission error:', err);
      setError(err.message || "Failed to submit rating. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const renderStarRating = () => (
    <div className="flex justify-center">
      <Rating
        rating={rating}
        onRatingChange={handleRatingChange}
        className="justify-center"
      />
    </div>
  );

  const modalContent = (
    <div
      className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg mx-auto transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 relative overflow-hidden rounded-t-xl">
          <div className="absolute inset-0"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                {currentRating ? "Update Rating" : "Rate Your Experience"}
              </h2>
              <p className="text-blue-100 text-sm">
                Share your feedback with the community
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Store Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 text-white p-2 rounded-lg">
                <Store size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {store.name}
                </h3>
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin
                    size={14}
                    className="text-gray-400 mr-1 flex-shrink-0"
                  />
                  <span className="truncate">{store.address}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Rating Section */}
            <div className="text-center">
              <label className="block text-base font-semibold text-gray-900 mb-6">
                How would you rate this store?
                <span className="text-red-500 ml-1">*</span>
              </label>

              {renderStarRating()}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <div className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || rating === 0}
                className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" inline showText={false} />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Star size={16} className="fill-current" />
                    <span>{currentRating ? "Update" : "Submit"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Don't render until mounted (prevents SSR issues)
  if (!mounted) {
    return null;
  }

  // Use createPortal to render the modal at document root
  return createPortal(modalContent, document.body);
};

export default RatingForm;