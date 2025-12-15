import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import BrandList from './pages/BrandList';
import BrandDetail from './pages/BrandDetail';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import InventoryManagement from './pages/admin/InventoryManagement';
import OrderRequests from './pages/admin/OrderRequests';

// Route Guard
const ProtectedRoute = ({ children, roles }: { children?: React.ReactNode, roles?: UserRole[] }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading secure environment...</div>;
  if (!isAuthenticated || !user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute roles={[UserRole.ADMIN]}>
          <Layout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="inventory" element={<InventoryManagement />} />
              <Route path="orders" element={<OrderRequests />} />
              <Route path="*" element={<Navigate to="dashboard" />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />

      {/* User Routes */}
      <Route path="/*" element={
        <ProtectedRoute roles={[UserRole.USER, UserRole.ADMIN]}>
          <Layout>
            <Routes>
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="brands" element={<BrandList />} />
              <Route path="brands/:id" element={<BrandDetail />} />
              <Route path="*" element={<Navigate to="dashboard" />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;