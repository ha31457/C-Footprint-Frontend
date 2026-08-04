import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

export default function AdminBadgeManagement() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Form Fields (For Create/Edit Modal)
  const [showModal, setShowModal] = useState(false);
  const [editingBadge, setEditingBadge] = useState(null); // If null, we are creating
  const [badgeType, setBadgeType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [ruleType, setRuleType] = useState('LOG_COUNT');
  const [ruleValue, setRuleValue] = useState(0);

  // Delete Confirmation
  const [deletingBadgeId, setDeletingBadgeId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchBadges = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/badges');
      setBadges(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve badge definitions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const openCreateModal = () => {
    setEditingBadge(null);
    setBadgeType('');
    setTitle('');
    setDescription('');
    setIconName('');
    setIconUrl('https://api.dicebear.com/7.x/identicon/svg?seed=new-badge');
    setRuleType('LOG_COUNT');
    setRuleValue(10);
    setFormSuccess('');
    setShowModal(true);
  };

  const openEditModal = (badge) => {
    setEditingBadge(badge);
    // Since badgeType might be inside badge.badgeType or id, let's prefill
    setBadgeType(badge.badgeType || '');
    setTitle(badge.title || '');
    setDescription(badge.description || '');
    setIconName(badge.iconName || '');
    setIconUrl(badge.iconUrl || '');
    setRuleType(badge.ruleType || 'LOG_COUNT');
    setRuleValue(badge.ruleValue ?? 0);
    setFormSuccess('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormSuccess('');

    const payload = {
      badgeType,
      title,
      description,
      iconName,
      iconUrl,
      ruleType,
      ruleValue: parseFloat(ruleValue)
    };

    try {
      if (editingBadge) {
        // Edit Badge (If backend endpoint matches /api/admin/badges/{id} or /api/admin/badges/{badgeType})
        // Usually badgeType is unique, let's use editingBadge.id or editingBadge.badgeType
        const identifier = editingBadge.id || editingBadge.badgeType;
        await apiClient.put(`/admin/badges/${identifier}`, payload);
        setFormSuccess('Badge definition successfully updated!');
      } else {
        // Create Badge
        await apiClient.post('/admin/badges', payload);
        setFormSuccess('New badge definition created successfully!');
      }
      setTimeout(() => {
        setShowModal(false);
        fetchBadges();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit badge definition details.');
    }
  };

  const handleDelete = async () => {
    setError('');
    try {
      await apiClient.delete(`/admin/badges/${deletingBadgeId}`);
      setShowDeleteModal(false);
      fetchBadges();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete badge definition.');
    }
  };

  if (loading) return <div className="loading-screen">Loading badge definitions...</div>;

  return (
    <div className="dashboard" style={{ maxWidth: '1350px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Badge definitions Management</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>Configure rules, labels, and assets for user achievements</p>
        </div>
        <button className="btn-submit" onClick={openCreateModal}>
          ➕ Create New Badge
        </button>
      </header>

      {error && (
        <div className="error-container" style={{ marginBottom: '2rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Grid of defined badges */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {badges.map((badge) => (
          <div
            key={badge.id || badge.badgeType}
            className="chart-card"
            style={{
              padding: '2rem 1.6rem',
              display: 'flex',
              flexDirection: 'column',
              borderTop: '4px solid var(--primary-color)',
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center', marginBottom: '1.2rem' }}>
              <img
                src={badge.iconUrl || 'https://api.dicebear.com/7.x/identicon/svg'}
                alt={badge.title}
                style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--border-color)', padding: '4px' }}
              />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '850' }}>{badge.title}</h3>
                <span style={{ fontSize: '0.75rem', background: 'var(--primary-light)', color: 'var(--primary-color)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: '750', marginTop: '0.3rem', display: 'inline-block' }}>
                  {badge.badgeType}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.45', flex: 1, margin: '0 0 1.2rem 0' }}>
              {badge.description}
            </p>

            <div style={{ background: 'var(--bg-color)', padding: '0.9rem 1.2rem', borderRadius: '12px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
              <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-light)', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>
                Trigger condition
              </span>
              <strong style={{ fontSize: '0.92rem', color: 'var(--primary-color)' }}>
                {badge.ruleType} &gt;= {badge.ruleValue}
              </strong>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem' }}>
              <button
                onClick={() => openEditModal(badge)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1.5px solid var(--primary-color)',
                  color: 'var(--primary-color)',
                  padding: '0.55rem',
                  borderRadius: '10px',
                  fontWeight: '750',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                ✏️ Edit definitions
              </button>
              <button
                onClick={() => {
                  setDeletingBadgeId(badge.id || badge.badgeType);
                  setShowDeleteModal(true);
                }}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: '1.5px solid var(--error-color)',
                  color: 'var(--error-color)',
                  padding: '0.55rem',
                  borderRadius: '10px',
                  fontWeight: '750',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                🗑️ Delete definition
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="modal-content" style={{ maxWidth: '520px', width: '90%' }}>
            <h2>{editingBadge ? 'Edit Badge Definition' : 'Create Badge Definition'}</h2>
            
            {formSuccess && (
              <div style={{ padding: '0.8rem 1rem', background: 'var(--primary-light)', color: 'var(--primary-color)', borderRadius: '10px', marginBottom: '1.2rem', fontWeight: '750', fontSize: '0.88rem' }}>
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '750', fontSize: '0.88rem', marginBottom: '0.4rem' }}>Badge Type Seed</label>
                <input
                  type="text"
                  placeholder="e.g. TEN_LOGS"
                  value={badgeType}
                  onChange={(e) => setBadgeType(e.target.value.toUpperCase())}
                  disabled={!!editingBadge}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '750', fontSize: '0.88rem', marginBottom: '0.4rem' }}>Badge Title</label>
                <input
                  type="text"
                  placeholder="e.g. Elite Logger"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '750', fontSize: '0.88rem', marginBottom: '0.4rem' }}>Description</label>
                <textarea
                  placeholder="Explain how users earn this badge definition..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '750', fontSize: '0.88rem', marginBottom: '0.4rem' }}>Rule Trigger Type</label>
                  <select
                    value={ruleType}
                    onChange={(e) => setRuleType(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontWeight: '750' }}
                  >
                    <option value="LOG_COUNT">LOG_COUNT</option>
                    <option value="GOAL_COUNT">GOAL_COUNT</option>
                    <option value="CO2_REDUCTION">CO2_REDUCTION</option>
                    <option value="LEADERBOARD_RANK">LEADERBOARD_RANK</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '750', fontSize: '0.88rem', marginBottom: '0.4rem' }}>Trigger Minimum</label>
                  <input
                    type="number"
                    step="any"
                    value={ruleValue}
                    onChange={(e) => setRuleValue(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontWeight: '750', fontSize: '0.88rem', marginBottom: '0.4rem' }}>Dicebear / Icon URL</label>
                <input
                  type="text"
                  placeholder="https://api.dicebear.com/7.x/identicon/svg..."
                  value={iconUrl}
                  onChange={(e) => setIconUrl(e.target.value)}
                  required
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn-modal-cancel" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-modal-confirm" style={{ flex: 1 }}>
                  {editingBadge ? 'Save changes' : 'Create definitions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>⚠️</span>
            <h2>Delete Badge Definition?</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.45', margin: '0.5rem 0 1.5rem 0' }}>
              Are you sure? This action is permanent and will cascade to automatically delete all unlocked user badges of this type definition.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-modal-cancel" style={{ flex: 1 }} onClick={() => setShowDeleteModal(false)}>
                No, cancel
              </button>
              <button
                className="btn-modal-confirm"
                style={{ flex: 1, background: 'var(--error-color)', border: 'none', color: 'white' }}
                onClick={handleDelete}
              >
                Yes, delete definition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
