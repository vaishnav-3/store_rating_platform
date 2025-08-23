import { Routes, Route, Navigate} from "react-router-dom";
import { useRatings } from "../hooks/useRatings";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/common/Sidebar";
import StoreList from "../components/user/StoreList";
import StoreDetails from "../components/user/StoreDetails";
import UserProfile from "../components/user/UserProfile";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { formatDate } from "../utils/helpers";

const UserDashboard = () => {
  const { user } = useAuth();
  const { ratings, loading, refetch: refetchRatings } = useRatings(user?.id);
  

  // Defensive: ensure ratings is always an array and sort by most recent first
  const safeRatings = Array.isArray(ratings) ? ratings : [];
  const sortedRatings = [...safeRatings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  const dashboardStats = [
    {
      title: "My Ratings",
      value: safeRatings.length,
      icon: "⭐",
      color: "bg-yellow-500",
    },
    {
      title: "Average Rating",
      value:
        safeRatings.length > 0
          ? (
              safeRatings.reduce((sum, r) => sum + r.rating, 0) /
              safeRatings.length
            ).toFixed(1)
          : "0.0",
      icon: "📊",
      color: "bg-blue-500",
    },
    {
      title: "Stores Rated",
      value: new Set(safeRatings.map((r) => r.store.id)).size,
      icon: "🏪",
      color: "bg-green-500",
    },
  ];

  // Function to refresh ratings - can be passed to child components
  const handleRatingsUpdate = () => {
    refetchRatings();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        <Routes>
          {/* Dashboard Overview */}
          <Route
            index
            element={
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Dashboard
                  </h1>
                  <div className="text-sm text-gray-500">
                    Welcome back, {user?.name}
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {dashboardStats.map((stat, index) => (
                    <div
                      key={index}
                      className="card hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}
                        >
                          {stat.icon}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">
                            {stat.title}
                          </p>
                          <p className="text-3xl font-bold text-gray-900">
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recent Ratings */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      Recent Ratings
                    </h2>
                    <button
                      onClick={handleRatingsUpdate}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                      disabled={loading}
                    >
                      {loading ? "Refreshing..." : "Refresh"}
                    </button>
                  </div>
                  {sortedRatings.length > 0 ? (
                    <div className="space-y-4">
                      {sortedRatings.slice(0, 3).map((rating) => (
                        <div
                          key={rating.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {rating.store.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {rating.store.address}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDate(rating.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-lg ${
                                    i < rating.rating
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              ({rating.rating}/5)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      No recent ratings yet. Start exploring stores!
                    </p>
                  )}
                </div>

                
              </div>
            }
          />

          {/* Sub Routes */}
          <Route 
            path="stores" 
            element={<StoreList onRatingUpdated={handleRatingsUpdate} />} 
          />
          <Route 
            path="stores/:id" 
            element={<StoreDetails onRatingUpdated={handleRatingsUpdate} />} 
          />
          <Route path="profile" element={<UserProfile />} />

          {/* My Ratings Page */}
          <Route
            path="my-ratings"
            element={
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-bold text-gray-900">My Ratings</h1>
                  <button
                    onClick={handleRatingsUpdate}
                    className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-md transition-colors"
                    disabled={loading}
                  >
                    {loading ? (
                      <LoadingSpinner size="xs" inline showText={false} />
                    ) : (
                      "Refresh Ratings"
                    )}
                  </button>
                </div>
                {loading ? (
                  <LoadingSpinner size="lg" text="Loading ratings..." />
                ) : sortedRatings.length > 0 ? (
                  <div className="space-y-4">
                    {sortedRatings.map((rating) => (
                      <div key={rating.id} className="card">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {rating.store.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {rating.store.address}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-lg ${
                                    i < rating.rating
                                      ? "text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              ({rating.rating}/5)
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          Rated on {formatDate(rating.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl text-gray-300 mb-4">⭐</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No ratings yet
                    </h3>
                    <p className="text-gray-600">
                      Start exploring stores and share your experiences!
                    </p>
                  </div>
                )}
              </div>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default UserDashboard; 