import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get('/admin/analysis');
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch platform metrics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  if (loading) return <div className="loading-screen">Loading Platform Metrics...</div>;

  if (error) {
    return (
      <div className="dashboard" style={{ maxWidth: '1000px' }}>
        <div className="error-container" style={{ margin: '2rem 0' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const {
    totalUsers = 0,
    totalLogs = 0,
    categoryLogs = {},
    categoryEmission = {},
    mostLoggedCategory = '-',
    highestEmissionCategory = '-',
    averageEmissionPerUser = 0,
    tips = []
  } = data || {};

  // Safety fallback for null properties returned from the backend
  const safeCategoryLogs = categoryLogs || {};
  const safeCategoryEmission = categoryEmission || {};
  const safeTips = tips || [];

  // Calculate percentages for visual bars
  const maxLogs = Math.max(...Object.values(safeCategoryLogs), 1);
  const maxEmission = Math.max(...Object.values(safeCategoryEmission), 1);

  return (
    <div className="dashboard" style={{ maxWidth: '1000px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Platform Diagnostics & Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            System-wide activity distributions, average carbon ratios, and system health
          </p>
        </div>
      </header>

      {/* KPI Stats Grid */}
      <section className="admin-stats-grid" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="chart-card stat-card" style={{ padding: '1.2rem 1.8rem' }}>
          <span className="stat-label" style={{ fontSize: '0.75rem' }}>Active Accounts</span>
          <span className="stat-value" style={{ fontSize: '1.8rem', color: 'var(--primary-color)' }}>{totalUsers}</span>
        </div>
        <div className="chart-card stat-card" style={{ padding: '1.2rem 1.8rem' }}>
          <span className="stat-label" style={{ fontSize: '0.75rem' }}>Logs Audited</span>
          <span className="stat-value" style={{ fontSize: '1.8rem' }}>{totalLogs}</span>
        </div>
        <div className="chart-card stat-card" style={{ padding: '1.2rem 1.8rem' }}>
          <span className="stat-label" style={{ fontSize: '0.75rem' }}>Avg Emission / User</span>
          <span className="stat-value" style={{ fontSize: '1.8rem', color: 'var(--accent-color)' }}>
            {(averageEmissionPerUser ?? 0).toFixed(1)} kg
          </span>
        </div>
      </section>

      {/* Auxiliary Stats */}
      <section className="admin-stats-grid" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <div className="chart-card stat-card" style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="stat-label" style={{ fontSize: '0.75rem' }}>Most Frequent Activity</span>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', textTransform: 'capitalize', display: 'block', marginTop: '0.2rem', color: 'var(--text-primary)' }}>
              {mostLoggedCategory}
            </span>
          </div>
          <span style={{ fontSize: '2rem' }}>📈</span>
        </div>
        <div className="chart-card stat-card" style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span className="stat-label" style={{ fontSize: '0.75rem' }}>Highest CO₂ Contributor</span>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', textTransform: 'capitalize', display: 'block', marginTop: '0.2rem', color: '#b4233c' }}>
              {highestEmissionCategory}
            </span>
          </div>
          <span style={{ fontSize: '2rem' }}>🔥</span>
        </div>
      </section>

      {/* Visual Bar Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        
        {/* Category Logs Share */}
        <div className="chart-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem' }}>Platform Log Volume Share</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {Object.keys(safeCategoryLogs).length > 0 ? (
              Object.entries(safeCategoryLogs).map(([cat, val]) => {
                const pct = (val / maxLogs) * 100;
                return (
                  <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700' }}>
                      <span style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>{cat}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{val} entries</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-color)', borderRadius: '999px' }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--text-light)', fontStyle: 'italic', fontSize: '0.9rem' }}>No log details found.</p>
            )}
          </div>
        </div>

        {/* Category CO2 Share */}
        <div className="chart-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem' }}>Total System Emissions (kg CO₂e)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {Object.keys(safeCategoryEmission).length > 0 ? (
              Object.entries(safeCategoryEmission).map(([cat, val]) => {
                const pct = (val / maxEmission) * 100;
                return (
                  <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700' }}>
                      <span style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>{cat}</span>
                      <span style={{ color: 'var(--primary-color)' }}>{(val ?? 0).toFixed(2)} kg</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary-color)', borderRadius: '999px' }}></div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--text-light)', fontStyle: 'italic', fontSize: '0.9rem' }}>No emissions data found.</p>
            )}
          </div>
        </div>

      </div>

      {/* Admin Operations Recommendations Tips */}
      {safeTips.length > 0 && (
        <section className="chart-card" style={{ padding: '2rem', borderLeft: '4px solid var(--accent-color)' }}>
          <h3 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem', color: 'var(--accent-color)' }}>
            <span>📢</span> Platform Campaign Recommendations
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {safeTips.map((tip, idx) => (
              <li key={idx} style={{ display: 'flex', gap: '0.8rem', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <span>⚡</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
