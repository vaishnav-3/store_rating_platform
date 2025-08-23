import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import Header from './components/common/Header';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import UserDashboardPage from './pages/UserDashboardPage';
import StoreOwnerPage from './pages/StoreOwnerPage';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPage />
                </ProtectedRoute>
              } 
            />
            
            {/* User Routes */}
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboardPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/stores/*" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboardPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboardPage />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/my-ratings" 
              element={
                <ProtectedRoute allowedRoles={['user']}>
                  <UserDashboardPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Store Owner Routes */}
            <Route 
              path="/store-owner/*" 
              element={
                <ProtectedRoute allowedRoles={['store_owner']}>
                  <StoreOwnerPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Unauthorized Route */}
            <Route 
              path="/unauthorized" 
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl text-gray-300 mb-4">🚫</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                    <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
                    <button
                      onClick={() => window.history.back()}
                      className="btn-primary"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              } 
            />
            
            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;