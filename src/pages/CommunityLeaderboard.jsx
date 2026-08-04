import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import { getAvatarUrl } from '../constants/avatars';

export default function CommunityLeaderboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get('/leaderboard');
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch community leaderboard metrics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="loading-screen">Loading Leaderboard rankings...</div>;

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

  const entries = Array.isArray(data)
    ? data
    : (data?.entries || data?.leaderboard || data?.rankings || data?.users || data?.leaderboardEntries || []);

  // Helper to ensure Initial-Face avatar is dynamically generated from username
  const resolveAvatar = (entry) => getAvatarUrl(entry?.avatarUrl, entry?.avatar, entry?.gender, entry?.username);

  // Extract Top 3 for the Podium
  const rank1 = entries.find((e) => e.rank === 1) || entries[0] || null;
  const rank2 = entries.find((e) => e.rank === 2) || (entries.length > 1 && entries[1] !== rank1 ? entries[1] : null);
  const rank3 = entries.find((e) => e.rank === 3) || (entries.length > 2 && entries[2] !== rank1 && entries[2] !== rank2 ? entries[2] : null);

  const top3Set = new Set([rank1, rank2, rank3].filter(Boolean));
  const restEntries = entries.filter((e) => !top3Set.has(e));

  const averageEmission = data?.averageEmission ?? null;
  const currentUserPercentile = data?.currentUserPercentile ?? null;

  return (
    <div className="dashboard" style={{ maxWidth: '1280px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1>Community Sustainability Leaderboard</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Real-time carbon auditing standings across our eco community
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
            <span>Rankings are calculated based on your logged activities plus an estimated baseline of 15.0 kg CO₂ for days without activity logging. Daily logs help lower your baseline footprint!</span>
          </div>
        </div>
      </header>

      {/* Community Averages & Standing Percentile */}
      {(averageEmission !== null || currentUserPercentile !== null) && (
        <section style={{ display: 'flex', gap: '1.5rem', marginBottom: '2.5rem', flexWrap: 'wrap' }}>
          {averageEmission !== null && (
            <div className="chart-card stat-card" style={{ flex: 1, minWidth: '240px', padding: '1.4rem 1.8rem', borderTop: '4px solid #8b5cf6', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, var(--surface-color) 75%)' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                👥 Community Average
              </span>
              <span style={{ fontSize: '2rem', fontWeight: '850', color: '#8b5cf6', marginTop: '0.3rem', display: 'block' }}>
                {averageEmission.toFixed(1)} <small style={{ fontSize: '0.95rem' }}>kg CO₂e</small>
              </span>
            </div>
          )}

          {currentUserPercentile !== null && (
            <div className="chart-card stat-card" style={{ flex: 1, minWidth: '240px', padding: '1.4rem 1.8rem', borderTop: '4px solid #f43f5e', background: 'linear-gradient(135deg, rgba(244, 63, 94, 0.08) 0%, var(--surface-color) 75%)' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🏆 Your Standing
              </span>
              <span style={{ fontSize: '2rem', fontWeight: '850', color: '#f43f5e', marginTop: '0.3rem', display: 'block' }}>
                Top {currentUserPercentile.toFixed(0)}%
              </span>
            </div>
          )}
        </section>
      )}

      {entries.length > 0 ? (
        <div>
          
          {/* Top 3 Podium Section */}
          <div className="leaderboard-podium-container">
            
            {/* Rank 2 - Silver Flank (Left) */}
            {rank2 && (
              <div className="podium-card podium-card-2nd">
                <div className="podium-crown-badge">🥈</div>
                <div className="podium-avatar-ring">
                  <img
                    src={resolveAvatar(rank2)}
                    alt={rank2.username}
                    className="podium-avatar-img"
                  />
                </div>
                <div className="podium-username" title={rank2.username}>
                  {rank2.username} {rank2.isCurrentUser && <small style={{ color: 'var(--primary-color)' }}>(You)</small>}
                </div>
                <div className="podium-score" style={{ color: 'var(--accent-color)' }}>
                  🌱 {(rank2.totalCo2Emission ?? 0).toFixed(1)} <small style={{ fontSize: '0.75rem' }}>kg</small>
                </div>
              </div>
            )}

            {/* Rank 1 - Gold Center Podium (Elevated) */}
            {rank1 && (
              <div className="podium-card podium-card-1st">
                <div className="podium-crown-badge">👑</div>
                <div className="podium-avatar-ring">
                  <img
                    src={resolveAvatar(rank1)}
                    alt={rank1.username}
                    className="podium-avatar-img"
                  />
                </div>
                <div className="podium-username" style={{ fontSize: '1.15rem' }} title={rank1.username}>
                  {rank1.username} {rank1.isCurrentUser && <small style={{ color: 'var(--primary-color)' }}>(You)</small>}
                </div>
                <div className="podium-score" style={{ color: '#d97706', fontSize: '1.25rem' }}>
                  🌱 {(rank1.totalCo2Emission ?? 0).toFixed(1)} <small style={{ fontSize: '0.8rem' }}>kg</small>
                </div>
              </div>
            )}

            {/* Rank 3 - Bronze Flank (Right) */}
            {rank3 && (
              <div className="podium-card podium-card-3rd">
                <div className="podium-crown-badge">🥉</div>
                <div className="podium-avatar-ring">
                  <img
                    src={resolveAvatar(rank3)}
                    alt={rank3.username}
                    className="podium-avatar-img"
                  />
                </div>
                <div className="podium-username" title={rank3.username}>
                  {rank3.username} {rank3.isCurrentUser && <small style={{ color: 'var(--primary-color)' }}>(You)</small>}
                </div>
                <div className="podium-score" style={{ color: '#d97706' }}>
                  🌱 {(rank3.totalCo2Emission ?? 0).toFixed(1)} <small style={{ fontSize: '0.75rem' }}>kg</small>
                </div>
              </div>
            )}

          </div>

          {/* Ranked List Section (Ranks 4+) */}
          {restEntries.length > 0 && (
            <div className="leaderboard-list-card">
              <div style={{ padding: '0.4rem 0.6rem 0.6rem 0.6rem', fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Community Rankings
              </div>

              {restEntries.map((entry) => {
                const isCurrent = entry.isCurrentUser;
                return (
                  <div
                    key={entry.userId || entry.username}
                    className={`leaderboard-list-row ${isCurrent ? 'leaderboard-list-row-current' : ''}`}
                  >
                    {/* User Info & Avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={resolveAvatar(entry)}
                        alt={entry.username}
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          border: '1.5px solid var(--border-color)',
                          background: 'var(--primary-light)',
                          objectFit: 'cover'
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: '800', color: isCurrent ? 'var(--primary-color)' : 'var(--text-primary)', fontSize: '0.98rem' }}>
                          {entry.username} {isCurrent && <span style={{ fontSize: '0.72rem', fontWeight: '850', background: 'var(--primary-color)', color: 'white', padding: '0.15rem 0.45rem', borderRadius: '4px', marginLeft: '0.4rem' }}>YOU</span>}
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: '750', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                          🌱 {(entry.totalCo2Emission ?? 0).toFixed(1)} kg CO₂e
                        </div>
                      </div>
                    </div>

                    {/* Rank Badge Ring */}
                    <div className="leaderboard-rank-ring">
                      #{entry.rank}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      ) : (
        <div className="chart-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-light)' }}>
          <p style={{ margin: 0, fontStyle: 'italic' }}>No community carbon records published yet.</p>
        </div>
      )}
    </div>
  );
}
