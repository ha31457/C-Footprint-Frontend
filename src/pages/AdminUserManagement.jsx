import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient from '../api/apiClient';
import CustomDropdown from '../components/CustomDropdown';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminUserManagement() {
  const [usersList, setUsersList] = useState([]);
  const [usersStat, setUsersStat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionFeedback, setActionFeedback] = useState('');

  // Search filter
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryParam = searchParams.get('search') || '';
  const [textSearch, setTextSearch] = useState(queryParam);

  // Onboard User Form Modal states
  const [showOnboardForm, setShowOnboardForm] = useState(false);
  const [onboardForm, setOnboardForm] = useState({
    username: '',
    email: '',
    password: '',
    mobileNumber: '',
    age: '',
    gender: ''
  });
  const [onboardSubmitting, setOnboardSubmitting] = useState(false);
  const [onboardError, setOnboardError] = useState('');

  // Confirm Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const triggerConfirm = (title, message, onConfirm) => {
    setModalConfig({
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setModalOpen(false);
      }
    });
    setModalOpen(true);
  };

  useEffect(() => {
    setTextSearch(queryParam);
  }, [queryParam]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [listRes, statRes] = await Promise.all([
        apiClient.get('/admin/users/all'),
        apiClient.get('/admin/users')
      ]);
      setUsersList(listRes.data || []);
      setUsersStat(statRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch platform users list.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDisableUser = async (userId) => {
    try {
      setActionFeedback('');
      setError('');
      await apiClient.delete(`/admin/users/${userId}`);
      setActionFeedback('User has been successfully disabled and logged out.');

      // Update local table state
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, disabled: true, enabled: false } : u))
      );

      // Update local stat counts
      if (usersStat) {
        setUsersStat({
          ...usersStat,
          enabledUsers: Math.max(0, usersStat.enabledUsers - 1),
          disabledUsers: usersStat.disabledUsers + 1
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable user account');
    }
  };

  const handleEnableUser = async (userId) => {
    try {
      setActionFeedback('');
      setError('');
      await apiClient.put(`/admin/users/${userId}/enable`);
      setActionFeedback('User account has been successfully re-enabled!');

      // Update local table state
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, disabled: false, enabled: true } : u))
      );

      // Update local stat counts
      if (usersStat) {
        setUsersStat({
          ...usersStat,
          enabledUsers: usersStat.enabledUsers + 1,
          disabledUsers: Math.max(0, usersStat.disabledUsers - 1)
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enable user account');
    }
  };

  const handleOnboardChange = (e) => {
    setOnboardForm({ ...onboardForm, [e.target.name]: e.target.value });
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    setOnboardError('');
    setActionFeedback('');

    // Regex check: ^\+?[1-9]\d{1,14}$
    const mobileRegex = /^\+?[1-9]\d{1,14}$/;
    if (!mobileRegex.test(onboardForm.mobileNumber)) {
      setOnboardError('Mobile number must follow standard format (e.g., +15550001111).');
      return;
    }

    const ageNum = parseInt(onboardForm.age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setOnboardError('Age must be a number between 1 and 120.');
      return;
    }

    if (!onboardForm.gender) {
      setOnboardError('Please select a gender.');
      return;
    }

    setOnboardSubmitting(true);
    try {
      const res = await apiClient.post('/admin/users', {
        username: onboardForm.username,
        email: onboardForm.email,
        password: onboardForm.password,
        mobileNumber: onboardForm.mobileNumber,
        age: ageNum,
        gender: onboardForm.gender
      });

      // Insert new onboarded user locally
      setUsersList((prev) => [res.data, ...prev]);

      // Update counters
      if (usersStat) {
        setUsersStat({
          ...usersStat,
          totalUsers: usersStat.totalUsers + 1,
          enabledUsers: usersStat.enabledUsers + 1
        });
      }

      setActionFeedback(`User '${res.data.username}' has been successfully onboarded and activated!`);
      setShowOnboardForm(false);
      // Reset form
      setOnboardForm({
        username: '',
        email: '',
        password: '',
        mobileNumber: '',
        age: '',
        gender: ''
      });
    } catch (err) {
      setOnboardError(err.response?.data?.message || 'Failed to onboard new user account.');
    } finally {
      setOnboardSubmitting(false);
    }
  };

  // Perform filtering locally
  const filteredUsers = usersList.filter((usr) => {
    const q = textSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (usr.username && usr.username.toLowerCase().includes(q)) ||
      (usr.email && usr.email.toLowerCase().includes(q)) ||
      (usr.mobileNumber && usr.mobileNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className="dashboard" style={{ maxWidth: '1000px' }}>
      {/* Reusable Confirm Dialog */}
      <ConfirmModal
        isOpen={modalOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalOpen(false)}
      />

      <header className="dashboard-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>User Management</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Verify, monitor, disable, and onboard platform user accounts
          </p>
        </div>
        <button
          onClick={() => {
            setShowOnboardForm(!showOnboardForm);
            setOnboardError('');
          }}
          className="landing-btn"
          style={{
            padding: '0.6rem 1.4rem',
            fontSize: '0.85rem',
            borderRadius: '12px',
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            fontWeight: '700',
            cursor: 'pointer'
          }}
        >
          {showOnboardForm ? 'Close Onboard Form' : 'Onboard New User'}
        </button>
      </header>

      {error && (
        <div className="error-container" style={{ marginBottom: '2rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {actionFeedback && (
        <div className="success-container" style={{ marginBottom: '2rem' }}>
          <span>✅</span>
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Onboard Form Card */}
      {showOnboardForm && (
        <div className="chart-card" style={{ padding: '2.5rem', marginBottom: '2rem', border: '1px solid var(--primary-color)' }}>
          <h3 style={{ marginBottom: '1.2rem', color: 'var(--primary-color)' }}>Onboard New User Account</h3>
          
          {onboardError && (
            <div className="error-container" style={{ marginBottom: '1.5rem' }}>
              <span>⚠️</span>
              <span>{onboardError}</span>
            </div>
          )}

          <form onSubmit={handleOnboardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
              <label>
                Username
                <input
                  type="text"
                  name="username"
                  value={onboardForm.username}
                  onChange={handleOnboardChange}
                  placeholder="e.g. staff_member"
                  required
                />
              </label>

              <label>
                Email Address
                <input
                  type="email"
                  name="email"
                  value={onboardForm.email}
                  onChange={handleOnboardChange}
                  placeholder="e.g. staff@example.com"
                  required
                />
              </label>
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
              <label>
                Temporary Password
                <input
                  type="password"
                  name="password"
                  value={onboardForm.password}
                  onChange={handleOnboardChange}
                  placeholder="At least 6 characters"
                  required
                />
              </label>

              <label>
                Mobile Number
                <input
                  type="text"
                  name="mobileNumber"
                  value={onboardForm.mobileNumber}
                  onChange={handleOnboardChange}
                  placeholder="e.g. +15550001111"
                  required
                />
              </label>
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
              <label>
                Age
                <input
                  type="number"
                  name="age"
                  min={1}
                  max={120}
                  value={onboardForm.age}
                  onChange={handleOnboardChange}
                  placeholder="e.g. 32"
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
                value={onboardForm.gender}
                onChange={(val) => setOnboardForm((prev) => ({ ...prev, gender: val }))}
              />
            </div>

            <button type="submit" disabled={onboardSubmitting} style={{ marginTop: '0.5rem', alignSelf: 'flex-start', padding: '0.7rem 2.5rem' }}>
              {onboardSubmitting ? 'Creating account...' : 'Create Active Account'}
            </button>
          </form>
        </div>
      )}

      {/* KPI Stats Mini Cards */}
      <section className="admin-stats-grid" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="chart-card stat-card" style={{ padding: '1rem 1.5rem' }}>
          <span className="stat-label" style={{ fontSize: '0.75rem' }}>Total Users</span>
          <span className="stat-value" style={{ fontSize: '1.5rem' }}>{usersStat?.totalUsers || 0}</span>
        </div>
        <div className="chart-card stat-card" style={{ padding: '1rem 1.5rem' }}>
          <span className="stat-label" style={{ fontSize: '0.75rem' }}>Verified Active</span>
          <span className="stat-value" style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>{usersStat?.enabledUsers || 0}</span>
        </div>
        <div className="chart-card stat-card" style={{ padding: '1rem 1.5rem' }}>
          <span className="stat-label" style={{ fontSize: '0.75rem' }}>Disabled Accounts</span>
          <span className="stat-value" style={{ fontSize: '1.5rem', color: '#b4233c' }}>{usersStat?.disabledUsers || 0}</span>
        </div>
      </section>

      {/* Search Input Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="text"
          className="search-input"
          placeholder="Filter users by username, email, phone number..."
          value={textSearch}
          onChange={(e) => setTextSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '460px',
            padding: '0.6rem 1rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            outline: 'none',
            background: 'rgba(255,255,255,0.7)',
            fontSize: '0.9rem',
            fontFamily: 'var(--font-family)',
          }}
        />
        {textSearch && (
          <button
            onClick={() => setTextSearch('')}
            style={{
              marginLeft: '0.8rem',
              padding: '0.55rem 1.2rem',
              background: 'transparent',
              border: '1px solid var(--text-light)',
              borderRadius: '12px',
              color: 'var(--text-secondary)',
              fontWeight: '700',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Clear Filter
          </button>
        )}
      </div>

      {/* Users management table */}
      <section className="chart-card">
        <h3 style={{ marginBottom: '1.2rem' }}>Registered Users</h3>
        {loading ? (
          <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Loading registered users...</p>
        ) : filteredUsers.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Mobile Number</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((usr) => (
                  <tr key={usr.id}>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{usr.username}</td>
                    <td>{usr.email}</td>
                    <td>{usr.mobileNumber || '-'}</td>
                    <td>{usr.age || '-'}</td>
                    <td>{usr.gender || '-'}</td>
                    <td>
                      {usr.disabled ? (
                        <span className="badge badge-disabled">Disabled</span>
                      ) : (
                        <span className="badge badge-active">Active</span>
                      )}
                    </td>
                    <td>
                      {usr.disabled ? (
                        <button
                          onClick={() => triggerConfirm(
                            'Enable Account',
                            `Are you sure you want to re-enable user '${usr.username}'? They will be allowed to log in again.`,
                            () => handleEnableUser(usr.id)
                          )}
                          className="disable-btn"
                          style={{
                            padding: '0.4rem 0.9rem',
                            fontSize: '0.8rem',
                            borderRadius: '9999px',
                            border: 'none',
                            background: 'var(--primary-color)',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: '700',
                            transition: 'all 0.2s',
                          }}
                        >
                          Enable
                        </button>
                      ) : (
                        <button
                          onClick={() => triggerConfirm(
                            'Disable Account',
                            `Are you sure you want to disable user '${usr.username}'? This will log them out instantly.`,
                            () => handleDisableUser(usr.id)
                          )}
                          className="disable-btn"
                          style={{
                            padding: '0.4rem 0.9rem',
                            fontSize: '0.8rem',
                            borderRadius: '9999px',
                            border: 'none',
                            background: 'var(--error-color)',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: '700',
                            transition: 'all 0.2s',
                          }}
                        >
                          Disable
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '1.5rem 0' }}>
            No matching users found.
          </p>
        )}
      </section>
    </div>
  );
}
