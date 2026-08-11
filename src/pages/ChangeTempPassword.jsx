import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import EcoLogo from '../components/EcoLogo';

export default function ChangeTempPassword() {
  const { updateUser } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/change-temp-password', {
        newPassword
      });
      
      setSuccess(true);
      
      // Update global context status (user.isTempPassword becomes false)
      setTimeout(() => {
        updateUser(response.data);
      }, 1500);

    } catch (err) {
      console.error('[ChangeTempPassword] Failed to set password:', err);
      setError(err.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <form
        className="auth-form"
        onSubmit={handleSubmit}
        style={{
          maxWidth: '420px',
          width: '100%',
          padding: '2.5rem 3rem',
          background: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-xl)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem',
          margin: 'auto'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '0.8rem' }}>
          <EcoLogo size={42} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '1rem', textAlign: 'center', letterSpacing: '-0.02em' }}>
            Set New Password
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', textAlign: 'center', marginTop: '0.3rem', fontWeight: '600', lineHeight: '1.4' }}>
            Your account was provisioned with a temporary password. You must configure a new password to proceed.
          </p>
        </div>

        {error && (
          <div className="error-container" style={{ padding: '0.8rem', borderRadius: '10px' }}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="success-container" style={{ padding: '1rem', borderRadius: '10px', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span>✅</span>
            <span>Password successfully updated! Loading dashboard...</span>
          </div>
        ) : (
          <>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              New Password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                style={{
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--bg-color)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Confirm Password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Retype new password"
                required
                style={{
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--bg-color)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
              style={{
                padding: '0.8rem',
                fontSize: '0.92rem',
                fontWeight: '800',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--primary-color), #34d399)',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                marginTop: '0.5rem'
              }}
            >
              {loading ? 'Updating Password...' : 'Save & Continue'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
