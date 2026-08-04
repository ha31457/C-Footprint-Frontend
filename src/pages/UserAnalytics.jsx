import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

export default function UserAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get('/analysis');
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch carbon analysis dashboards.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, []);

  if (loading) return <div className="loading-screen">Loading Carbon Analysis...</div>;

  if (error) {
    return (
      <div className="dashboard" style={{ maxWidth: '1280px' }}>
        <div className="error-container" style={{ margin: '2rem 0' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const {
    totalLogs = 0,
    totalAllTimeEmission = 0,
    categoryLogs = {},
    categoryEmission = {},
    mostLoggedCategory = '-',
    highestEmissionCategory = '-',
    tips = [],
    recommendations = [],
    trend = []
  } = data || {};

  // Safety fallback for null properties returned from the backend
  const safeCategoryLogs = categoryLogs || {};
  const safeCategoryEmission = categoryEmission || {};
  const safeRecommendations = recommendations || [];
  const safeTips = tips || [];
  const safeTrend = trend || [];

  // Calculate percentages for visual bars
  const maxLogs = Math.max(...Object.values(safeCategoryLogs), 1);
  const maxEmission = Math.max(...Object.values(safeCategoryEmission), 1);

  return (
    <div className="dashboard" style={{ maxWidth: '1280px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Activity Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Detailed breakdown, suggestions, and trends for your ecological footprint
          </p>
        </div>
      </header>

      {/* Summary Row */}
      <section className="admin-stats-grid" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="chart-card stat-card" style={{ padding: '1.4rem 1.8rem', borderTop: '4px solid #6366f1', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, var(--surface-color) 75%)' }}>
          <span className="stat-label" style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📊 Total Logs Recorded</span>
          <span className="stat-value" style={{ fontSize: '1.95rem', fontWeight: '850', color: '#6366f1', marginTop: '0.3rem', display: 'block' }}>{totalLogs}</span>
        </div>
        <div className="chart-card stat-card" style={{ padding: '1.4rem 1.8rem', borderTop: '4px solid #8b5cf6', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, var(--surface-color) 75%)' }}>
          <span className="stat-label" style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🌍 All-Time Emissions</span>
          <span className="stat-value" style={{ fontSize: '1.95rem', fontWeight: '850', color: '#8b5cf6', marginTop: '0.3rem', display: 'block' }}>
            {(totalAllTimeEmission ?? 0).toFixed(1)} <small style={{ fontSize: '0.9rem' }}>kg</small>
          </span>
        </div>
        <div className="chart-card stat-card" style={{ padding: '1.4rem 1.8rem', borderTop: '4px solid #06b6d4', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, var(--surface-color) 75%)' }}>
          <span className="stat-label" style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚡ Most Frequent Activity</span>
          <span className="stat-value" style={{ fontSize: '1.95rem', fontWeight: '850', textTransform: 'capitalize', color: '#06b6d4', marginTop: '0.3rem', display: 'block' }}>
            {mostLoggedCategory || 'None'}
          </span>
        </div>
        <div className="chart-card stat-card" style={{ padding: '1.4rem 1.8rem', borderTop: '4px solid #ec4899', background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, var(--surface-color) 75%)' }}>
          <span className="stat-label" style={{ fontSize: '0.78rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔥 Highest CO₂ Source</span>
          <span className="stat-value" style={{ fontSize: '1.95rem', fontWeight: '850', textTransform: 'capitalize', color: '#ec4899', marginTop: '0.3rem', display: 'block' }}>
            {highestEmissionCategory || 'None'}
          </span>
        </div>
      </section>

      {/* Visual Breakdowns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>

        {/* Category Logs Share */}
        <div className="chart-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem' }}>Log Volume by Category</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {Object.keys(safeCategoryLogs).length > 0 ? (
              Object.entries(safeCategoryLogs).map(([cat, val]) => {
                const pct = (val / maxLogs) * 100;
                return (
                  <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '700' }}>
                      <span style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>{cat}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{val} logs</span>
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
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.15rem' }}>Emissions Share (kg CO₂e)</h3>
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

      {/* Analysis Suggestion Tips / Recommendations */}
      {(safeTips.length > 0 || safeRecommendations.length > 0) && (
        <section className="chart-card" style={{ padding: '2rem', marginBottom: '2rem', borderLeft: '4px solid var(--primary-color)' }}>
          <h3 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.15rem', color: 'var(--primary-color)' }}>
            <span>💡</span> Recommended Sustainability Action Steps
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {safeRecommendations.length > 0 ? (
              safeRecommendations.map((rec, idx) => (
                <li key={`rec-${idx}`} style={{ display: 'flex', gap: '0.8rem', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  <span>🌱</span>
                  <span>{rec}</span>
                </li>
              ))
            ) : (
              safeTips.map((tip, idx) => (
                <li key={`tip-${idx}`} style={{ display: 'flex', gap: '0.8rem', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  <span>🌱</span>
                  <span>{tip}</span>
                </li>
              ))
            )}
          </ul>
        </section>
      )}

      {/* Emissions Trend History */}
      <section className="chart-card" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.2rem', fontSize: '1.15rem' }}>Emissions Trend Timeline</h3>
        {safeTrend.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Log Date / Timeline</th>
                  <th>Emissions Volume (kg CO₂e)</th>
                </tr>
              </thead>
              <tbody>
                {safeTrend.map((point, index) => (
                  <tr key={index}>
                    <td style={{ fontWeight: '700' }}>{point.label}</td>
                    <td style={{ fontWeight: '800', color: 'var(--primary-color)' }}>
                      {(point.value ?? 0).toFixed(2)} kg
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: 'var(--text-light)', fontStyle: 'italic', fontSize: '0.9rem' }}>No trend logs recorded yet.</p>
        )}
      </section>
    </div>
  );
}
