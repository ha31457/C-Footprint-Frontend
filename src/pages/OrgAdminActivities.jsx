import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export default function OrgAdminActivities() {
  const [filterLogs, setFilterLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logFilters, setLogFilters] = useState({
    range: '',
    date: '',
    category: ''
  });

  const fetchActivities = async () => {
    setLoading(true);
    setError('');
    try {
      const { range, date, category } = logFilters;
      const params = {};
      if (range) params.range = range;
      if (date) params.date = date;
      if (category) params.category = category;

      const response = await apiClient.get('/org-admin/activities', { params });
      const data = response.data || {};
      const logsList = Array.isArray(data) ? data : (data.activities || []);
      setFilterLogs(logsList);
    } catch (err) {
      console.error('[OrgAdminActivities] Load error:', err);
      setError('Failed to fetch corporate activity logs list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  return (
    <div className="dashboard" style={{ maxWidth: '1280px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1>Activity Logs Search</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Search, filter, and inspect carbon logging submissions made by your employees
          </p>
        </div>
      </header>

      {/* Filter panel card */}
      <div className="chart-card" style={{ padding: '1.5rem', marginBottom: '2.5rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '850', marginBottom: '1.2rem' }}>
          🔍 Query Logs Filters
        </h3>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <label style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem', fontWeight: '750', color: 'var(--text-secondary)' }}>
            Range
            <select
              value={logFilters.range}
              onChange={(e) => setLogFilters({ ...logFilters, range: e.target.value })}
              style={{ padding: '0.55rem 0.8rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="">All Ranges</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>

          <label style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem', fontWeight: '750', color: 'var(--text-secondary)' }}>
            Specific Date (YYYY-MM-DD)
            <input
              type="date"
              value={logFilters.date}
              onChange={(e) => setLogFilters({ ...logFilters, date: e.target.value })}
              style={{ padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none' }}
            />
          </label>

          <label style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem', fontWeight: '750', color: 'var(--text-secondary)' }}>
            Category
            <select
              value={logFilters.category}
              onChange={(e) => setLogFilters({ ...logFilters, category: e.target.value })}
              style={{ padding: '0.55rem 0.8rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none' }}
            >
              <option value="">All Categories</option>
              <option value="transport">Transport</option>
              <option value="energy">Energy</option>
              <option value="food">Food</option>
              <option value="waste">Waste</option>
              <option value="other">Other</option>
            </select>
          </label>

          <button
            onClick={fetchActivities}
            className="btn-submit"
            style={{ padding: '0.65rem 1.4rem', fontWeight: '800' }}
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Results grid */}
      <div className="chart-card">
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', marginBottom: '1.5rem' }}>
          Logged Activity Transactions
        </h3>

        {error && (
          <div className="error-container" style={{ marginBottom: '1rem' }}>
            <span>⚠️</span> <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div>Loading transactions logs...</div>
        ) : filterLogs.length === 0 ? (
          <p style={{ color: 'var(--text-light)', fontStyle: 'italic', margin: 0 }}>No matching logged activities found.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.8rem' }}>Employee</th>
                  <th style={{ padding: '0.8rem' }}>Category</th>
                  <th style={{ padding: '0.8rem' }}>Activity Type</th>
                  <th style={{ padding: '0.8rem' }}>Amount</th>
                  <th style={{ padding: '0.8rem' }}>Date</th>
                  <th style={{ padding: '0.8rem', textAlign: 'right' }}>Emissions Saved</th>
                </tr>
              </thead>
              <tbody>
                {filterLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.8rem', fontWeight: '750' }}>{log.username || 'Employee'}</td>
                    <td style={{ padding: '0.8rem', textTransform: 'capitalize' }}>{log.category}</td>
                    <td style={{ padding: '0.8rem', color: 'var(--text-secondary)' }}>{log.activityType}</td>
                    <td style={{ padding: '0.8rem' }}>{log.quantity} {log.unit}</td>
                    <td style={{ padding: '0.8rem' }}>{log.logDate}</td>
                    <td style={{ padding: '0.8rem', textAlign: 'right', fontWeight: '850', color: 'var(--primary-color)' }}>
                      -{log.co2Emission?.toFixed(1) || '0.0'} kg CO₂
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
