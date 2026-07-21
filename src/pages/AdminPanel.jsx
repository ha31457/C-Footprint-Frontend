import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import apiClient from '../api/apiClient';
import CustomDropdown from '../components/CustomDropdown';

const COLORS = ['#225c3b', '#0284c7', '#769482', '#0f766e'];

const RANGE_OPTIONS = [
  { value: 'daily', label: 'Daily (Last 7 Days)' },
  { value: 'weekly', label: 'Weekly (Last 4 Weeks)' },
  { value: 'monthly', label: 'Monthly (Last 6 Months)' },
  { value: 'yearly', label: 'Yearly (Last 3 Years)' },
];

export default function AdminPanel() {
  const [usersStat, setUsersStat] = useState(null);
  const [activitiesStat, setActivitiesStat] = useState(null);
  const [range, setRange] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [error, setError] = useState('');

  // Initial load for users stat (does not depend on range)
  useEffect(() => {
    const fetchUsersStat = async () => {
      try {
        const res = await apiClient.get('/admin/users');
        setUsersStat(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch platform metrics');
      }
    };
    fetchUsersStat();
  }, []);

  // Fetch activities when range changes
  useEffect(() => {
    const fetchActivities = async () => {
      setActivitiesLoading(true);
      try {
        const res = await apiClient.get(`/admin/activities?range=${range}`);
        setActivitiesStat(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch platform analytics');
      } finally {
        setActivitiesLoading(false);
        setLoading(false);
      }
    };
    fetchActivities();
  }, [range]);

  if (loading) return <div className="loading-screen">Loading Admin Dashboard...</div>;

  const trendData = activitiesStat?.trend || [];

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
      <section className="chart-grid">
        {/* Left Card: Pie Chart Breakdown */}
        <div className="chart-card">
          <h3>Global Category Breakdown</h3>
          {activitiesStat?.categoryBreakdown && activitiesStat.categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={activitiesStat.categoryBreakdown}
                  dataKey="co2Emission"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px', color: 'var(--text-light)' }}>
              No carbon logs recorded on the platform yet.
            </div>
          )}
        </div>

        {/* Right Card: Multi-Range Platform Trend Chart */}
        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Global Emissions Trend</h3>
            <div style={{ width: '200px' }}>
              <CustomDropdown
                options={RANGE_OPTIONS}
                value={range}
                onChange={(val) => setRange(val)}
                placeholder="Select Range"
              />
            </div>
          </div>
          {activitiesLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px', color: 'var(--text-light)' }}>
              Loading trend data...
            </div>
          ) : trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)} kg`} />
                <Line type="monotone" dataKey="co2Emission" stroke="#0284c7" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '280px', color: 'var(--text-light)', textAlign: 'center' }}>
              No trend data available for this range.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
