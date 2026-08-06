import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
// import { Analytics } from '@vercel/analytics/react';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LandingPage from './pages/LandingPage';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import ActivityLog from './pages/ActivityLog';
import AdminPanel from './pages/AdminPanel';
import UserActivityHistory from './pages/UserActivityHistory';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminActivityMonitoring from './pages/AdminActivityMonitoring';
import UserProfile from './pages/UserProfile';
import AdminSystemSettings from './pages/AdminSystemSettings';
import AdminReports from './pages/AdminReports';
import PlaceholderPage from './pages/PlaceholderPage';
import AdminEmissionFactors from './pages/AdminEmissionFactors';
import UserAnalytics from './pages/UserAnalytics';
import AdminAnalytics from './pages/AdminAnalytics';
import CommunityLeaderboard from './pages/CommunityLeaderboard';
import Recommendations from './pages/Recommendations';
import SustainabilityGoals from './pages/SustainabilityGoals';

import BadgesLeaderboard from './pages/BadgesLeaderboard';
import AdminBadgeManagement from './pages/AdminBadgeManagement';
import AdminLeaderboardManagement from './pages/AdminLeaderboardManagement';
import Support from './pages/Support';
import AdminSupport from './pages/AdminSupport';

export default function App() {
  const { user } = useAuth();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, []);

  return (
    <Layout>
      {/* <Analytics /> */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/support" element={<Support />} />

        {/* Protected User Routes */}
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
          path="/activity-history"
          element={
            <ProtectedRoute>
              <UserActivityHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <UserAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sustainability-goals"
          element={
            <ProtectedRoute>
              <SustainabilityGoals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/community-leaderboard"
          element={
            <ProtectedRoute>
              <CommunityLeaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/badges-leaderboard"
          element={
            <ProtectedRoute>
              <BadgesLeaderboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <PlaceholderPage title="Settings" icon="⚙️" />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/user-management"
          element={
            <AdminRoute>
              <AdminUserManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/activity-monitoring"
          element={
            <AdminRoute>
              <AdminActivityMonitoring />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <AdminRoute>
              <UserProfile />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/emission-factors"
          element={
            <AdminRoute>
              <AdminEmissionFactors />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/organization-management"
          element={
            <AdminRoute>
              <PlaceholderPage title="Organization Management" icon="🏢" />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/badge-management"
          element={
            <AdminRoute>
              <AdminBadgeManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/leaderboard-management"
          element={
            <AdminRoute>
              <AdminLeaderboardManagement />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/support"
          element={
            <AdminRoute>
              <AdminSupport />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <AdminRoute>
              <AdminReports />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <AdminRoute>
              <AdminAnalytics />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/system-settings"
          element={
            <AdminRoute>
              <AdminSystemSettings />
            </AdminRoute>
          }
        />

        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to={user?.role === 'ROLE_ADMIN' ? "/admin/dashboard" : "/dashboard"} replace />} />
      </Routes>
    </Layout>
  );
}