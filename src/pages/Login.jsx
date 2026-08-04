import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import EcoLogo from '../components/EcoLogo';

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
    <div className="auth-page-wrapper">
      <div className="auth-card">
        {/* Form Panel - Left */}
        <div className="auth-form-side">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem', textDecoration: 'none' }}>
            <EcoLogo size={36} />
            <span style={{ fontWeight: '850', fontSize: '1.5rem', color: 'var(--primary-color)' }}>EcoFootprint</span>
          </Link>

          <h2 style={{ textAlign: 'center', fontSize: '1.8rem', fontWeight: '800', margin: '0 0 0.5rem 0' }}>Welcome Back</h2>
          <p className="subtitle" style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '2rem', fontSize: '0.88rem', fontWeight: '600' }}>
            Sign in to access your dashboard
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {error && (
              <div className="error-container" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
                {error.toLowerCase().includes('disabled') && (
                  <div style={{ fontSize: '0.8rem', marginTop: '0.1rem', color: '#b91c1c' }}>
                    Please <Link to="/support" style={{ color: '#b91c1c', textDecoration: 'underline', fontWeight: '700' }}>contact support</Link> for assistance.
                  </div>
                )}
              </div>
            )}

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Username or Email
              <input
                type="text"
                name="usernameOrEmail"
                value={form.usernameOrEmail}
                onChange={handleChange}
                placeholder="Enter username or email"
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

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
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

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600' }}>
                <input type="checkbox" style={{ accentColor: 'var(--primary-color)' }} />
                Remember me
              </label>
              <Link to="/forgot-password" style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--primary-color)', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              className="btn-submit"
              disabled={submitting}
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
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>

            {/* Google Sign-In Option */}
            <div style={{ margin: '0.5rem 0 0 0', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', margin: '0.8rem 0' }}>
                <div style={{ flex: 1, borderBottom: '1px solid var(--border-color)' }} />
                <span style={{ padding: '0 0.8rem', fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: '800' }}>OR LOGIN WITH</span>
                <div style={{ flex: 1, borderBottom: '1px solid var(--border-color)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '0.5rem' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Sign-In Failed')}
                  shape="pill"
                  theme="outline"
                />
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '1.2rem', fontWeight: '600' }}>
              New to EcoFootprint?{' '}
              <Link to="/signup" style={{ color: 'var(--primary-color)', fontWeight: '800', textDecoration: 'none' }}>
                Create Account
              </Link>
            </p>
          </form>
        </div>

        {/* Illustration Panel - Right */}
        <div className="auth-info-side">
          <div className="auth-info-content">
            <svg viewBox="0 0 400 400" width="100%" height="260" style={{ marginBottom: '1.5rem' }}>
              {/* Soft Clouds */}
              <path d="M 50,150 Q 70,120 100,130 Q 130,110 160,130 Q 180,120 200,150 Z" fill="rgba(255,255,255,0.12)" />
              <path d="M 220,100 Q 240,75 270,85 Q 300,65 330,85 Q 350,75 370,100 Z" fill="rgba(255,255,255,0.12)" />
              {/* Ground line */}
              <path d="M 20,350 Q 200,325 380,350 L 380,380 L 20,380 Z" fill="#2d6a4f" />
              {/* Tree Trunk */}
              <path d="M 185,340 L 200,180 L 215,340 Z" fill="#4a3728" />
              {/* Tree Canopy (Leaf shape from Image 1) */}
              <path d="M 200,80 Q 290,180 200,310 Q 110,180 200,80 Z" fill="#34d399" />
              <path d="M 200,100 Q 270,190 200,300 Q 130,190 200,100 Z" fill="#10b981" />
              {/* Branch veins */}
              <path d="M 200,160 L 200,300" stroke="#4a3728" strokeWidth="3" strokeLinecap="round" />
              <path d="M 200,200 L 230,170" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 200,230 L 170,200" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 200,260 L 225,235" stroke="#4a3728" strokeWidth="2.5" strokeLinecap="round" />
              {/* Birds */}
              <path d="M 100,80 Q 110,70 120,80 Q 130,70 140,80" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
              <path d="M 270,60 Q 277,52 285,60 Q 292,52 300,60" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            
            <h2>Empowering Global Climate Action</h2>
            <p>
              EcoFootprint tracks daily greenhouse emissions, establishes sustainability milestones, and lets you earn certified green achievements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}