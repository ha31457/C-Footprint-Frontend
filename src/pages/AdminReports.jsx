import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

export default function AdminReports() {
  const { accessToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await apiClient.get('/admin/reports/summary');
        setStats(response.data);
      } catch (err) {
        console.error('[AdminReports] Failed to fetch summary stats:', err);
        setError('Failed to load administrative summary statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}/admin/reports/export?format=${format}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error('File export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `platform_report.${format === 'word' ? 'docx' : format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(`[AdminReports] Export as ${format} failed:`, err);
      alert(`Failed to export document as ${format.toUpperCase()}.`);
    } finally {
      setExporting(null);
    }
  };

  if (loading) return <div className="loading-screen">Loading platform summary report...</div>;

  if (error) {
    return (
      <div className="dashboard" style={{ maxWidth: '1000px' }}>
        <div className="error-container">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      </div>
    );
  }

  // Calculate sum of categories for percentage breakdown display
  const breakdown = stats?.categoryBreakdown || {};
  const totalCategoryCo2 = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="dashboard" style={{ maxWidth: '1280px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1>Platform Summary & Reports</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Monitor real-time statistics and download document audit summaries
          </p>
        </div>
      </header>

      {/* Export Section */}
      <section className="chart-card" style={{ padding: '2rem', marginBottom: '2.5rem', borderLeft: '5px solid var(--primary-color)' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '850', color: 'var(--text-primary)' }}>
          📥 Export Official Documents
        </h3>
        <p style={{ margin: '0.3rem 0 1.5rem 0', fontSize: '0.88rem', color: 'var(--text-light)', lineHeight: '1.4' }}>
          Select a file format below to compile and download all system transaction logs, carbon calculations, and goal completions.
        </p>

        <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
          {/* PDF button */}
          <button
            type="button"
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
            className="btn-submit"
            style={{
              background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
              color: '#ffffff',
              padding: '0.8rem 1.6rem',
              fontWeight: '800',
              fontSize: '0.9rem',
              border: 'none',
              boxShadow: '0 4px 10px rgba(185, 28, 28, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {exporting === 'pdf' ? 'Generating PDF...' : '📄 Download PDF Report'}
          </button>

          {/* Word button */}
          <button
            type="button"
            onClick={() => handleExport('word')}
            disabled={exporting !== null}
            className="btn-submit"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              color: '#ffffff',
              padding: '0.8rem 1.6rem',
              fontWeight: '800',
              fontSize: '0.9rem',
              border: 'none',
              boxShadow: '0 4px 10px rgba(29, 78, 216, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {exporting === 'word' ? 'Generating Word...' : '📝 Download Word (DOCX)'}
          </button>

          {/* CSV button */}
          <button
            type="button"
            onClick={() => handleExport('csv')}
            disabled={exporting !== null}
            className="btn-submit"
            style={{
              background: 'linear-gradient(135deg, #10b981, #047857)',
              color: '#ffffff',
              padding: '0.8rem 1.6rem',
              fontWeight: '800',
              fontSize: '0.9rem',
              border: 'none',
              boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {exporting === 'csv' ? 'Generating CSV...' : '📊 Download CSV File'}
          </button>
        </div>
      </section>

      {/* Grid of stats */}
      <section className="chart-grid" style={{ marginBottom: '2.5rem' }}>
        
        {/* Users Card */}
        <div className="chart-card stat-card" style={{ borderTop: '4px solid var(--primary-color)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            👥 User Standings
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: '850', color: 'var(--text-primary)' }}>
              {stats?.totalUsers || 0} <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-light)' }}>Total Registered</span>
            </span>
          </div>
          <span style={{ fontSize: '0.82rem', color: 'var(--primary-color)', fontWeight: '750', marginTop: '0.5rem', display: 'block' }}>
            ⚡ {stats?.activeUsers || 0} active user accounts auditing
          </span>
        </div>

        {/* Carbon Card */}
        <div className="chart-card stat-card" style={{ borderTop: '4px solid #8b5cf6' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🌲 Carbon Audited
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: '850', color: 'var(--text-primary)' }}>
              {stats?.totalCo2?.toFixed(1) || '0.0'} <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-light)' }}>kg CO₂e</span>
            </span>
          </div>
          <span style={{ fontSize: '0.82rem', color: '#8b5cf6', fontWeight: '750', marginTop: '0.5rem', display: 'block' }}>
            📈 Average {stats?.averageCo2PerUser?.toFixed(1) || '0.0'} kg per user profile
          </span>
        </div>

        {/* Goals Card */}
        <div className="chart-card stat-card" style={{ borderTop: '4px solid #eab308' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            🎯 Reduction Goals
          </span>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '0.5rem' }}>
            <span style={{ fontSize: '2.2rem', fontWeight: '850', color: 'var(--text-primary)' }}>
              {stats?.goalsSuccessRate || 0}% <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-light)' }}>Success Rate</span>
            </span>
          </div>
          <span style={{ fontSize: '0.82rem', color: '#eab308', fontWeight: '750', marginTop: '0.5rem', display: 'block' }}>
            🏁 {stats?.completedGoals || 0} completed of {stats?.totalGoals || 0} set goals
          </span>
        </div>

      </section>

      {/* Category breakdown & Badges summary */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem' }}>
        
        {/* Category Breakdown Progress Bars */}
        <div className="chart-card">
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '850', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            📊 Category Emissions breakdown
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {Object.keys(breakdown).length > 0 ? (
              Object.entries(breakdown).map(([cat, val]) => {
                const pct = ((val / totalCategoryCo2) * 100).toFixed(0);
                return (
                  <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: '700' }}>
                      <span style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>
                        {cat === 'transport' ? '🚗 Transport' : cat === 'energy' ? '⚡ Energy' : cat}
                      </span>
                      <span style={{ color: 'var(--text-secondary)' }}>
                        {val.toFixed(1)} kg ({pct}%)
                      </span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: cat === 'transport' ? 'var(--primary-color)' : '#8b5cf6',
                          borderRadius: '99px'
                        }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ color: 'var(--text-light)', fontStyle: 'italic', margin: 0 }}>
                No category data logged yet.
              </p>
            )}
          </div>
        </div>

        {/* Badge Distribution Card */}
        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(234,179,8,0.1)', border: '2px dashed #eab308', display: 'flex', alignItems: 'center', justifyContents: 'center', fontSize: '2.5rem', marginBottom: '1.2rem' }}>
            <span style={{ display: 'block', margin: 'auto' }}>🏆</span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '850', color: 'var(--text-primary)' }}>
            {stats?.badgesAwarded || 0} Badges Awarded
          </h3>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '300px', lineHeight: '1.5' }}>
            Community users have unlocked achievements by actively logging green habits and lowering daily emissions!
          </p>
        </div>

      </section>
    </div>
  );
}
