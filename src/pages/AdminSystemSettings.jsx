import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

export default function AdminSystemSettings() {
  const { settings, updateSettingsState } = useAuth();
  const [formData, setFormData] = useState({
    google_signin_enabled: true,
    leaderboard_enabled: true,
    badges_enabled: true,
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Hydrate form from global state once loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        google_signin_enabled: settings.google_signin_enabled !== false,
        leaderboard_enabled: settings.leaderboard_enabled !== false,
        badges_enabled: settings.badges_enabled !== false,
      });
    }
  }, [settings]);

  const handleToggle = (key) => {
    setFormData((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const response = await apiClient.put('/admin/settings', formData);
      const updatedSettings = response.data;
      
      // Update global context state so sidebar links hide/show instantly
      updateSettingsState(updatedSettings);
      
      setSuccessMsg('System configuration settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error('[AdminSettings] Failed to save settings:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to update system configurations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard" style={{ maxWidth: '1000px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1>System Configuration Settings</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Toggle global platform functionalities and authentication options
          </p>
        </div>
      </header>

      {successMsg && (
        <div className="success-container" style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', padding: '1rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '12px', color: 'var(--primary-color)', fontWeight: '600' }}>
          <span>✅</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="error-container" style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', padding: '1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', color: 'var(--error-color)', fontWeight: '600' }}>
          <span>⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="chart-grid" style={{ gridTemplateColumns: '1fr', gap: '1.8rem' }}>
        
        {/* Toggle Cards Wrapper */}
        <div className="chart-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            Feature Access Toggles
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Google Sign In Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Google OAuth Authentication
                </h4>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Enable or disable the "Login with Google" button on the guest welcome screen.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('google_signin_enabled')}
                style={{
                  padding: '0.6rem 1.4rem',
                  borderRadius: '999px',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  border: 'none',
                  background: formData.google_signin_enabled ? 'var(--primary-color)' : 'rgba(0,0,0,0.1)',
                  color: formData.google_signin_enabled ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.25s ease'
                }}
              >
                {formData.google_signin_enabled ? '🟢 Enabled' : '🔴 Disabled'}
              </button>
            </div>

            {/* Leaderboard Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Community Leaderboard & Rankings
                </h4>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Control visibility of global carbon audit user standings and community stats pages.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('leaderboard_enabled')}
                style={{
                  padding: '0.6rem 1.4rem',
                  borderRadius: '999px',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  border: 'none',
                  background: formData.leaderboard_enabled ? 'var(--primary-color)' : 'rgba(0,0,0,0.1)',
                  color: formData.leaderboard_enabled ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.25s ease'
                }}
              >
                {formData.leaderboard_enabled ? '🟢 Enabled' : '🔴 Disabled'}
              </button>
            </div>

            {/* Badges Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                  User Achievements & Badges
                </h4>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  Enable badges tracking, goals milestone logs, and achievements lists.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleToggle('badges_enabled')}
                style={{
                  padding: '0.6rem 1.4rem',
                  borderRadius: '999px',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  border: 'none',
                  background: formData.badges_enabled ? 'var(--primary-color)' : 'rgba(0,0,0,0.1)',
                  color: formData.badges_enabled ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.25s ease'
                }}
              >
                {formData.badges_enabled ? '🟢 Enabled' : '🔴 Disabled'}
              </button>
            </div>

          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <button
            type="submit"
            disabled={loading}
            className="btn-submit"
            style={{
              padding: '0.85rem 2.2rem',
              fontWeight: '850',
              fontSize: '0.95rem',
            }}
          >
            {loading ? 'Saving Changes...' : 'Save Configuration'}
          </button>
        </div>

      </form>
    </div>
  );
}
