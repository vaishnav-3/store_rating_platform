import { useState, useEffect } from "react";
import LoadingSpinner from "../common/LoadingSpinner";
import { Link } from "react-router-dom";
import adminService from "../../services/adminService";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const data = await adminService.getDashboard(); // ✅ single call
        setStats(data);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: "👥",
      color: "bg-blue-500",
    },
    {
      title: "Total Stores",
      value: stats.totalStores,
      icon: "🏪",
      color: "bg-green-500",
    },
    {
      title: "Total Ratings",
      value: stats.totalRatings,
      icon: "⭐",
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="text-sm text-gray-500">Welcome back, Administrator</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition"
          >
            <div className="flex items-center">
              <div
                className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white text-xl`}
              >
                {stat.icon}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Users by Role */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Users by Role</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats.usersByRole).map(([role, count]) => (
            <div key={role} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 capitalize">
                  {role.replace("_", " ")}
                </span>
                <span className="text-2xl font-bold text-blue-600">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      
    </div>
  );
};

export default AdminDashboard;
