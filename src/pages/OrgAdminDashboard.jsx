import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export default function OrgAdminDashboard() {
  const [summaryStats, setSummaryStats] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [activitiesRange, setActivitiesRange] = useState('monthly');
  const [activitiesAnalytics, setActivitiesAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOverviewData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, usersRes, actRes] = await Promise.all([
        apiClient.get('/org-admin/reports/summary'),
        apiClient.get('/org-admin/analytics/users'),
        apiClient.get(`/org-admin/analytics/activities?range=${activitiesRange}`)
      ]);
      setSummaryStats(summaryRes.data);
      setUserAnalytics(usersRes.data);
      setActivitiesAnalytics(actRes.data);
    } catch (err) {
      console.error('[OrgAdminDashboard] Error fetching statistics:', err);
      setError('Failed to retrieve corporate analytics datasets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewData();
  }, [activitiesRange]);

  const breakdown = summaryStats?.categoryBreakdown || {};
  const totalCategoryCo2 = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="dashboard" style={{ maxWidth: '1280px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1>Corporate Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Real-time carbon auditing records, user registrations, and category breakdown reports
          </p>
        </div>
      </header>

      {error && (
        <div className="error-container" style={{ marginBottom: '2rem' }}>
          <span>⚠️</span> <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div>Loading dashboard statistics...</div>
      ) : (
        <div>
          {/* Summary Cards Grid */}
          <div className="chart-grid" style={{ marginBottom: '2.5rem' }}>
            
            {/* User Directory */}
            <div className="chart-card stat-card" style={{ borderTop: '4px solid var(--primary-color)' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                👥 Employee Directory
              </span>
              <span style={{ fontSize: '2rem', fontWeight: '850', color: 'var(--text-primary)', marginTop: '0.4rem', display: 'block' }}>
                {userAnalytics?.totalUsers || 0} <small style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-light)' }}>Total</small>
              </span>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: '750' }}>
                <span style={{ color: 'var(--primary-color)' }}>🟢 {userAnalytics?.enabledUsers || 0} Active</span>
                <span style={{ color: 'var(--error-color)' }}>🔴 {userAnalytics?.disabledUsers || 0} Suspended</span>
              </div>
            </div>

            {/* Total Carbon */}
            <div className="chart-card stat-card" style={{ borderTop: '4px solid #8b5cf6' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                🌱 Total Carbon Reduced
              </span>
              <span style={{ fontSize: '2rem', fontWeight: '850', color: '#8b5cf6', marginTop: '0.4rem', display: 'block' }}>
                {summaryStats?.totalCo2?.toFixed(1) || '0.0'} <small style={{ fontSize: '0.88rem' }}>kg CO₂e</small>
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '0.5rem', display: 'block' }}>
                Average {summaryStats?.averageCo2PerEmployee?.toFixed(1) || '0.0'} kg per active profile
              </span>
            </div>

            {/* Badges Milestones */}
            <div className="chart-card stat-card" style={{ borderTop: '4px solid #eab308' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                🏆 Badge Achievements
              </span>
              <span style={{ fontSize: '2rem', fontWeight: '850', color: '#eab308', marginTop: '0.4rem', display: 'block' }}>
                {summaryStats?.badgesAwarded || 0} <small style={{ fontSize: '0.88rem' }}>Milestones</small>
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '0.5rem', display: 'block' }}>
                Total logs recorded: <strong>{summaryStats?.totalLogs || 0}</strong>
              </span>
            </div>

          </div>

          {/* Breakdown and Range Charts Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem' }}>
            
            {/* Category Breakdown list */}
            <div className="chart-card">
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '850', marginBottom: '1.5rem' }}>
                Category Emissions Breakdown
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {Object.keys(breakdown).length > 0 ? (
                  Object.entries(breakdown).map(([cat, val]) => {
                    const pct = ((val / totalCategoryCo2) * 100).toFixed(0);
                    return (
                      <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '750' }}>
                          <span style={{ textTransform: 'capitalize' }}>
                            {cat === 'transport' ? '🚗 Transport' : cat === 'energy' ? '⚡ Energy' : cat}
                          </span>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {val.toFixed(1)} kg ({pct}%)
                          </span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: cat === 'transport' ? 'var(--primary-color)' : '#8b5cf6', borderRadius: '99px' }} />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ color: 'var(--text-light)', fontStyle: 'italic', margin: 0 }}>No logged activities found.</p>
                )}
              </div>
            </div>

            {/* Range activity search */}
            <div className="chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '850' }}>
                  Emissions Scope Range Analytics
                </h3>
                <select
                  value={activitiesRange}
                  onChange={(e) => setActivitiesRange(e.target.value)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-color)',
                    color: 'var(--text-primary)',
                    fontWeight: '750',
                    fontSize: '0.78rem',
                    outline: 'none'
                  }}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 1rem', background: 'var(--bg-color)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '750', color: 'var(--text-secondary)' }}>Selected Range Sum:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '850', color: 'var(--primary-color)' }}>
                    {activitiesAnalytics?.totalCo2EmissionKgs?.toFixed(2) || activitiesAnalytics?.totalCo2?.toFixed(2) || activitiesAnalytics?.totalCo2Emission?.toFixed(2) || '0.00'} kg
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 1rem', background: 'var(--bg-color)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: '750', color: 'var(--text-secondary)' }}>Range Activities Logged:</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: '850', color: 'var(--text-primary)' }}>
                    {activitiesAnalytics?.activityCount || activitiesAnalytics?.totalLogs || 0} logs
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
