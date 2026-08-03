import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  // Theme support for unauthenticated session
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

  // Particle Canvas Background Ref & Logic
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement.clientHeight || window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particleCount = Math.min(Math.floor(window.innerWidth / 24), 65);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.5 + 1.2,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      color: Math.random() > 0.4 ? '#8b5cf6' : Math.random() > 0.5 ? '#f43f5e' : '#06b6d4',
      alpha: Math.random() * 0.45 + 0.25
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 115) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = '#8b5cf6';
            ctx.globalAlpha = (1 - dist / 115) * 0.18;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Interactive Simulator States
  const [simCategory, setSimCategory] = useState('car');
  const [simQty, setSimQty] = useState(50);

  const categories = {
    car: { name: 'Gasoline Car Travel', unit: 'km', factor: 0.18, max: 300, step: 10, icon: '🚗' },
    electricity: { name: 'Grid Electricity Consumed', unit: 'kWh', factor: 0.45, max: 800, step: 20, icon: '⚡' },
    meat: { name: 'Beef / Dairy Meals Eaten', unit: 'servings', factor: 2.5, max: 30, step: 1, icon: '🥩' }
  };

  const activeCategory = categories[simCategory];
  const totalCo2 = (simQty * activeCategory.factor).toFixed(2);

  const handleCategoryChange = (cat) => {
    setSimCategory(cat);
    if (cat === 'car') setSimQty(80);
    if (cat === 'electricity') setSimQty(200);
    if (cat === 'meat') setSimQty(6);
  };

  return (
    <div className="landing-container" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Particle Canvas Animation Background */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Floating Animated Background Blobs */}
      <div className="animated-bg-container">
        <div className="bg-blob bg-blob-1" />
        <div className="bg-blob bg-blob-2" />
        <div className="bg-blob bg-blob-3" />
      </div>
      {/* Dynamic Header for Guest Sessions */}
      {!isAuthenticated && (
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.2rem 2.5rem',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--surface-color)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.6rem' }}>🌱</span>
            <span style={{ fontWeight: '800', fontSize: '1.3rem', color: 'var(--primary-color)' }}>EcoFootprint</span>
          </div>

          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>{t('features', 'Features')}</a>
            <a href="#methodology" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>{t('methodology', 'Methodology')}</a>
            <Link to="/login" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>Sign In</Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/login" className="landing-btn landing-btn-primary" style={{ padding: '0.5rem 1.2rem', fontSize: '0.85rem', borderRadius: '8px' }}>
              {t('getStarted', 'Get Started')}
            </Link>
          </div>
        </header>
      )}

      {/* Split Hero Section */}
      <section className="landing-hero-wrapper">
        <div className="landing-hero-split">
          
          {/* Left Column: Hero Content */}
          <div className="landing-hero-left">
            <div className="hero-pill-badge">
              <span>🌱</span>
              <span>Next-Gen Carbon Intelligence</span>
            </div>
            <h1>{t('landingTitle', "Measure, Manage & Lower Your Carbon Footprint")}</h1>
            <p>
              {t('landingSubtitle', "EcoFootprint empowers individuals and organizations to calculate daily activity emissions, track reduction goals, analyze carbon trends, and earn green community badges in real time.")}
            </p>
            
            <div className="hero-trust-list">
              <div className="hero-trust-item">
                <span className="hero-trust-icon">✓</span>
                <span>Automated CO₂e Factors</span>
              </div>
              <div className="hero-trust-item">
                <span className="hero-trust-icon">✓</span>
                <span>Personalized Eco Tips</span>
              </div>
              <div className="hero-trust-item">
                <span className="hero-trust-icon">✓</span>
                <span>Community Leaderboards</span>
              </div>
            </div>

            <div className="landing-hero-cta">
              {isAuthenticated ? (
                <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"} className="landing-btn landing-btn-primary">
                  Go to Dashboard &rarr;
                </Link>
              ) : (
                <>
                  <Link to="/login" className="landing-btn landing-btn-primary">
                    Get Started for Free
                  </Link>
                  <a href="#features" className="landing-btn landing-btn-secondary">
                    Explore Features
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Animated Eco Dashboard Visual */}
          <div className="hero-animation-container">
            {/* Top Right Floating Activity Pill */}
            <div className="hero-floating-pill pill-top-right">
              <span style={{ fontSize: '1.2rem' }}>⚡</span>
              <div>
                <div style={{ color: 'var(--text-primary)' }}>Solar Power Logged</div>
                <div style={{ color: 'var(--primary-color)', fontSize: '0.75rem', fontWeight: '800' }}>-12.5 kg CO₂e saved</div>
              </div>
            </div>

            {/* Main Animated Central Card */}
            <div className="hero-main-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Live Audit Monitor</div>
                <span style={{ fontSize: '0.75rem', background: 'var(--primary-light)', color: 'var(--primary-color)', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: '800' }}>
                  ● Active
                </span>
              </div>

              {/* Pulsing Carbon Gauge Visual */}
              <div className="hero-gauge-wrapper">
                <div className="hero-gauge-ring">
                  <span className="hero-gauge-value">-34.8%</span>
                  <span className="hero-gauge-label">Footprint Cut</span>
                </div>
              </div>

              {/* Mini Activity Row */}
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: 'var(--bg-color)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700' }}>
                  <span>🚗 Electric Commute</span>
                  <span style={{ color: 'var(--primary-color)' }}>0.15 kg/km</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', background: 'var(--bg-color)', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '700' }}>
                  <span>♻️ Recycling Audited</span>
                  <span style={{ color: 'var(--primary-color)' }}>-4.80 kg CO₂</span>
                </div>
              </div>
            </div>

            {/* Bottom Left Floating Achievement Pill */}
            <div className="hero-floating-pill pill-bottom-left">
              <span style={{ fontSize: '1.3rem' }}>🏆</span>
              <div>
                <div style={{ color: 'var(--text-primary)' }}>Badge Unlocked</div>
                <div style={{ color: 'var(--accent-color)', fontSize: '0.75rem', fontWeight: '800' }}>Carbon Champion</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Stats Counter Banner Section (Full Bleed) */}
      <section className="landing-section-outer alt" style={{ padding: '4rem 1.75rem' }}>
        <div className="landing-section-inner">
          <div className="landing-stats-grid">
            <div className="landing-stat-card">
              <span className="landing-stat-number">142,580+</span>
              <span className="landing-stat-desc">Kgs CO2e Logged & Audited</span>
            </div>
            <div className="landing-stat-card">
              <span className="landing-stat-number">9,840+</span>
              <span className="landing-stat-desc">Carbon Logs Filed</span>
            </div>
            <div className="landing-stat-card">
              <span className="landing-stat-number">1,250+</span>
              <span className="landing-stat-desc">Active Climate Heroes</span>
            </div>
            <div className="landing-stat-card">
              <span className="landing-stat-number">34.8%</span>
              <span className="landing-stat-desc">Avg Carbon Reduction</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="landing-section-outer">
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <h2>Everything you need to drive sustainability</h2>
            <p>
              An all-in-one suite to track carbon logs, visualize daily trends, reward positive contributions, and inspect platform analytics.
            </p>
          </div>

          <div className="landing-features-grid">
            <div className="landing-feature-card">
              <span className="landing-feature-icon">✏️</span>
              <h3>Carbon Logging & Calculators</h3>
              <p>
                Log your transportation trips, home utilities, diet choices, and shopping activities. Calculations dynamically apply standard carbon conversion weights.
              </p>
            </div>

            <div className="landing-feature-card">
              <span className="landing-feature-icon">📊</span>
              <h3>Insightful Dashboard Trends</h3>
              <p>
                Access interactive weekly, monthly, and yearly line and pie charts that break down emissions by activity type and highlight your progress over time.
              </p>
            </div>

            <div className="landing-feature-card">
              <span className="landing-feature-icon">🏅</span>
              <h3>Badges & Milestones</h3>
              <p>
                Earn gamified carbon-conscious badges and check leaderboards to see how your ecological savings stack up against the rest of the community.
              </p>
            </div>

            <div className="landing-feature-card">
              <span className="landing-feature-icon">🛡️</span>
              <h3>Platform Diagnostic Auditing</h3>
              <p>
                Authorized administrators can audit platform-wide carbon registries, monitor daily logs with filters, manage active accounts, and edit emissions factors.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology & Interactive Calculator Section (Full Bleed) */}
      <section id="methodology" className="landing-section-outer alt">
        <div className="landing-section-inner">
          <div className="landing-methodology">
            <h3>Our Calculation Methodology</h3>
            <p>
              EcoFootprint maps recorded units (kilometers traveled, kilowatt-hours consumed, food servings eaten, or dollars spent) to official coefficients. Every logging entry computes greenhouse emissions using standardized formulas to give users a transparent, credible overview of their impact.
            </p>
            
            <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', marginBottom: '1rem' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '1.25rem', color: 'var(--primary-color)' }}>GHG Protocol</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Standardized Coefficients</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '1.25rem', color: 'var(--primary-color)' }}>Real-Time</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Instant Carbon Audits</span>
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '1.25rem', color: 'var(--primary-color)' }}>Adaptive</strong>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Dynamic Factors</span>
              </div>
            </div>

            {/* Interactive Calculator Simulator widget */}
            <h4 style={{ fontSize: '1.2rem', fontWeight: '800', marginTop: '1rem', color: 'var(--text-primary)' }}>Methodology Live Calculator Preview</h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-light)', marginTop: '-0.8rem' }}>
              Drag the range slider to see how coefficients are applied in real-time calculations.
            </p>

            <div className="methodology-simulator">
              {/* Left Pane: Controls */}
              <div className="simulator-controls">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase' }}>Select Activity Type</span>
                  <div className="simulator-btn-row">
                    <button
                      type="button"
                      onClick={() => handleCategoryChange('car')}
                      className={`simulator-cat-btn ${simCategory === 'car' ? 'active' : ''}`}
                    >
                      🚗 Car Travel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCategoryChange('electricity')}
                      className={`simulator-cat-btn ${simCategory === 'electricity' ? 'active' : ''}`}
                    >
                      ⚡ Electricity
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCategoryChange('meat')}
                      className={`simulator-cat-btn ${simCategory === 'meat' ? 'active' : ''}`}
                    >
                      🥩 Beef Meal
                    </button>
                  </div>
                </div>

                <div className="simulator-slider-wrapper">
                  <div className="simulator-slider-header">
                    <span>Logged Quantity</span>
                    <span style={{ color: 'var(--primary-color)' }}>{simQty} {activeCategory.unit}</span>
                  </div>
                  <input
                    type="range"
                    min={activeCategory.step}
                    max={activeCategory.max}
                    step={activeCategory.step}
                    value={simQty}
                    onChange={(e) => setSimQty(parseInt(e.target.value, 10))}
                    className="simulator-slider"
                  />
                </div>
              </div>

              {/* Right Pane: Visual Calculations */}
              <div className="simulator-output">
                <h4>Calculation Output</h4>
                <div className="simulator-calc-row">
                  {simQty} {activeCategory.unit} &times; {activeCategory.factor} kg CO2e/{activeCategory.unit}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '0.4rem' }}>
                  <span className="simulator-result-title">Computed Footprint</span>
                  <span className="simulator-result-value">{totalCo2} <span style={{ fontSize: '1.2rem', fontWeight: '700' }}>kg CO2e</span></span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="landing-footer">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <h3>🌱 EcoFootprint</h3>
            <p>
              Empowering individuals and corporate teams to audit daily carbon emissions, track sustainable habits, and build an eco-friendly future.
            </p>
          </div>

          <div className="landing-footer-links-col">
            <h4>Platform</h4>
            <a href="#features">Features</a>
            <a href="#methodology">Methodology</a>
            <Link to="/support">Support & Help</Link>
            {isAuthenticated && <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"}>My Dashboard</Link>}
          </div>

          <div className="landing-footer-links-col">
            <h4>Account</h4>
            {isAuthenticated ? (
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Logged in as {user?.username}</span>
            ) : (
              <>
                <Link to="/login">Sign In</Link>
                <Link to="/signup">Register</Link>
                <Link to="/forgot-password">Forgot Password</Link>
              </>
            )}
          </div>
        </div>

        <div className="landing-footer-bottom">
          <span>&copy; {new Date().getFullYear()} EcoFootprint. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
