import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const getMenuItems = () => {
    switch (user.role) {
      case "admin":
        return [
          { to: "/admin", label: "Dashboard", icon: "📊" },
          { to: "/admin/users", label: "User Management", icon: "👥" },
          { to: "/admin/stores", label: "Store Management", icon: "🏪" },
          { to: "/admin/create-user", label: "Create User", icon: "➕" },
        ];
      case "user":
        return [
          { to: "/dashboard", label: "Dashboard", icon: "🏠" },
          { to: "/dashboard/stores", label: "Browse Stores", icon: "🏪" },
          { to: "/dashboard/profile", label: "My Profile", icon: "👤" },
          { to: "/dashboard/my-ratings", label: "My Ratings", icon: "⭐" },
        ];
      case "store_owner":
        return [
          { to: "/store-owner", label: "Dashboard", icon: "📈" },
          { to: "/store-owner/ratings", label: "Store Ratings", icon: "⭐" },
          { to: "/store-owner/settings", label: "Store Settings", icon: "⚙️" },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const isActive = (path) => {
    // Exact match for dashboard routes to prevent always being active
    if (path === "/dashboard" || path === "/admin" || path === "/store-owner") {
      return location.pathname === path;
    }
    // For other routes, check if current path starts with the menu path
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <aside className="hidden md:block w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen">
      <nav aria-label="Sidebar" className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              isActive(item.to)
                ? "bg-blue-50 text-blue-700 border-r-4 border-blue-600 font-semibold"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;