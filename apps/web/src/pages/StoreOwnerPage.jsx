import { Routes, Route, Navigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import OwnerDashboard from "../components/store-owner/OwnerDashboard";
import StoreSettings from "../components/store-owner/StoreSettings";
import StoreRatings from "../components/store-owner/StoreRatings";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import LoadingSpinner from "../components/common/LoadingSpinner";

const StoreOwnerLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const navigation = [
    { name: 'Dashboard', href: '/store-owner', icon: '🏪' },
    
    { name: 'Reviews', href: '/store-owner/ratings', icon: '⭐' },
    { name: 'Settings', href: '/store-owner/settings', icon: '⚙️' },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          
          
          {/* User Info */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href === '/store-owner' && location.pathname === '/store-owner/dashboard');
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        
        
        {/* Page Content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const StoreOwnerPage = () => {
  return (
    <Routes>
      <Route element={<StoreOwnerLayout />}>
        <Route index element={<OwnerDashboard />} />
        <Route path="dashboard" element={<OwnerDashboard />} />
        <Route path="my-store" element={<OwnerDashboard />} />
        <Route path="settings" element={<StoreSettings />} />
        <Route path="ratings" element={<StoreRatings />} />
        {/* Fallback to dashboard for unknown subroutes */}
        <Route path="*" element={<Navigate to="/store-owner" replace />} />
      </Route>
    </Routes>
  );
};

export default StoreOwnerPage;