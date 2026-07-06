import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ActivityLog from './pages/ActivityLog';
import AdminPanel from './pages/AdminPanel';

function NavBar() {
  const { isAuthenticated, user, logout } = useAuth();
  if (!isAuthenticated) return null;
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span>🌱</span>
        <span>EcoFootprint</span>
      </div>
      <div className="navbar-links">
        {user?.role !== 'ROLE_ADMIN' && <Link to="/dashboard">Dashboard</Link>}
        <Link to="/log-activity">Log Activity</Link>
        {user?.role === 'ROLE_ADMIN' && <Link to="/admin/dashboard">Admin Dashboard</Link>}
        <button onClick={logout} className="navbar-logout-btn">Log Out</button>
      </div>
    </nav>
  );
}

export default function App() {
  const { user } = useAuth();

  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              {user?.role === 'ROLE_ADMIN' ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Dashboard />
              )}
            </ProtectedRoute>
          }
        />
        <Route
          path="/log-activity"
          element={
            <ProtectedRoute>
              <ActivityLog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to={user?.role === 'ROLE_ADMIN' ? "/admin/dashboard" : "/dashboard"} replace />} />
      </Routes>
    </>
  );
}