import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Theme Toggler for Guest View
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  };

  // Sync theme class on mount
  useEffect(() => {
    const saved = localStorage.getItem('theme') || 'light';
    if (saved === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, []);

  const [form, setForm] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    try {
      const userObj = await loginWithGoogle(credentialResponse.credential);
      if (userObj.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google Sign-In Failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const userData = await login(form.usernameOrEmail, form.password);
      if (userData?.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Invalid username or password';
      const status = err.response?.status;

      if (status === 401 && msg.toLowerCase().includes('not been verified yet')) {
        setError(msg);
        const emailPrefill = form.usernameOrEmail.includes('@') ? form.usernameOrEmail : '';
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(emailPrefill)}`);
        }, 2000);
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-split-container login-mode" style={{ minHeight: '100vh' }}>

      {/* Form Half - Left */}
      <div className="auth-split-form-half" style={{ padding: '2rem 1.5rem' }}>
        <div className="auth-form" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem 3rem' }}>
          
          {/* Logo Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.8rem' }}>🌱</span>
            <span style={{ fontWeight: '850', fontSize: '1.4rem', color: 'var(--primary-color)' }}>EcoFootprint</span>
          </div>

          <h2>Welcome Back</h2>
          <p className="subtitle" style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '-0.8rem', marginBottom: '1.2rem', fontSize: '0.85rem' }}>
            Sign in to access your dashboard
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {error && (
              <div className="error-container">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <label>
              Username or Email
              <input
                type="text"
                name="usernameOrEmail"
                value={form.usernameOrEmail}
                onChange={handleChange}
                placeholder="Enter username or email"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </label>

            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Google Sign-In Option */}
            <div style={{ margin: '1.2rem 0', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', margin: '0.8rem 0' }}>
                <div style={{ flex: 1, borderBottom: '1px solid var(--border-color)' }} />
                <span style={{ padding: '0 0.8rem', fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: '700' }}>OR</span>
                <div style={{ flex: 1, borderBottom: '1px solid var(--border-color)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '0.8rem' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Sign-In Failed')}
                  shape="pill"
                  theme="outline"
                />
              </div>
            </div>

            <p className="auth-footer-text">
              New to EcoFootprint?{' '}
              <Link to="/signup" style={{ color: 'var(--primary-color)', fontWeight: '800', textDecoration: 'none' }}>
                Sign Up
              </Link>
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.2rem' }}>
              <Link to="/forgot-password" style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-light)', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>
          </form>

        </div>
      </div>

      {/* Info Half - Right */}
      <div className="auth-split-info-half">
        <div className="auth-split-info-content">
          <h2>Empowering Global Climate Action</h2>
          <p>
            EcoFootprint is a secure, real-time auditing and activity intelligence platform designed to track daily greenhouse emissions, establish sustainability milestones, and earn green badges.
          </p>

          <div className="auth-split-info-features">
            <div className="auth-split-info-feature-item">
              <span className="icon">🌱</span>
              <div>
                <h4>Carbon Audit Logs</h4>
                <p>Record carbon footprints across transportation, diet, and shopping with automatic GHG protocol conversions.</p>
              </div>
            </div>

            <div className="auth-split-info-feature-item">
              <span className="icon">📊</span>
              <div>
                <h4>Progress Dashboards</h4>
                <p>Monitor weekly, monthly, and yearly trends via interactive charts and comparative timelines.</p>
              </div>
            </div>

            <div className="auth-split-info-feature-item">
              <span className="icon">🏅</span>
              <div>
                <h4>Gamified Milestones</h4>
                <p>Unlock certified badges and climb community leaderboards by saving ecological impacts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}