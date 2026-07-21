import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomDropdown from '../components/CustomDropdown';

export default function Auth() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode Selection: Login or Signup
  const isSignupPath = location.pathname === '/signup';
  const [isLogin, setIsLogin] = useState(!isSignupPath);

  // Sync isLogin if path URL changes
  useEffect(() => {
    setIsLogin(location.pathname !== '/signup');
  }, [location.pathname]);

  // Theme Toggler for Unauthenticated Screen
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

  // Login Form States
  const [loginForm, setLoginForm] = useState({
    usernameOrEmail: '',
    password: '',
  });
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Signup Form States
  const [signupForm, setSignupForm] = useState({
    username: '',
    email: '',
    password: '',
    mobileNumber: '',
    age: '',
    gender: '',
  });
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [signupSubmitting, setSignupSubmitting] = useState(false);

  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  };

  const handleSignupChange = (e) => {
    setSignupForm({ ...signupForm, [e.target.name]: e.target.value });
  };

  // Login Submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginSubmitting(true);
    try {
      const userData = await login(loginForm.usernameOrEmail, loginForm.password);
      if (userData?.role === 'ROLE_ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Invalid username or password';
      const status = err.response?.status;

      if (
        status === 401 &&
        msg.toLowerCase().includes('not been verified yet')
      ) {
        setLoginError(msg);
        const emailPrefill = loginForm.usernameOrEmail.includes('@') ? loginForm.usernameOrEmail : '';
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(emailPrefill)}`);
        }, 2000);
      } else {
        setLoginError(msg);
      }
    } finally {
      setLoginSubmitting(false);
    }
  };

  // Signup Submission
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');
    
    // Simple validation for mobile number (10-15 digits, digits only, optional leading plus sign)
    const mobileRegex = /^\+?[0-9]{10,15}$/;
    if (!mobileRegex.test(signupForm.mobileNumber)) {
      setSignupError('Mobile number must be between 10 and 15 digits (e.g. +15551234567).');
      return;
    }

    const ageNum = parseInt(signupForm.age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setSignupError('Age must be a number between 1 and 120.');
      return;
    }

    if (!signupForm.gender) {
      setSignupError('Please select a gender.');
      return;
    }

    setSignupSubmitting(true);
    try {
      await signup(
        signupForm.username,
        signupForm.email,
        signupForm.password,
        signupForm.mobileNumber,
        signupForm.age,
        signupForm.gender
      );
      setSignupSuccess(true);
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(signupForm.email)}`);
      }, 1500);
    } catch (err) {
      setSignupError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setSignupSubmitting(false);
    }
  };

  return (
    <div className={`auth-split-container ${isLogin ? 'login-mode' : 'signup-mode'}`}>
      
      {/* Floating Theme Switcher */}
      <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 10 }}>
        <button
          type="button"
          onClick={toggleTheme}
          style={{
            background: 'var(--surface-color)',
            border: '1px solid var(--border-color)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            fontSize: '1.2rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.2s',
          }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
      </div>

      {/* Form Half (Left in Login, Right in Signup) */}
      <div className="auth-split-form-half">
        <div className="auth-form" style={{ maxWidth: '460px', width: '100%', overflow: 'hidden' }}>
          {/* Toggle tabs at top */}
          <div className="auth-tabs">
            <div className="auth-tabs-slider" style={{ transform: `translate3d(${isLogin ? '0%' : '100%'}, 0, 0)` }}></div>
            <button
              type="button"
              className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(true);
                setLoginError('');
                setSignupError('');
                navigate('/login', { replace: true });
              }}
            >
              Log In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => {
                setIsLogin(false);
                setLoginError('');
                setSignupError('');
                navigate('/signup', { replace: true });
              }}
            >
              Sign Up
            </button>
          </div>

          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="subtitle" style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '-0.8rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {isLogin ? 'Sign in to access your dashboard' : 'Join the platform to audit carbon footprints'}
          </p>

          {/* Sliding form viewport */}
          <div className="auth-sliding-viewport" style={{ minHeight: isLogin ? '260px' : '540px', transition: 'min-height 0.4s ease' }}>
            <div className="auth-sliding-track" style={{ transform: `translate3d(${isLogin ? '0%' : '-50%'}, 0, 0)` }}>
              
              {/* Login Pane */}
              <div className="auth-slide-pane" style={{ opacity: isLogin ? 1 : 0, pointerEvents: isLogin ? 'auto' : 'none' }}>
                <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {loginError && (
                    <div className="error-container">
                      <span>⚠️</span>
                      <span>{loginError}</span>
                    </div>
                  )}

                  <label>
                    Username or Email
                    <input
                      type="text"
                      name="usernameOrEmail"
                      value={loginForm.usernameOrEmail}
                      onChange={handleLoginChange}
                      placeholder="Enter username or email"
                      required={isLogin}
                    />
                  </label>

                  <label>
                    Password
                    <input
                      type="password"
                      name="password"
                      value={loginForm.password}
                      onChange={handleLoginChange}
                      placeholder="Enter password"
                      required={isLogin}
                    />
                  </label>

                  <button type="submit" disabled={loginSubmitting} style={{ marginTop: '0.5rem' }}>
                    {loginSubmitting ? 'Logging in...' : 'Log In'}
                  </button>

                  <div className="footer-links" style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
                    <Link to="/forgot-password" style={{ fontSize: '0.85rem', fontWeight: '700' }}>Forgot Password?</Link>
                  </div>
                </form>
              </div>

              {/* Signup Pane */}
              <div className="auth-slide-pane" style={{ opacity: !isLogin ? 1 : 0, pointerEvents: !isLogin ? 'auto' : 'none' }}>
                <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {signupError && (
                    <div className="error-container">
                      <span>⚠️</span>
                      <span>{signupError}</span>
                    </div>
                  )}
                  {signupSuccess && (
                    <div className="success-container">
                      <span>✅</span>
                      <span>Account created! Redirecting...</span>
                    </div>
                  )}

                  <label>
                    Username
                    <input
                      type="text"
                      name="username"
                      minLength={3}
                      maxLength={50}
                      value={signupForm.username}
                      onChange={handleSignupChange}
                      placeholder="e.g. jane_doe"
                      required={!isLogin}
                    />
                  </label>

                  <label>
                    Email
                    <input
                      type="email"
                      name="email"
                      maxLength={100}
                      value={signupForm.email}
                      onChange={handleSignupChange}
                      placeholder="e.g. jane@example.com"
                      required={!isLogin}
                    />
                  </label>

                  <label>
                    Password
                    <input
                      type="password"
                      name="password"
                      minLength={6}
                      value={signupForm.password}
                      onChange={handleSignupChange}
                      placeholder="At least 6 characters"
                      required={!isLogin}
                    />
                  </label>

                  <label>
                    Mobile Number
                    <input
                      type="text"
                      name="mobileNumber"
                      value={signupForm.mobileNumber}
                      onChange={handleSignupChange}
                      placeholder="e.g. +15551234567"
                      required={!isLogin}
                    />
                  </label>

                  <div className="form-row">
                    <label>
                      Age
                      <input
                        type="number"
                        name="age"
                        min={1}
                        max={120}
                        value={signupForm.age}
                        onChange={handleSignupChange}
                        placeholder="28"
                        required={!isLogin}
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
                      value={signupForm.gender}
                      onChange={(val) => setSignupForm((prev) => ({ ...prev, gender: val }))}
                    />
                  </div>

                  <button type="submit" disabled={signupSubmitting || signupSuccess} style={{ marginTop: '0.5rem' }}>
                    {signupSubmitting ? 'Creating account...' : 'Sign Up'}
                  </button>
                </form>
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Info Half (Right in Login, Left in Signup) */}
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
