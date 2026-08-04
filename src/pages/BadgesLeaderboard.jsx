import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

export default function BadgesLeaderboard() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBadges = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/badges');
      setBadges(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch badges.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  if (loading) return <div className="loading-screen">Loading your achievements...</div>;

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

  const unlockedCount = badges.filter((b) => !b.locked).length;
  const totalCount = badges.length;
  const progressPct = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  // Custom visual assets for each badge type matching the Amethyst theme
  const badgeMeta = {
    FIRST_LOG: { emoji: '🌱', color: '#10b981', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
    DIVERSE_LOGS: { emoji: '🧩', color: '#06b6d4', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' },
    THREE_GOALS: { emoji: '🎯', color: '#fbbf24', gradient: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)' },
    GOAL_ACHIEVED: { emoji: '🏆', color: '#f59e0b', gradient: 'linear-gradient(135deg, #f59e0b 0%, #b45309 100%)' },
    CARBON_CUTTER_50: { emoji: '⚡', color: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' },
    LEADERBOARD_TOP_3: { emoji: '👑', color: '#f43f5e', gradient: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)' }
  };

  return (
    <div className="dashboard" style={{ maxWidth: '1000px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1>Badges & Achievements</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Earn unique badges by completing green activities, achieving goals, and leading the leaderboard
          </p>
        </div>
      </header>

      {/* Progress Highlights */}
      <section
        className="chart-card stat-card"
        style={{
          padding: '2rem',
          marginBottom: '2.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '2.5rem',
          flexWrap: 'wrap',
          borderTop: '4px solid var(--primary-color)'
        }}
      >
        <div style={{ flex: '1', minWidth: '250px' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Your Achievement Status</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            You have unlocked <strong>{unlockedCount}</strong> out of <strong>{totalCount}</strong> badges. Keep logging activities and reduction targets to earn them all!
          </p>
        </div>

        {/* Progress Tracker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', minWidth: '220px' }}>
          <div style={{ fontSize: '2.8rem', fontWeight: '850', color: 'var(--primary-color)' }}>
            {progressPct.toFixed(0)}%
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '750', marginBottom: '0.35rem' }}>
              <span>Unlocked Badges</span>
              <span>{unlockedCount} / {totalCount}</span>
            </div>
            <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progressPct}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #8b5cf6 0%, #a855f7 100%)',
                  borderRadius: '999px',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Badges Grid */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        {badges.map((badge) => {
          const meta = badgeMeta[badge.badgeType] || { emoji: '🏅', color: 'var(--primary-color)', gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)' };
          const dateEarned = badge.earnedDate ? new Date(badge.earnedDate).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : null;

          return (
            <div
              key={badge.badgeType}
              className={`chart-card ${badge.locked ? 'badge-card-locked' : 'badge-card-unlocked'}`}
              style={{
                padding: '2rem 1.6rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                borderTop: `4px solid ${badge.locked ? 'var(--border-color)' : meta.color}`
              }}
            >
              {/* Badge Icon / Emoji Wrapper */}
              <div
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  background: badge.locked ? 'var(--border-color)' : meta.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.8rem',
                  marginBottom: '1.2rem',
                  boxShadow: badge.locked ? 'none' : `0 10px 24px -6px ${meta.color}`,
                  filter: badge.locked ? 'grayscale(1) opacity(0.4)' : 'none',
                  transition: 'transform 0.3s ease',
                  position: 'relative'
                }}
                className="badge-icon-container"
              >
                {/* Fallback to emoji representation, or render dicebear icon if URL is active */}
                {meta.emoji}
                
                {/* Padlock Overlay for locked badges */}
                {badge.locked && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '-4px',
                      background: 'var(--surface-color)',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      boxShadow: 'var(--shadow-sm)',
                      border: '1.5px solid var(--border-color)'
                    }}
                  >
                    🔒
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <h3 style={{ fontSize: '1.15rem', fontWeight: '850', color: badge.locked ? 'var(--text-light)' : 'var(--text-primary)', marginBottom: '0.4rem' }}>
                {badge.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.45', flex: 1, margin: '0 0 1.2rem 0' }}>
                {badge.description}
              </p>

              {/* Earned Date / Status Badge */}
              <div>
                {!badge.locked ? (
                  <div
                    style={{
                      background: 'var(--primary-light)',
                      color: 'var(--primary-color)',
                      padding: '0.4rem 1rem',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <span>✨ Unlocked</span>
                    <span style={{ fontWeight: '500', opacity: 0.85 }}>• {dateEarned}</span>
                  </div>
                ) : (
                  <div
                    style={{
                      background: 'var(--border-color)',
                      color: 'var(--text-light)',
                      padding: '0.4rem 1rem',
                      borderRadius: '999px',
                      fontSize: '0.8rem',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    <span>Locked</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
