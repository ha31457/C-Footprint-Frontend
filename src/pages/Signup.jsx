import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import CustomDropdown from '../components/CustomDropdown';

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
        form.gender
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
    <div className="auth-split-container signup-mode" style={{ minHeight: '100vh' }}>

      {/* Info Half - Left */}
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

      {/* Form Half - Right */}
      <div className="auth-split-form-half" style={{ padding: '2rem 1.5rem' }}>
        <div className="auth-form" style={{ maxWidth: '520px', width: '100%', padding: '1.6rem 2.2rem' }}>
          
          {/* Logo Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '1.8rem' }}>🌱</span>
            <span style={{ fontWeight: '850', fontSize: '1.4rem', color: 'var(--primary-color)' }}>EcoFootprint</span>
          </div>

          <h2>Create Account</h2>
          <p className="subtitle" style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '-0.8rem', marginBottom: '1.2rem', fontSize: '0.85rem' }}>
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

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label>
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
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  name="email"
                  maxLength={100}
                  value={form.email}
                  onChange={handleChange}
                  placeholder="e.g. jane@mail.com"
                  required
                />
              </label>
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label>
                Password
                <input
                  type="password"
                  name="password"
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 6 chars"
                  required
                />
              </label>

              <label>
                Mobile Number
                <input
                  type="text"
                  name="mobileNumber"
                  value={form.mobileNumber}
                  onChange={handleChange}
                  placeholder="e.g. +15551234567"
                  required
                />
              </label>
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <label>
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

            <button type="submit" className="btn-submit" disabled={submitting || success} style={{ marginTop: '0.5rem' }}>
              {submitting ? 'Creating account...' : 'Sign Up'}
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

            <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem', margin: 0 }}>
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