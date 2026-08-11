import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export default function OrgAdminLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/org-admin/leaderboard');
      const list = Array.isArray(response.data)
        ? response.data
        : (response.data?.entries || response.data?.rankings || []);
      setLeaderboard(list);
    } catch (err) {
      console.error('[OrgAdminLeaderboard] Standings fetch failed:', err);
      setError('Failed to retrieve corporate standings rankings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="dashboard" style={{ maxWidth: '1280px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1>Corporate Standings</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Milestones and rank scoreboards comparing employee carbon reductions inside your organization
          </p>
        </div>
      </header>

      <div className="chart-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', marginBottom: '1.5rem' }}>
          🏆 Organization Leaderboard
        </h3>

        {error && (
          <div className="error-container" style={{ marginBottom: '1rem' }}>
            <span>⚠️</span> <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div>Loading standings scorecard...</div>
        ) : leaderboard.length === 0 ? (
          <p style={{ color: 'var(--text-light)', fontStyle: 'italic', margin: 0 }}>No standings recorded inside this organization.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.8rem', width: '80px' }}>Rank</th>
                  <th style={{ padding: '0.8rem' }}>Employee</th>
                  <th style={{ padding: '0.8rem', textAlign: 'right' }}>Total CO₂ Reduced</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((item, index) => {
                  const rankNum = item.rank || index + 1;
                  return (
                    <tr key={item.username || index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.8rem' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: rankNum === 1 ? 'rgba(234,179,8,0.1)' : rankNum === 2 ? 'rgba(156,163,175,0.1)' : 'rgba(0,0,0,0.05)',
                            color: rankNum === 1 ? '#eab308' : rankNum === 2 ? '#6b7280' : 'var(--text-secondary)',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '850',
                            fontSize: '0.8rem'
                          }}
                        >
                          {rankNum === 1 ? '👑' : rankNum}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem', fontWeight: '750' }}>{item.username}</td>
                      <td style={{ padding: '0.8rem', textAlign: 'right', fontWeight: '850', color: 'var(--primary-color)' }}>
                        🌱 {item.totalCo2Emission?.toFixed(1) || item.totalCo2?.toFixed(1) || '0.0'} kg
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
