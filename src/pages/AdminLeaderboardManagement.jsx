import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { getAvatarUrl } from '../constants/avatars';

export default function AdminLeaderboardManagement() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDiagnosticLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/leaderboard');
      setLeaderboard(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve diagnostic leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnosticLeaderboard();
  }, []);

  const resolveAvatar = (entry) => getAvatarUrl(entry?.avatarUrl, entry?.avatar, entry?.gender, entry?.username);

  const filteredLeaderboard = leaderboard.filter((entry) => {
    const term = searchQuery.toLowerCase();
    return (
      (entry.username && entry.username.toLowerCase().includes(term)) ||
      (entry.email && entry.email.toLowerCase().includes(term))
    );
  });

  if (loading) return <div className="loading-screen">Loading leaderboard diagnostics...</div>;

  return (
    <div className="dashboard" style={{ maxWidth: '1350px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1>Diagnostic Leaderboard Admin</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            System-level audit and metrics analysis of community carbon emissions
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 1rem',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.15)',
            borderRadius: '10px',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            marginTop: '0.8rem',
            lineHeight: '1.4'
          }}>
            <span>💡</span>
            <span>Total CO₂ emissions reflect effective carbon footprint (actual logged emissions plus a 15.0 kg CO₂ baseline penalty for each unlogged day).</span>
          </div>
        </div>
      </header>

      {error && (
        <div className="error-container" style={{ marginBottom: '2rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Filter and stats row */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="🔍 Search user by username or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            minWidth: '280px',
            maxWidth: '450px',
            padding: '0.85rem 1.2rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            background: 'var(--surface-color)',
            color: 'var(--text-primary)',
            fontSize: '0.92rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        />
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '750' }}>
          Showing {filteredLeaderboard.length} of {leaderboard.length} registered members
        </div>
      </section>

      {/* Leaderboard Diagnostic Auditing Table */}
      <div className="chart-card" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table className="history-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '1.2rem 1rem' }}>Rank</th>
              <th style={{ padding: '1.2rem 1rem' }}>User details</th>
              <th style={{ padding: '1.2rem 1rem' }}>Email address</th>
              <th style={{ padding: '1.2rem 1rem' }}>Status</th>
              <th style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>Total Logs</th>
              <th style={{ padding: '1.2rem 1rem', textAlign: 'right' }}>Total CO₂ Emissions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaderboard.map((entry) => (
              <tr key={entry.userId || entry.username} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s ease' }} className="diagnostic-table-row">
                <td style={{ padding: '1.1rem 1rem' }}>
                  <span
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '850',
                      fontSize: '0.85rem',
                      background: entry.rank === 1 ? 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)' : entry.rank === 2 ? 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)' : entry.rank === 3 ? 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' : 'var(--bg-color)',
                      color: entry.rank <= 3 ? '#ffffff' : 'var(--text-secondary)',
                      boxShadow: entry.rank <= 3 ? '0 4px 10px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    {entry.rank}
                  </span>
                </td>
                <td style={{ padding: '1.1rem 1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img
                      src={resolveAvatar(entry)}
                      alt={entry.username}
                      style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--border-color)', border: '1.5px solid var(--border-color)' }}
                    />
                    <strong style={{ fontSize: '0.95rem' }}>{entry.username}</strong>
                  </div>
                </td>
                <td style={{ padding: '1.1rem 1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{entry.email}</td>
                <td style={{ padding: '1.1rem 1rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '999px',
                      fontWeight: '800',
                      background: entry.enabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: entry.enabled ? '#10b981' : '#ef4444'
                    }}
                  >
                    {entry.enabled ? 'Active Account' : 'Suspended'}
                  </span>
                </td>
                <td style={{ padding: '1.1rem 1rem', textAlign: 'right', fontWeight: '800', color: 'var(--primary-color)' }}>
                  {entry.totalLogsCount ?? 0}
                </td>
                <td style={{ padding: '1.1rem 1rem', textAlign: 'right', fontWeight: '850', color: '#f43f5e' }}>
                  {(entry.totalCo2Emission ?? 0).toFixed(2)} kg CO₂e
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
