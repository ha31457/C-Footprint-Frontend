import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EcoLogo from '../components/EcoLogo';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const responseMessage = await forgotPassword(email);
      setSuccess(responseMessage || 'Password reset OTP has been sent to your email.');
      setTimeout(() => {
        navigate(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset OTP. Please check the email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <form
        className="auth-form"
        onSubmit={handleSubmit}
        style={{
          maxWidth: '440px',
          width: '100%',
          padding: '2.5rem 3rem',
          background: 'var(--surface-color)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.2rem'
        }}
      >
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.5rem', textDecoration: 'none' }}>
          <EcoLogo size={36} />
          <span style={{ fontWeight: '850', fontSize: '1.5rem', color: 'var(--primary-color)' }}>EcoFootprint</span>
        </Link>

        <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: '800', margin: '0 0 0.2rem 0' }}>Forgot Password</h2>
        <p className="subtitle" style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '-0.5rem', marginBottom: '1rem', fontSize: '0.88rem', fontWeight: '600', lineHeight: '1.4' }}>
          Enter your email to receive a 6-digit password reset OTP
        </p>

        {error && (
          <div className="error-container">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-container">
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
          Email Address
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. jane@example.com"
            required
            style={{
              padding: '0.8rem 1rem',
              borderRadius: '12px',
              border: '1.5px solid var(--border-color)',
              background: 'var(--bg-color)',
              color: 'var(--text-primary)',
              outline: 'none',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}
          />
        </label>

        <button
          type="submit"
          disabled={submitting || !!success}
          style={{
            padding: '0.85rem',
            fontSize: '0.95rem',
            fontWeight: '800',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary-color), #34d399)',
            color: '#ffffff',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
            marginTop: '0.5rem'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 15px rgba(16, 185, 129, 0.3)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)'; }}
        >
          {submitting ? 'Sending OTP...' : 'Send Reset OTP'}
        </button>

        <div className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', alignItems: 'center', marginTop: '0.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
            Remember your password? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '750', textDecoration: 'none' }}>Log In</Link>
          </p>
          <Link to="/" style={{ fontSize: '0.85rem', fontWeight: '750', color: 'var(--text-light)', textDecoration: 'none' }}>
            ← Back to Landing Page
          </Link>
        </div>
      </form>
    </div>
  );
}
