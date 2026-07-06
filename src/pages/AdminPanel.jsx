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

const LIST_RANGE_OPTIONS = [
  { value: '', label: 'All Time' },
  { value: 'daily', label: 'Today (Daily)' },
  { value: 'weekly', label: 'Last 7 Days (Weekly)' },
  { value: 'monthly', label: 'Last 30 Days (Monthly)' },
  { value: 'yearly', label: 'Last 365 Days (Yearly)' },
];

export default function AdminPanel() {
  const [usersStat, setUsersStat] = useState(null);
  const [activitiesStat, setActivitiesStat] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [platformActivities, setPlatformActivities] = useState([]);
  const [range, setRange] = useState('daily');
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [activitiesListLoading, setActivitiesListLoading] = useState(true);
  const [error, setError] = useState('');
  const [disableFeedback, setDisableFeedback] = useState('');

  // Search & Filters for Activities
  const [listRange, setListRange] = useState('');
  const [listDate, setListDate] = useState('');
  const [textSearch, setTextSearch] = useState('');

  // Initial load for users stat and users list
  useEffect(() => {
    const initData = async () => {
      try {
        const [usersRes, listRes] = await Promise.all([
          apiClient.get('/admin/users'),
          apiClient.get('/admin/users/all'),
        ]);
        setUsersStat(usersRes.data);
        setUsersList(listRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch platform metrics');
      } finally {
        setUsersLoading(false);
      }
    };
    initData();
  }, []);

  // Fetch platform emissions chart stats when range changes
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

  // Fetch Platform Activities Log List
  useEffect(() => {
    const fetchPlatformActivitiesList = async () => {
      setActivitiesListLoading(true);
      try {
        const params = {};
        if (listDate) {
          params.date = listDate;
        } else if (listRange) {
          params.range = listRange;
        }
        const res = await apiClient.get('/admin/activities/list', { params });
        setPlatformActivities(res.data || []);
      } catch (err) {
        console.error('Failed to fetch platform activities list:', err);
      } finally {
        setActivitiesListLoading(false);
      }
    };
    fetchPlatformActivitiesList();
  }, [listRange, listDate]);

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

  const handleClearFilters = () => {
    setListRange('');
    setListDate('');
    setTextSearch('');
  };

  if (loading) return <div className="loading-screen">Loading Admin Dashboard...</div>;

  const trendData = activitiesStat?.trend || [];

  // Filter activities locally by username/email/type
  const filteredActivities = platformActivities.filter((act) => {
    const query = textSearch.toLowerCase().trim();
    if (!query) return true;
    return (
      (act.username && act.username.toLowerCase().includes(query)) ||
      (act.userEmail && act.userEmail.toLowerCase().includes(query)) ||
      (act.activityType && act.activityType.toLowerCase().includes(query)) ||
      (act.category && act.category.toLowerCase().includes(query))
    );
  });

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

      {/* User Management Panel */}
      <section className="chart-card" style={{ marginBottom: '2.5rem' }}>
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

      {/* Platform Activities Log & Auditing Panel */}
      <section className="chart-card">
        <h3 style={{ marginBottom: '1.2rem' }}>Platform Activity Log Audit</h3>

        {/* Filter Bar Controls */}
        <div className="filter-bar" style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', marginBottom: '1.8rem', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '240px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Search User / Category / Type</label>
            <input
              type="text"
              className="search-input"
              placeholder="Search by username, email, type..."
              value={textSearch}
              onChange={(e) => setTextSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                outline: 'none',
                background: 'rgba(255,255,255,0.7)',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-family)',
              }}
            />
          </div>

          <div style={{ width: '220px' }}>
            <CustomDropdown
              label="Audit Time Range"
              options={LIST_RANGE_OPTIONS}
              value={listRange}
              onChange={(val) => {
                setListRange(val);
                setListDate(''); // Clear date override if selecting range
              }}
              placeholder="Filter by Range"
            />
          </div>

          <div style={{ width: '180px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Exact Calendar Date</label>
            <input
              type="date"
              value={listDate}
              onChange={(e) => {
                setListDate(e.target.value);
                setListRange(''); // Clear range if picking date
              }}
              style={{
                width: '100%',
                padding: '0.55rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                outline: 'none',
                background: 'rgba(255,255,255,0.7)',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-family)',
                height: '38px',
              }}
            />
          </div>

          {(listRange || listDate || textSearch) && (
            <button
              onClick={handleClearFilters}
              style={{
                padding: '0.6rem 1.4rem',
                background: 'transparent',
                border: '1px solid var(--text-light)',
                borderRadius: '12px',
                color: 'var(--text-secondary)',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s',
                height: '38px',
              }}
              onMouseEnter={(e) => { e.target.style.background = 'rgba(0,0,0,0.03)'; }}
              onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {activitiesListLoading ? (
          <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Loadingplatform activities...</p>
        ) : filteredActivities.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Log Date</th>
                  <th>User Details</th>
                  <th>Category</th>
                  <th>Activity Type</th>
                  <th>Quantity logged</th>
                  <th>CO2 (kg)</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((act) => (
                  <tr key={act.id}>
                    <td style={{ fontWeight: '700' }}>{act.logDate}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{act.username || 'Unknown'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{act.userEmail || '-'}</span>
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{act.category}</td>
                    <td>{act.activityType?.replace('_', ' ')}</td>
                    <td>
                      {act.quantity} {act.unit}
                    </td>
                    <td style={{ fontWeight: '800', color: 'var(--primary-color)' }}>
                      {act.co2Emission?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem 0' }}>
            No matching platform carbon logs found.
          </p>
        )}
      </section>
    </div>
  );
}
