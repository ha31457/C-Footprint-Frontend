import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import CustomDropdown from '../components/CustomDropdown';
import EcoLogo from '../components/EcoLogo';

export default function Signup() {
  const { signup, loginWithGoogle } = useAuth();
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
    username: '',
    email: '',
    password: '',
    mobileNumber: '',
    age: '',
    gender: '',
  });
  const [isOrgAdmin, setIsOrgAdmin] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Simple validation for mobile number (10-15 digits, digits only, optional leading plus sign)
    const mobileRegex = /^\+?[0-9]{10,15}$/;
    if (!mobileRegex.test(form.mobileNumber)) {
      setError('Mobile number must be between 10 and 15 digits (e.g. +15551234567).');
      return;
    }

    const ageNum = parseInt(form.age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setError('Age must be a number between 1 and 120.');
      return;
    }

    if (!form.gender) {
      setError('Please select a gender.');
      return;
    }

    setSubmitting(true);
    try {
      await signup(
        form.username,
        form.email,
        form.password,
        form.mobileNumber,
        form.age,
        form.gender,
        isOrgAdmin
      );
      setSuccess(true);
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card signup-mode">
        
        {/* Illustration Panel - Left */}
        <div className="auth-info-side">
          <div className="auth-info-content">
            <svg viewBox="0 0 400 400" width="100%" height="260" style={{ marginBottom: '1.5rem' }}>
              {/* Rising Sun */}
              <circle cx="200" cy="180" r="100" fill="rgba(255,255,255,0.06)" />
              <circle cx="200" cy="180" r="70" fill="rgba(255,255,255,0.08)" />
              {/* Ground hills */}
              <path d="M -20,350 Q 120,310 260,340 Q 330,320 420,350 L 420,400 L -20,400 Z" fill="#1b4332" />
              <path d="M 120,350 Q 260,320 420,350 L 420,400 L 120,400 Z" fill="#2d6a4f" />
              {/* Sprout & Plants */}
              <path d="M 70,350 Q 80,310 100,300" stroke="#52b788" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M 100,300 Q 110,290 120,295 Q 110,310 100,300" fill="#52b788" />
              <path d="M 90,320 Q 75,310 80,325 Q 90,325 90,320" fill="#52b788" />
              
              {/* Stylized trees (Image 2 style) */}
              <path d="M 280,350 L 280,240" stroke="#4a3728" strokeWidth="4" strokeLinecap="round" />
              <circle cx="280" cy="220" r="35" fill="#52b788" />
              <circle cx="280" cy="220" r="28" fill="#74c69d" />
              <path d="M 280,185 L 280,250" stroke="#4a3728" strokeWidth="2.5" />
              <path d="M 280,220 L 295,205" stroke="#4a3728" strokeWidth="2" />
              <path d="M 280,235 L 265,220" stroke="#4a3728" strokeWidth="2" />

              <path d="M 330,350 L 330,260" stroke="#4a3728" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="330" cy="240" r="28" fill="#40916c" />
              <circle cx="330" cy="240" r="22" fill="#52b788" />
              <path d="M 330,212 L 330,265" stroke="#4a3728" strokeWidth="2" />

              {/* Recycling Bin / Barrel (Image 2 style) */}
              <rect x="180" y="270" width="40" height="70" rx="4" fill="#52b788" />
              <ellipse cx="200" cy="270" rx="20" ry="6" fill="#74c69d" />
              <line x1="180" y1="295" x2="220" y2="295" stroke="#1b4332" strokeWidth="2" />
              <line x1="180" y1="320" x2="220" y2="320" stroke="#1b4332" strokeWidth="2" />
              {/* Green Recycle Symbol on Bin */}
              <circle cx="200" cy="308" r="7" fill="none" stroke="#ffffff" strokeWidth="2" />
              
              {/* Person Outline/Shape planting/working */}
              <circle cx="120" cy="240" r="10" fill="#ffffff" />
              <path d="M 120,250 Q 120,290 140,300 M 120,260 L 105,275 L 90,295 M 120,260 L 140,270 L 155,290" stroke="#ffffff" strokeWidth="4" fill="none" strokeLinecap="round" />
            </svg>
            <h2>Let us go green to get our planet clean</h2>
            <p>
              Join thousands of global citizens today auditing carbon counts, logging daily savings, and reducing ecological footprints.
            </p>
          </div>
        </div>

        {/* Form Panel - Right */}
        <div className="auth-form-side">
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.2rem', textDecoration: 'none' }}>
            <EcoLogo size={34} />
            <span style={{ fontWeight: '850', fontSize: '1.4rem', color: 'var(--primary-color)' }}>EcoFootprint</span>
          </Link>

          <h2 style={{ textAlign: 'center', fontSize: '1.6rem', fontWeight: '800', margin: '0 0 0.4rem 0' }}>Create Account</h2>
          <p className="subtitle" style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '1.5rem', fontSize: '0.85rem', fontWeight: '600' }}>
            Join the platform to audit carbon footprints
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {error && (
              <div className="error-container">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="success-container">
                <span>✅</span>
                <span>Account created! Redirecting...</span>
              </div>
            )}

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem', fontWeight: '750', color: 'var(--text-secondary)' }}>
                Username
                <input
                  type="text"
                  name="username"
                  minLength={3}
                  maxLength={50}
                  value={form.username}
                  onChange={handleChange}
                  placeholder="e.g. jane_doe"
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

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem', fontWeight: '750', color: 'var(--text-secondary)' }}>
                Email
                <input
                  type="email"
                  name="email"
                  maxLength={100}
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. jane@mail.com"
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
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem', fontWeight: '750', color: 'var(--text-secondary)' }}>
                Password
                <input
                  type="password"
                  name="password"
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 chars"
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

              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem', fontWeight: '750', color: 'var(--text-secondary)' }}>
                Mobile Number
                <input
                  type="text"
                  name="mobileNumber"
                  value={form.mobileNumber}
                  onChange={handleChange}
                  placeholder="e.g. +15551234567"
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
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem', fontWeight: '750', color: 'var(--text-secondary)' }}>
                Age
                <input
                  type="number"
                  name="age"
                  min={1}
                  max={120}
                  value={form.age}
                  onChange={handleChange}
                  placeholder="28"
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

              <CustomDropdown
                label="Gender"
                placeholder="Select"
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' }
                ]}
                value={form.gender}
                onChange={(val) => setForm((prev) => ({ ...prev, gender: val }))}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', margin: '0.5rem 0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: '750', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isOrgAdmin}
                  onChange={(e) => setIsOrgAdmin(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary-color)' }}
                />
                Register as Organization Administrator
              </label>
            </div>
            <button
              type="submit"
              className="btn-submit"
              disabled={submitting || success}
              style={{
                padding: '0.8rem',
                fontSize: '0.92rem',
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
              {submitting ? 'Creating account...' : 'Sign Up'}
            </button>

            {/* Google Sign-In Option */}
            <div style={{ margin: '0.4rem 0 0 0', textAlign: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', margin: '0.6rem 0' }}>
                <div style={{ flex: 1, borderBottom: '1px solid var(--border-color)' }} />
                <span style={{ padding: '0 0.8rem', fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: '800' }}>OR SIGNUP WITH</span>
                <div style={{ flex: 1, borderBottom: '1px solid var(--border-color)' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '0.4rem' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Sign-In Failed')}
                  shape="pill"
                  theme="outline"
                />
              </div>
            </div>

            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.8rem', fontWeight: '600' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '800', textDecoration: 'none' }}>
                Sign In
              </Link>
            </p>
          </form>
        </div>

      </div>
    </div>
  );
}