import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import EcoLogo from '../components/EcoLogo';

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
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(10, 25, 15, 0.55)',
            backdropFilter: 'blur(12px)',
            position: 'fixed',
            width: '100%',
            top: 0,
            left: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <EcoLogo size={32} />
            <span style={{ fontWeight: '800', fontSize: '1.3rem', color: '#ffffff' }}>EcoFootprint</span>
          </div>

          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <a href="#features" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>{t('features', 'Features')}</a>
            <a href="#methodology" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>{t('methodology', 'Methodology')}</a>
            <Link to="/login" style={{ color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>Sign In</Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/login" className="landing-btn landing-btn-primary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.82rem', borderRadius: '20px' }}>
              {t('getStarted', 'Get Started')}
            </Link>
          </div>
        </header>
      )}

      {/* Hero Section */}
      <section className="landing-hero-wrapper">
        <div className="landing-hero-split">
          <div className="landing-hero-left">
            <div className="hero-pill-badge">
              <span>🌱</span>
              <span>Next-Gen Carbon Auditing</span>
            </div>
            <h1>Auditing Footprints for a Greener Tomorrow</h1>
            <p>
              EcoFootprint empowers individuals and corporate teams to calculate daily activity emissions, track reduction goals, analyze carbon trends, and earn green community badges in real time.
            </p>
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
        </div>

        {/* Stats Row overlay at bottom of Hero */}
        <div className="landing-hero-stats-row">
          <div className="stats-inner">
            <div className="stat-item">
              <span className="stat-val">15+</span>
              <span className="stat-lbl">Verified Factors</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">12,000+</span>
              <span className="stat-lbl">Active Heroes</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">50+</span>
              <span className="stat-lbl">Green Badges</span>
            </div>
            <div className="stat-item">
              <span className="stat-val">34.8%</span>
              <span className="stat-lbl">Avg Reduction</span>
            </div>
          </div>
        </div>
      </section>

      {/* Split Section: Rooted in science... */}
      <section className="landing-section-outer" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="landing-section-inner">
          <div className="split-content-container">
            <div className="split-left-pane">
              <h2>
                Rooted in Science,<br />
                <span>Growing with Innovation.</span>
              </h2>
              <div className="split-left-grid">
                <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop" alt="Eco landscape" />
                <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=600&auto=format&fit=crop" alt="Renewable energy" />
                <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600&auto=format&fit=crop" alt="Forest" />
              </div>
            </div>
            <div className="split-right-pane">
              <p>
                At EcoFootprint, we are passionate about nurturing the planet and the people who depend on it. With verified emissions factors and a vision for sustainable living, we bridge traditional environmental practices with modern technologies to create a thriving ecological future.
              </p>
              <p>
                Our auditing system conforms to dynamic carbon modeling rules, converting everyday data into exact CO₂e equivalents so you can make informed, impact-driven decisions.
              </p>
              <div className="slider-controls">
                <button className="slider-btn">◀</button>
                <div className="slider-progress-bar">
                  <div className="slider-progress-fill" style={{ width: '60%' }} />
                </div>
                <button className="slider-btn">▶</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer Grid Section */}
      <section id="features" className="landing-section-outer" style={{ background: 'var(--sidebar-bg)' }}>
        <div className="landing-section-inner">
          <div className="landing-section-header">
            <h2>What We Offer</h2>
            <p>Providing sustainable solutions to modern carbon auditing needs.</p>
          </div>

          <div className="landing-features-grid">
            <div className="landing-feature-card">
              <span className="landing-feature-icon">✏️</span>
              <h3>Carbon Auditing</h3>
              <p>
                Record your footprints across travel, utilities, shopping, and diet. Computations apply verified carbon conversion coefficients.
              </p>
            </div>

            <div className="landing-feature-card">
              <span className="landing-feature-icon">📊</span>
              <h3>Interactive Trends</h3>
              <p>
                Access dynamic charts and analytics that break down carbon counts by category, showing logs over weekly or monthly timelines.
              </p>
            </div>

            <div className="landing-feature-card">
              <span className="landing-feature-icon">🏅</span>
              <h3>Eco Achievements</h3>
              <p>
                Earn gamified carbon-conscious badges and check leaderboards to see how your ecological savings stack up against the rest of the community.
              </p>
            </div>
          </div>

          <div className="feature-view-more-row">
            <a href="#methodology" className="landing-btn landing-btn-primary">
              View All Features &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* Certified Badges Banners Section (Our Fresh Produce layout) */}
      <section className="landing-section-outer">
        <div className="landing-section-inner">
          <div className="landing-section-header" style={{ marginBottom: '3rem' }}>
            <h2>Certified Milestones</h2>
            <p>Earn high-status accolades as you reduce emissions and save carbon counts.</p>
          </div>

          <div className="pillars-grid">
            <div className="pillar-card">
              <img src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=600&auto=format&fit=crop" alt="Eco Commuter" />
              <div className="pillar-overlay">
                <h4>Eco Commuter</h4>
                <p>Awarded to users keeping transportation emissions below target weekly thresholds.</p>
              </div>
            </div>

            <div className="pillar-card">
              <img src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=600&auto=format&fit=crop" alt="Renewable Pioneer" />
              <div className="pillar-overlay">
                <h4>Renewable Pioneer</h4>
                <p>Awarded to users registering green utilities and low-energy appliances.</p>
              </div>
            </div>

            <div className="pillar-card">
              <img src="https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=600&auto=format&fit=crop" alt="Forest Guardian" />
              <div className="pillar-overlay">
                <h4>Forest Guardian</h4>
                <p>Awarded to users offsetting cumulative carbon records through certified plantations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Numbered Techniques Section (Water saving techniques layout) */}
      <section className="landing-section-outer" style={{ background: 'var(--sidebar-bg)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="landing-section-inner">
          <div className="tech-split-container">
            <div className="tech-left-banner">
              <img src="https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=600&auto=format&fit=crop" alt="Green foliage" />
            </div>
            
            <div className="tech-right-list">
              <div className="tech-item">
                <span className="tech-number">01</span>
                <div className="tech-text-block">
                  <h4>Carbon Audit Logs</h4>
                  <p>Submit verified proof images and log daily carbon emission events compliant with international GHG protocol metrics.</p>
                </div>
              </div>

              <div className="tech-item">
                <span className="tech-number">02</span>
                <div className="tech-text-block">
                  <h4>Sustainability Targets</h4>
                  <p>Establish personalized reduction goals and follow progress with clear visual indicators and weekly feedback logs.</p>
                </div>
              </div>

              <div className="tech-item">
                <span className="tech-number">03</span>
                <div className="tech-text-block">
                  <h4>AI Chatbot Assistant</h4>
                  <p>Engage in real-time, context-aware dialogues with EcoAssistant to audit habits and discover carbon budget recommendations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section & Live Simulator */}
      <section id="methodology" className="landing-section-outer">
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
