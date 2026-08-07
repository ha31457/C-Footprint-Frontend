import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../constants/avatars';
import apiClient from '../api/apiClient';
import { useLanguage } from '../context/LanguageContext';
import SearchableLanguageDropdown from './SearchableLanguageDropdown';
import ChatbotWidget from './ChatbotWidget';
import EcoLogo from './EcoLogo';

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'hi', label: 'Hindi' },
  { value: 'mr', label: 'Marathi' },
  { value: 'gu', label: 'Gujarati' },
  { value: 'bn', label: 'Bengali' },
  { value: 'ta', label: 'Tamil' },
  { value: 'te', label: 'Telugu' },
  { value: 'kn', label: 'Kannada' },
  { value: 'ml', label: 'Malayalam' },
  { value: 'pa', label: 'Punjabi' },
  { value: 'sa', label: 'Sanskrit' },
  { value: 'ur', label: 'Urdu' },
  { value: 'zh-CN', label: 'Chinese (Simplified)' },
  { value: 'zh-TW', label: 'Chinese (Traditional)' },
  { value: 'ar', label: 'Arabic' },
  { value: 'ru', label: 'Russian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'it', label: 'Italian' },
  { value: 'nl', label: 'Dutch' },
  { value: 'tr', label: 'Turkish' },
  { value: 'vi', label: 'Vietnamese' },
  { value: 'pl', label: 'Polish' },
  { value: 'uk', label: 'Ukrainian' },
  { value: 'fa', label: 'Persian' },
  { value: 'th', label: 'Thai' },
  { value: 'sv', label: 'Swedish' },
  { value: 'id', label: 'Indonesian' },
  { value: 'ms', label: 'Malay' },
  { value: 'tl', label: 'Tagalog (Filipino)' },
  { value: 'el', label: 'Greek' },
  { value: 'he', label: 'Hebrew' },
  { value: 'da', label: 'Danish' },
  { value: 'fi', label: 'Finnish' },
  { value: 'no', label: 'Norwegian' },
  { value: 'cs', label: 'Czech' },
  { value: 'hu', label: 'Hungarian' },
  { value: 'ro', label: 'Romanian' },
  { value: 'sk', label: 'Slovak' },
  { value: 'hr', label: 'Croatian' },
  { value: 'sr', label: 'Serbian' },
  { value: 'bg', label: 'Bulgarian' },
  { value: 'lt', label: 'Lithuanian' },
  { value: 'lv', label: 'Latvian' },
  { value: 'et', label: 'Estonian' },
  { value: 'sl', label: 'Slovenian' },
  { value: 'is', label: 'Icelandic' },
  { value: 'ga', label: 'Irish' },
  { value: 'cy', label: 'Welsh' },
  { value: 'la', label: 'Latin' },
  { value: 'eo', label: 'Esperanto' },
  { value: 'sw', label: 'Swahili' },
  { value: 'zu', label: 'Zulu' },
  { value: 'af', label: 'Afrikaans' },
  { value: 'am', label: 'Amharic' },
  { value: 'ne', label: 'Nepali' },
  { value: 'si', label: 'Sinhala' },
  { value: 'my', label: 'Burmese' },
  { value: 'km', label: 'Khmer' },
  { value: 'lo', label: 'Lao' },
  { value: 'mn', label: 'Mongolian' },
  { value: 'bo', label: 'Tibetan' },
  { value: 'ps', label: 'Pashto' },
  { value: 'sd', label: 'Sindhi' },
  { value: 'as', label: 'Assamese' },
  { value: 'or', label: 'Odia' },
  { value: 'mai', label: 'Maithili' },
  { value: 'doi', label: 'Dogri' },
  { value: 'kok', label: 'Konkani' },
  { value: 'ks', label: 'Kashmiri' },
  { value: 'mni', label: 'Manipuri' },
  { value: 'brx', label: 'Bodo' },
  { value: 'sat', label: 'Santali' },
  { value: 'az', label: 'Azerbaijani' },
  { value: 'ka', label: 'Georgian' },
  { value: 'hy', label: 'Armenian' },
  { value: 'kk', label: 'Kazakh' },
  { value: 'uz', label: 'Uzbek' },
  { value: 'ky', label: 'Kyrgyz' },
  { value: 'tg', label: 'Tajik' },
  { value: 'tk', label: 'Turkmen' },
  { value: 'ca', label: 'Catalan' },
  { value: 'gl', label: 'Galician' },
  { value: 'eu', label: 'Basque' },
  { value: 'co', label: 'Corsican' },
  { value: 'fy', label: 'Frisian' },
  { value: 'haw', label: 'Hawaiian' },
  { value: 'hmn', label: 'Hmong' },
  { value: 'ig', label: 'Igbo' },
  { value: 'yo', label: 'Yoruba' },
  { value: 'xh', label: 'Xhosa' },
  { value: 'sn', label: 'Shona' },
  { value: 'so', label: 'Somali' },
  { value: 'mg', label: 'Malagasy' },
  { value: 'su', label: 'Sundanese' },
  { value: 'jw', label: 'Javanese' },
  { value: 'mi', label: 'Maori' },
  { value: 'sm', label: 'Samoan' },
  { value: 'yi', label: 'Yiddish' },
  { value: 'ku', label: 'Kurdish' },
  { value: 'lb', label: 'Luxembourgish' },
  { value: 'mt', label: 'Maltese' },
  { value: 'gd', label: 'Scottish Gaelic' }
];

export default function Layout({ children }) {
  const { isAuthenticated, user, logout, settings } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Notifications States
  const [notifications, setNotifications] = useState([]);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await apiClient.get('/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to retrieve notifications:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated]);

  const handleMarkAsRead = async (id) => {
    try {
      await apiClient.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Error during logout:', err);
    }
    navigate('/login');
  };

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
              <EcoLogo size={28} style={{ marginRight: '0.15rem' }} />
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
            <EcoLogo size={28} style={{ marginRight: '0.15rem' }} />
            <span className="notranslate" translate="no">EcoFootprint</span>
          </Link>
        </div>

        <div className="navbar-controls">
          <SearchableLanguageDropdown
            value={language}
            onChange={setLanguage}
            options={languageOptions}
          />

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

          {/* Notifications Bell Button */}
          <button
            onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
            className={`navbar-bell-btn ${notifications.some(n => !n.read) ? 'notification-dot' : ''}`}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '0.8rem',
              position: 'relative'
            }}
            title="Notifications"
          >
            <span className="notranslate" translate="no">🔔</span>
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
                  src={getAvatarUrl(user?.avatarUrl, user?.avatar, user?.gender, user?.username)}
                  alt="Avatar"
                  style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid var(--primary-color)', background: 'var(--primary-light)', objectFit: 'cover' }}
                />
                <span>{user?.username || 'Admin'}</span>
              </Link>
              <button onClick={handleLogout} className="navbar-logout-btn">Log Out</button>
            </>
          ) : (
            <>
              <Link to="/profile" className="navbar-profile-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.8rem' }}>
                <img
                  src={getAvatarUrl(user?.avatarUrl, user?.avatar, user?.gender, user?.username)}
                  alt="Avatar"
                  style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1.5px solid var(--primary-color)', background: 'var(--primary-light)', objectFit: 'cover' }}
                />
                <span>{user?.username || 'Profile'}</span>
              </Link>
              <button onClick={handleLogout} className="navbar-logout-btn">Log Out</button>
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
                  <span className="notranslate" translate="no">📊</span> <span className="sidebar-text">{t('dashboard', 'Dashboard')}</span>
                </Link>
                <Link to="/admin/user-management" className={`sidebar-item ${location.pathname === '/admin/user-management' ? 'active' : ''}`}>
                  <span className="notranslate" translate="no">👥</span> <span className="sidebar-text">{t('userManagement', 'User Management')}</span>
                </Link>
                <Link to="/admin/emission-factors" className={`sidebar-item ${location.pathname === '/admin/emission-factors' ? 'active' : ''}`}>
                  <span className="notranslate" translate="no">⚙️</span> <span className="sidebar-text">{t('emissionFactors', 'Emission Factors')}</span>
                </Link>
                <Link to="/admin/activity-monitoring" className={`sidebar-item ${location.pathname === '/admin/activity-monitoring' ? 'active' : ''}`}>
                  <span className="notranslate" translate="no">🕵️‍♂️</span> <span className="sidebar-text">{t('activityMonitoring', 'Activity Monitoring')}</span>
                </Link>

                {settings?.badges_enabled !== false && (
                  <Link to="/admin/badge-management" className={`sidebar-item ${location.pathname === '/admin/badge-management' ? 'active' : ''}`}>
                    <span className="notranslate" translate="no">🏆</span> <span className="sidebar-text">{t('badgeManagement', 'Badge Management')}</span>
                  </Link>
                )}
                {settings?.leaderboard_enabled !== false && (
                  <Link to="/admin/leaderboard-management" className={`sidebar-item ${location.pathname === '/admin/leaderboard-management' ? 'active' : ''}`}>
                    <span className="notranslate" translate="no">🏅</span> <span className="sidebar-text">{t('leaderboardManagement', 'Leaderboard Management')}</span>
                  </Link>
                )}
                <Link to="/admin/reports" className={`sidebar-item ${location.pathname === '/admin/reports' ? 'active' : ''}`}>
                  <span className="notranslate" translate="no">📂</span> <span className="sidebar-text">{t('reports', 'Reports')}</span>
                </Link>
                <Link to="/admin/analytics" className={`sidebar-item ${location.pathname === '/admin/analytics' ? 'active' : ''}`}>
                  <span className="notranslate" translate="no">📈</span> <span className="sidebar-text">{t('analytics', 'Analytics')}</span>
                </Link>
                <Link to="/admin/system-settings" className={`sidebar-item ${location.pathname === '/admin/system-settings' ? 'active' : ''}`}>
                  <span className="notranslate" translate="no">🛠️</span> <span className="sidebar-text">{t('systemSettings', 'System Settings')}</span>
                </Link>
                <Link to="/admin/support" className={`sidebar-item ${location.pathname === '/admin/support' ? 'active' : ''}`}>
                  <span className="notranslate" translate="no">🙋‍♂️</span> <span className="sidebar-text">{t('supportDashboard', 'Support Dashboard')}</span>
                </Link>
              </>
            ) : (
              // User sidebar items
              <>
                <Link to="/dashboard" className={`sidebar-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                  <span className="notranslate" translate="no">📊</span> <span className="sidebar-text">{t('dashboard', 'Dashboard')}</span>
                </Link>
                <Link to="/log-activity" className={`sidebar-item ${location.pathname === '/log-activity' ? 'active' : ''}`}>
                  <span className="notranslate" translate="no">✏️</span> <span className="sidebar-text">{t('activityLogging', 'Activity Logging')}</span>
                </Link>
                <Link to="/analytics" className={`sidebar-item ${location.pathname === '/analytics' ? 'active' : ''}`}>
                  <span className="notranslate" translate="no">📈</span> <span className="sidebar-text">{t('analytics', 'Analytics')}</span>
                </Link>
                <Link to="/sustainability-goals" className={`sidebar-item ${location.pathname === '/sustainability-goals' ? 'active' : ''}`}>
                  <span className="notranslate" translate="no">🎯</span> <span className="sidebar-text">{t('sustainabilityGoals', 'Sustainibility goals')}</span>
                </Link>
                <Link to="/recommendations" className={`sidebar-item ${location.pathname === '/recommendations' ? 'active' : ''}`}>
                  <span className="notranslate" translate="no">💡</span> <span className="sidebar-text">{t('recommendations', 'Recommendations')}</span>
                </Link>
                {settings?.leaderboard_enabled !== false && (
                  <Link to="/community-leaderboard" className={`sidebar-item ${location.pathname === '/community-leaderboard' ? 'active' : ''}`}>
                    <span className="notranslate" translate="no">👥</span> <span className="sidebar-text">{t('communityLeaderboard', 'Community Leaderboard')}</span>
                  </Link>
                )}
                {settings?.badges_enabled !== false && (
                  <Link to="/badges-leaderboard" className={`sidebar-item ${location.pathname === '/badges-leaderboard' ? 'active' : ''}`}>
                    <span className="notranslate" translate="no">🏅</span> <span className="sidebar-text">{t('badgesLeaderboard', 'Badges & Leaderboard')}</span>
                  </Link>
                )}
                <Link to="/activity-history" className={`sidebar-item ${location.pathname === '/activity-history' ? 'active' : ''}`}>
                  <span className="notranslate" translate="no">📜</span> <span className="sidebar-text">{t('activityHistory', 'My Activity History')}</span>
                </Link>
                <Link to="/profile" className={`sidebar-item ${location.pathname === '/profile' ? 'active' : ''}`}>
                  <span className="notranslate" translate="no">👤</span> <span className="sidebar-text">{t('profile', 'Profile')}</span>
                </Link>
                <Link to="/settings" className={`sidebar-item ${location.pathname === '/settings' ? 'active' : ''}`}>
                  <span className="notranslate" translate="no">⚙️</span> <span className="sidebar-text">{t('settings', 'Settings')}</span>
                </Link>
                <Link to="/support" className={`sidebar-item ${location.pathname === '/support' ? 'active' : ''}`}>
                  <span className="notranslate" translate="no">🙋‍♂️</span> <span className="sidebar-text">{t('support', 'Support')}</span>
                </Link>
              </>
            )}
            
            <button onClick={handleLogout} className="sidebar-item logout-item-btn" style={{ width: '100%', textAlign: 'left', border: 'none', background: 'transparent', cursor: 'pointer' }}>
              <span className="notranslate" translate="no">🚪</span> <span className="sidebar-text">{t('logout', 'Logout')}</span>
            </button>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="app-content">
          {children}
        </main>
      </div>

      {/* Sliding In-App Notifications Drawer */}
      <aside className={`notification-panel ${isNotificationPanelOpen ? 'open' : ''}`}>
        <div className="notification-panel-header">
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '850' }}>Notifications</h3>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
            {notifications.some(n => !n.read) && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary-color)',
                  fontSize: '0.8rem',
                  fontWeight: '750',
                  cursor: 'pointer'
                }}
              >
                Mark all read
              </button>
            )}
            <button
              onClick={() => setIsNotificationPanelOpen(false)}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.1rem',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="notification-panel-body">
          {notifications.length > 0 ? (
            notifications.map((notif) => {
              // Custom type configs
              const typeMeta = {
                ACTIVITY_LOGGED: { emoji: '🌱', color: '#10b981' },
                BADGE_EARNED: { emoji: '🏆', color: '#fbbf24' },
                GOAL_CREATED: { emoji: '🎯', color: '#3b82f6' },
                GOAL_WARNING: { emoji: '⚠️', color: '#f59e0b' },
                GOAL_COMPLETED: { emoji: '✨', color: '#10b981' },
                GOAL_FAILED: { emoji: '❌', color: '#ef4444' }
              }[notif.type] || { emoji: '🔔', color: 'var(--primary-color)' };

              const timeFormatted = new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                  className={`notification-item ${!notif.read ? 'unread' : ''}`}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.25rem',
                      flexShrink: 0
                    }}
                  >
                    {typeMeta.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', lineHeight: '1.4', color: 'var(--text-primary)', fontWeight: !notif.read ? '750' : '500' }}>
                      {notif.message}
                    </p>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{timeFormatted}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-secondary)' }}>
              <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.5rem' }}>📭</span>
              <p style={{ fontWeight: '750', fontSize: '0.92rem', margin: '0 0 0.25rem 0' }}>All caught up!</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', margin: 0 }}>Log activities or set goals to see updates here.</p>
            </div>
          )}
        </div>
      </aside>
      <ChatbotWidget />
    </div>
  );
}
