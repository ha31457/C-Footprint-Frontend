import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../constants/avatars';

export default function Layout({ children }) {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Sidebar collapsing & mobile menu states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleSidebar = () => {
    const nextVal = !isSidebarCollapsed;
    setIsSidebarCollapsed(nextVal);
    localStorage.setItem('sidebar-collapsed', String(nextVal));
  };

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme') || 'light';
    if (saved === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    return saved;
  });

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

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isLandingPage = location.pathname === '/';

  if (isLandingPage) {
    return (
      <div className="app-container">
        {/* NAVBAR */}
        <nav className="app-navbar">
          <div className="navbar-brand-container">
            <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"} className="app-logo">
              <span>🌱</span>
              <span>EcoFootprint</span>
            </Link>
          </div>

          <div className="navbar-controls">
            {isAdmin ? (
              <Link to="/admin/dashboard" className="navbar-logout-btn" style={{ textDecoration: 'none' }}>Admin Dashboard</Link>
            ) : (
              <Link to="/dashboard" className="navbar-logout-btn" style={{ textDecoration: 'none' }}>Go to Dashboard</Link>
            )}
          </div>
        </nav>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </main>
      </div>
    );
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/admin/user-management?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="app-container">
      {/* NAVBAR */}
      <nav className="app-navbar">
        <div className="navbar-brand-container">
          <button
            onClick={() => {
              if (window.innerWidth <= 768) {
                setIsMobileMenuOpen(!isMobileMenuOpen);
              } else {
                toggleSidebar();
              }
            }}
            className="sidebar-toggle-btn"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.3rem',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              padding: '0.4rem',
              marginRight: '0.6rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Toggle Menu"
          >
            ☰
          </button>
          
          <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"} className="app-logo">
            <span>🌱</span>
            <span>EcoFootprint</span>
          </Link>
        </div>

        <div className="navbar-controls">
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '0.5rem',
            }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {isAdmin ? (
            <>
              <form onSubmit={handleSearchSubmit} className="navbar-search-form">
                <input
                  type="text"
                  placeholder="Search Users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="navbar-search-input"
                />
                <button type="submit" className="navbar-search-btn">🔍</button>
              </form>
              <Link to="/admin/profile" className="navbar-profile-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
                <img
                  src={getAvatarUrl(user?.avatar, user?.gender, user?.username)}
                  alt="Avatar"
                  style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid var(--primary-color)', background: 'var(--primary-light)', objectFit: 'cover' }}
                />
                <span>{user?.username || 'Admin'}</span>
              </Link>
              <button onClick={logout} className="navbar-logout-btn">Log Out</button>
            </>
          ) : (
            <>
              <Link to="/profile" className="navbar-profile-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.8rem' }}>
                <img
                  src={getAvatarUrl(user?.avatar, user?.gender, user?.username)}
                  alt="Avatar"
                  style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid var(--primary-color)', background: 'var(--primary-light)', objectFit: 'cover' }}
                />
                <span>{user?.username || 'Profile'}</span>
              </Link>
              <button onClick={logout} className="navbar-logout-btn">Log Out</button>
            </>
          )}
        </div>
      </nav>

      <div className={`main-wrapper ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        
        {/* Mobile Menu Drawer Overlay Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="sidebar-mobile-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              top: '70px',
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.4)',
              zIndex: 999
            }}
          />
        )}

        {/* SIDEBAR */}
        <aside className={`app-sidebar ${isSidebarCollapsed ? 'collapsed' : ''} ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-menu">
            {isAdmin ? (
              // Admin sidebar items
              <>
                <Link to="/admin/dashboard" className={`sidebar-item ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}>
                  <span>📊</span> <span className="sidebar-text">Dashboard</span>
                </Link>
                <Link to="/admin/user-management" className={`sidebar-item ${location.pathname === '/admin/user-management' ? 'active' : ''}`}>
                  <span>👥</span> <span className="sidebar-text">User Management</span>
                </Link>
                <Link to="/admin/emission-factors" className={`sidebar-item ${location.pathname === '/admin/emission-factors' ? 'active' : ''}`}>
                  <span>⚙️</span> <span className="sidebar-text">Emission Factors</span>
                </Link>
                <Link to="/admin/activity-monitoring" className={`sidebar-item ${location.pathname === '/admin/activity-monitoring' ? 'active' : ''}`}>
                  <span>🕵️‍♂️</span> <span className="sidebar-text">Activity Monitoring</span>
                </Link>
                <Link to="/admin/organization-management" className={`sidebar-item ${location.pathname === '/admin/organization-management' ? 'active' : ''}`}>
                  <span>🏢</span> <span className="sidebar-text">Organization Management</span>
                </Link>
                <Link to="/admin/badge-management" className={`sidebar-item ${location.pathname === '/admin/badge-management' ? 'active' : ''}`}>
                  <span>🏆</span> <span className="sidebar-text">Badge Management</span>
                </Link>
                <Link to="/admin/leaderboard-management" className={`sidebar-item ${location.pathname === '/admin/leaderboard-management' ? 'active' : ''}`}>
                  <span>🏅</span> <span className="sidebar-text">Leaderboard Management</span>
                </Link>
                <Link to="/admin/reports" className={`sidebar-item ${location.pathname === '/admin/reports' ? 'active' : ''}`}>
                  <span>📂</span> <span className="sidebar-text">Reports</span>
                </Link>
                <Link to="/admin/analytics" className={`sidebar-item ${location.pathname === '/admin/analytics' ? 'active' : ''}`}>
                  <span>📈</span> <span className="sidebar-text">Analytics</span>
                </Link>
                <Link to="/admin/system-settings" className={`sidebar-item ${location.pathname === '/admin/system-settings' ? 'active' : ''}`}>
                  <span>🛠️</span> <span className="sidebar-text">System Settings</span>
                </Link>
              </>
            ) : (
              // User sidebar items
              <>
                <Link to="/dashboard" className={`sidebar-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                  <span>📊</span> <span className="sidebar-text">Dashboard</span>
                </Link>
                <Link to="/log-activity" className={`sidebar-item ${location.pathname === '/log-activity' ? 'active' : ''}`}>
                  <span>✏️</span> <span className="sidebar-text">Activity Logging</span>
                </Link>
                <Link to="/analytics" className={`sidebar-item ${location.pathname === '/analytics' ? 'active' : ''}`}>
                  <span>📈</span> <span className="sidebar-text">Analytics</span>
                </Link>
                <Link to="/sustainability-goals" className={`sidebar-item ${location.pathname === '/sustainability-goals' ? 'active' : ''}`}>
                  <span>🎯</span> <span className="sidebar-text">Sustainibility goals</span>
                </Link>
                <Link to="/recommendations" className={`sidebar-item ${location.pathname === '/recommendations' ? 'active' : ''}`}>
                  <span>💡</span> <span className="sidebar-text">Recommendations</span>
                </Link>
                <Link to="/community-leaderboard" className={`sidebar-item ${location.pathname === '/community-leaderboard' ? 'active' : ''}`}>
                  <span>👥</span> <span className="sidebar-text">Community Leaderboard</span>
                </Link>
                <Link to="/badges-leaderboard" className={`sidebar-item ${location.pathname === '/badges-leaderboard' ? 'active' : ''}`}>
                  <span>🏅</span> <span className="sidebar-text">Badges & Leaderboard</span>
                </Link>
                <Link to="/activity-history" className={`sidebar-item ${location.pathname === '/activity-history' ? 'active' : ''}`}>
                  <span>📜</span> <span className="sidebar-text">My Activity History</span>
                </Link>
                <Link to="/profile" className={`sidebar-item ${location.pathname === '/profile' ? 'active' : ''}`}>
                  <span>👤</span> <span className="sidebar-text">Profile</span>
                </Link>
                <Link to="/settings" className={`sidebar-item ${location.pathname === '/settings' ? 'active' : ''}`}>
                  <span>⚙️</span> <span className="sidebar-text">Settings</span>
                </Link>
              </>
            )}
            
            <button onClick={logout} className="sidebar-item logout-item-btn" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <span>🚪</span> <span className="sidebar-text">Logout</span>
            </button>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
}
