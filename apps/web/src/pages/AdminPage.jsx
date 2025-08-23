import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Sidebar from '../components/common/Sidebar';
import AdminDashboard from '../components/admin/AdminDashboard';
import UserManagement from '../components/admin/UserManagement';
import StoreManagement from '../components/admin/StoreManagement';
import CreateUserForm from '../components/admin/CreateUserForm';

const AdminPage = () => {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Optional: page titles (can expand to breadcrumbs)
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/admin/users':
        return '';
      case '/admin/stores':
        return '';
      case '/admin/create-user':
        return 'Create New User';
      default:
        return '';
    }
  };
 
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
        </div>

        {/* Page Routes */}
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="stores" element={<StoreManagement />} />
          <Route path="create-user" element={<CreateUserForm />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPage;
