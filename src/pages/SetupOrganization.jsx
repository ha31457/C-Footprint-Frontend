import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import EcoLogo from '../components/EcoLogo';

export default function SetupOrganization() {
  const { updateUser } = useAuth();
  const [form, setForm] = useState({
    organizationName: '',
    industry: '',
    address: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.organizationName.trim() || !form.industry.trim() || !form.address.trim()) {
      setError('All fields except description are required.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/org-admin/setup-organization', {
        organizationName: form.organizationName,
        industry: form.industry,
        address: form.address,
        description: form.description
      });

      setSuccess(true);
      
      // Update global context state (user.organizationName becomes the non-null set value)
      setTimeout(() => {
        updateUser(response.data);
      }, 1500);

    } catch (err) {
      console.error('[SetupOrg] Failed to set organization setup details:', err);
      setError(err.response?.data?.message || 'Failed to register organization details. Please try again.');
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
          maxWidth: '480px',
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
            Setup Corporate Profile
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', textAlign: 'center', marginTop: '0.3rem', fontWeight: '600', lineHeight: '1.4' }}>
            Configure organization details to activate employee onboarding and carbon analytics features.
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
            <span>Organization setup completed! Loading dashboard...</span>
          </div>
        ) : (
          <>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Organization Name
              <input
                type="text"
                name="organizationName"
                value={form.organizationName}
                onChange={handleChange}
                placeholder="e.g. Eco Corp Ltd"
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
              Industry
              <select
                name="industry"
                value={form.industry}
                onChange={handleChange}
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
              >
                <option value="">-- Select Industry --</option>
                <option value="Technology">Technology</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Energy">Energy</option>
                <option value="Services">Services</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Company Address
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="e.g. 123 Green Way, Eco City"
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
              Description (Optional)
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                placeholder="e.g. Committed to lowering corporate software footprint indices."
                style={{
                  padding: '0.7rem 0.9rem',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color)',
                  background: 'var(--bg-color)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.82rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
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
              {loading ? 'Completing Setup...' : 'Save & Enter Dashboard'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
