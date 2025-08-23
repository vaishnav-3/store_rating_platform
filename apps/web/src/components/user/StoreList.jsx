import { useState, useEffect, useCallback } from "react";
import { useStores } from "../../hooks/useStores";
import { useRatings } from "../../hooks/useRatings";
import { useAuth } from "../../context/AuthContext";
import StoreCard from "./StoreCard";
import LoadingSpinner from "../common/LoadingSpinner";
import Pagination from "../common/Pagination";

const StoreList = ({ onRatingUpdated }) => {
  const { user } = useAuth();
  const { stores, loading, pagination, refetch, searchStores } = useStores();
  const {
    ratings,
    refetch: refetchRatings,
    loading: ratingsLoading,
  } = useRatings(user?.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearchQuery, setActiveSearchQuery] = useState(""); // Track what's currently being searched

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = searchQuery.trim();
    
    if (trimmedQuery === "") {
      // Clear search if empty
      clearSearch();
    } else {
      // Perform search
      setIsSearching(true);
      setActiveSearchQuery(trimmedQuery);
      searchStores(trimmedQuery);
    }
  };

  const handleSortChange = (e) => {
    const sortValue = e.target.value;
    setSortBy(sortValue);
    
    // If we're currently searching, don't apply sort (search overrides sort)
    if (!isSearching) {
      refetch({ sort: sortValue, page: 1 });
    }
  };

  const handlePageChange = (page) => {
    // Only use pagination if not searching
    if (!isSearching) {
      refetch({ page, sort: sortBy });
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setActiveSearchQuery("");
    setIsSearching(false);
    refetch({ sort: sortBy, page: 1 });
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  };

  // Merge user ratings into stores and apply consistent sorting
  const storesWithUserRating = stores.map((store) => {
    const userRating = ratings.find((r) => r.store.id === store.id);
    return { ...store, userRating };
  });

  // Apply sorting to maintain consistent order
  const sortedStores = [...storesWithUserRating].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "rating": {
        // Sort by average rating (highest first)
        const aRating = a.averageRating || 0;
        const bRating = b.averageRating || 0;
        return bRating - aRating;
      }
      case "reviews": {
        // Sort by review count (most first)
        const aReviews = a.reviewCount || 0;
        const bReviews = b.reviewCount || 0;
        return bReviews - aReviews;
      }
      case "newest":
        // Sort by creation date (newest first)
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      default:
        return 0;
    }
  });

  // Refresh only ratings after rating submit to avoid store reordering
  const handleRatingUpdated = useCallback(() => {
    // Only refetch ratings, not stores, to maintain order
    refetchRatings();
    
    // Call parent callback if provided (for dashboard refresh)
    if (onRatingUpdated) {
      onRatingUpdated();
    }
  }, [refetchRatings, onRatingUpdated]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <h1 className="text-3xl font-bold text-gray-900">Browse Stores</h1>
        <div className="text-sm text-gray-500">
          {pagination.totalItems} stores found
          {isSearching && ` for "${activeSearchQuery}"`}
        </div>
      </div>

      {/* Search + Sort */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          {/* Search */}
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Stores
            </label>
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </span>
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyPress={handleKeyPress}
                  className="input-field pl-10"
                  placeholder="Search by name or address..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px]"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Search</span>
                  </>
                )}
              </button>
              {(searchQuery || isSearching) && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  title="Clear search"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </form>
          </div>

          {/* Sort */}
          <div>
            <label
              htmlFor="sort"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Sort by
            </label>
            <select
              id="sort"
              value={sortBy}
              onChange={handleSortChange}
              className={`input-field min-w-[150px] ${isSearching ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSearching}
            >
              <option value="name">Name (A-Z)</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviews</option>
              <option value="newest">Newest First</option>
            </select>
            {isSearching && (
              <p className="text-xs text-gray-500 mt-1">Sorting disabled during search</p>
            )}
          </div>
        </div>
      </div>

      {/* Active Search Indicator */}
      {isSearching && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm text-blue-700">
                Showing results for "<strong>{activeSearchQuery}</strong>"
              </span>
            </div>
            <button
              onClick={clearSearch}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Clear search
            </button>
          </div>
        </div>
      )}

      {/* Store Grid */}
      {loading || ratingsLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text={isSearching ? "Searching stores..." : "Loading stores..."} />
        </div>
      ) : storesWithUserRating.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedStores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onRatingUpdated={handleRatingUpdated}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl text-gray-300 mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No stores found
          </h3>
          <p className="text-gray-600">
            {activeSearchQuery
              ? `No stores match "${activeSearchQuery}". Try a different search term.`
              : "There are no stores available at the moment."}
          </p>
          {activeSearchQuery && (
            <button
              onClick={clearSearch}
              className="mt-3 text-blue-600 hover:text-blue-800 underline"
            >
              Clear search and show all stores
            </button>
          )}
        </div>
      )}

      {/* Pagination - only show when not searching */}
      {!loading && !isSearching && stores.length > 0 && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default StoreList;