import { useState } from "react";
import { formatDate } from "../../utils/helpers";
import RatingForm from "./RatingForm";

const StoreCard = ({ store, onRatingUpdated }) => {
  const [showRatingForm, setShowRatingForm] = useState(false);

  const renderStars = (rating, size = "text-lg") => {
    const stars = [];
    const numRating = parseFloat(rating);

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`${size} ${
            i <= numRating ? "text-yellow-400" : "text-gray-300"
          } drop-shadow-sm`}
        >
          ★
        </span>
      );
    }

    return stars;
  };

  const handleRatingSubmit = async () => {
    setShowRatingForm(false);
    if (onRatingUpdated) {
      onRatingUpdated();
    }
  };

  // Debug log to see what userRating looks like
  console.log('Store:', store.name);
  console.log('Store userRating:', store.userRating);

  return (
    <div className="group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 overflow-hidden flex flex-col">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 w-full h-1 bg-blue-500"></div>
      {/* Store content */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Store Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            {/* Store icon/avatar */}
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-3 shadow-sm">
              <span className="text-white font-bold text-xl">
                {store.name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
              {store.name}
            </h3>
            <div className="flex items-center text-gray-500 text-sm mb-1">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              {store.email}
            </div>
          </div>
          
          {/* Rating display */}
          <div className="text-right">
            <div className="flex items-center justify-end mb-1">
              {renderStars(store.averageRating)}
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-full">
              <p className="text-sm font-semibold text-gray-700">
                {store.averageRating}/5
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {store.totalRatings} review{store.totalRatings !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Store Details */}
        <div className="space-y-4 mb-5 flex-1">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 text-gray-400 mt-0.5">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Address</p>
              <p className="text-sm text-gray-600 leading-relaxed">{store.address}</p>
            </div>
          </div>

          {store.owner && (
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 text-gray-400 mt-0.5">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Owner</p>
                <p className="text-sm text-gray-600">{store.owner.name}</p>
              </div>
            </div>
          )}

          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 text-gray-400 mt-0.5">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Established</p>
              <p className="text-sm text-gray-600">{formatDate(store.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* User's Current Rating */}
        {store.userRating && (
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-blue-900">Your Rating:</span>
              </div>
              <div className="flex items-center space-x-2">
                {renderStars(store.userRating.rating, "text-base")}
                <span className="text-sm font-semibold text-blue-700">
                  ({store.userRating.rating}/5)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions - Fixed at bottom */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <button
            onClick={() => setShowRatingForm(true)}
            className={`w-full px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
              store.userRating
                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{store.userRating ? "Update Rating" : "Rate Store"}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Rating Form Modal */}
      {showRatingForm && (
        <RatingForm
          store={store}
          currentRating={store.userRating}
          onSubmit={handleRatingSubmit}
          onCancel={() => setShowRatingForm(false)}
        />
      )}
    </div>
  );
};

export default StoreCard;