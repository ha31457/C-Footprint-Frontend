import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../api/apiClient';

const COLORS = ['#225c3b', '#0284c7', '#769482', '#0f766e'];

export default function AdminPanel() {
  const [usersStat, setUsersStat] = useState(null);
  const [activitiesStat, setActivitiesStat] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState('');
  const [disableFeedback, setDisableFeedback] = useState('');

  const fetchAdminStats = async () => {
    try {
      const [usersRes, activitiesRes, listRes] = await Promise.all([
        apiClient.get('/admin/users'),
        apiClient.get('/admin/activities'),
        apiClient.get('/admin/users/all'),
      ]);
      setUsersStat(usersRes.data);
      setActivitiesStat(activitiesRes.data);
      setUsersList(listRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin stats');
    } finally {
      setLoading(false);
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const handleDisableUser = async (userId) => {
    if (!window.confirm('Are you sure you want to disable this user account? This will log them out instantly.')) {
      return;
    }
    try {
      setDisableFeedback('');
      await apiClient.delete(`/admin/users/${userId}`);
      setDisableFeedback('User has been successfully disabled and logged out.');
      
      // Update local state for user management table
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, disabled: true, enabled: false } : u))
      );

      // Update counters locally
      setUsersStat((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          enabledUsers: Math.max(0, prev.enabledUsers - 1),
          disabledUsers: prev.disabledUsers + 1,
        };
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable user account');
    }
  };

  if (loading) return <div className="loading-screen">Loading Admin Dashboard...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Platform-wide user analytics & carbon activity stats
          </p>
        </div>
      </header>

      {error && (
        <div className="error-container" style={{ marginBottom: '2rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <section className="admin-stats-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="chart-card stat-card">
          <span className="stat-label">Total Registered Users</span>
          <span className="stat-value">{usersStat?.totalUsers || 0}</span>
          <div className="stat-sub-row">
            <span className="stat-sub-green">{usersStat?.enabledUsers || 0} Verified</span>
            <span className="stat-sub-red">{usersStat?.disabledUsers || 0} Unverified</span>
          </div>
        </div>

        <div className="chart-card stat-card">
          <span className="stat-label">Platform Carbon Log Count</span>
          <span className="stat-value">{activitiesStat?.totalLogs || 0}</span>
          <div className="stat-sub-row">
            <span className="stat-sub-blue">{activitiesStat?.logsLoggedToday || 0} Logged Today</span>
          </div>
        </div>

        <div className="chart-card stat-card">
          <span className="stat-label">Total Platform CO2 (Kgs)</span>
          <span className="stat-value" style={{ color: 'var(--accent-color)' }}>
            {activitiesStat?.totalCo2EmissionKgs?.toFixed(2) || 0} kg
          </span>
          <div className="stat-sub-row">
            <span>Overall aggregate emissions logged</span>
          </div>
        </div>
      </section>

      {/* Chart Visual Breakdown */}
      <section className="chart-grid" style={{ marginBottom: '2.5rem' }}>
        <div className="chart-card" style={{ gridColumn: 'span 2' }}>
          <h3>Global Category Breakdown (CO2 Emissions Contribution)</h3>
          {activitiesStat?.categoryBreakdown && activitiesStat.categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={activitiesStat.categoryBreakdown}
                  dataKey="co2Emission"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(props) => {
                    const { name, percent, payload } = props;
                    if (!percent || percent <= 0) return '';
                    const categoryName = payload?.category || name || 'unknown';
                    const percentageValue = payload?.percentage || (percent * 100);
                    return `${categoryName.toUpperCase()} (${percentageValue.toFixed(1)}%)`;
                  }}
                >
                  {activitiesStat.categoryBreakdown.map((entry, index) => (
                    <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)} kg CO2e`} />
                <Legend formatter={(value) => value.toUpperCase()} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem' }}>
              No carbon logs recorded on the platform yet.
            </p>
          )}
        </div>
      </section>

      {/* User Management Panel */}
      <section className="chart-card">
        <h3 style={{ marginBottom: '1.2rem' }}>Platform User Management</h3>
        {disableFeedback && (
          <div className="success-container" style={{ marginBottom: '1.5rem' }}>
            <span>✅</span>
            <span>{disableFeedback}</span>
          </div>
        )}
        {usersLoading ? (
          <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Loading registered users...</p>
        ) : usersList.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Mobile Number</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((usr) => (
                  <tr key={usr.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{usr.username}</td>
                    <td>{usr.email}</td>
                    <td>{usr.mobileNumber || '-'}</td>
                    <td>{usr.age || '-'}</td>
                    <td>{usr.gender || '-'}</td>
                    <td>
                      {usr.disabled ? (
                        <span className="badge badge-disabled">Disabled</span>
                      ) : (
                        <span className="badge badge-active">Active</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDisableUser(usr.id)}
                        disabled={usr.disabled}
                        className="disable-btn"
                        style={{
                          padding: '0.4rem 0.9rem',
                          fontSize: '0.8rem',
                          borderRadius: '9999px',
                          border: 'none',
                          background: usr.disabled ? 'rgba(0,0,0,0.06)' : 'var(--error-color)',
                          color: usr.disabled ? 'var(--text-light)' : 'white',
                          cursor: usr.disabled ? 'not-allowed' : 'pointer',
                          fontWeight: '700',
                          transition: 'all 0.2s',
                        }}
                      >
                        {usr.disabled ? 'Disabled' : 'Disable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '1.5rem 0' }}>
            No registered platform users found.
          </p>
        )}
      </section>
    </div>
  );
}
