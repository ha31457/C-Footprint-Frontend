import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export default function AdminOrganizationManagement() {
  const [orgs, setOrgs] = useState([]);
  const [orgsLoading, setOrgsLoading] = useState(true);
  const [orgsError, setOrgsError] = useState('');

  // Creation form states
  const [newOrgName, setNewOrgName] = useState('');
  const [creationSuccess, setCreationSuccess] = useState('');
  const [creationError, setCreationError] = useState('');
  const [creatingOrg, setCreatingOrg] = useState(false);

  // Admin Assignment form states
  const [assignForm, setAssignForm] = useState({
    orgId: '',
    username: '',
    email: '',
    password: '',
  });
  const [assignSuccess, setAssignSuccess] = useState('');
  const [assignError, setAssignError] = useState('');
  const [assigningAdmin, setAssigningAdmin] = useState(false);

  const fetchOrganizations = async () => {
    setOrgsLoading(true);
    setOrgsError('');
    try {
      const response = await apiClient.get('/admin/organizations');
      setOrgs(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('[AdminOrg] Failed to fetch organizations:', err);
      setOrgsError('Failed to fetch existing organizations.');
    } finally {
      setOrgsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleCreateOrg = async (e) => {
    e.preventDefault();
    setCreatingOrg(true);
    setCreationSuccess('');
    setCreationError('');

    try {
      const response = await apiClient.post('/admin/organizations', {
        name: newOrgName
      });
      setCreationSuccess(`Organization "${newOrgName}" created successfully!`);
      setNewOrgName('');
      
      // Refresh organization listing or append locally
      if (response.data) {
        setOrgs((prev) => [...prev, response.data]);
      } else {
        fetchOrganizations();
      }
      setTimeout(() => setCreationSuccess(''), 4000);
    } catch (err) {
      console.error('[AdminOrg] Creation failed:', err);
      setCreationError(err.response?.data?.message || 'Failed to create organization.');
    } finally {
      setCreatingOrg(false);
    }
  };

  const handleAssignAdmin = async (e) => {
    e.preventDefault();
    if (!assignForm.orgId) {
      setAssignError('Please select an organization.');
      return;
    }

    setAssigningAdmin(true);
    setAssignSuccess('');
    setAssignError('');

    try {
      await apiClient.post(`/admin/organizations/${assignForm.orgId}/admin`, {
        username: assignForm.username,
        email: assignForm.email,
        password: assignForm.password,
      });

      setAssignSuccess(`Administrator "${assignForm.username}" assigned successfully!`);
      setAssignForm({ orgId: '', username: '', email: '', password: '' });
      setTimeout(() => setAssignSuccess(''), 4000);
    } catch (err) {
      console.error('[AdminOrg] Assignment failed:', err);
      setAssignError(err.response?.data?.message || 'Failed to assign administrator credentials.');
    } finally {
      setAssigningAdmin(false);
    }
  };

  return (
    <div className="dashboard" style={{ maxWidth: '1280px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1>Corporate Organizations Management</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Register new corporate entities and assign administrator logins
          </p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
        
        {/* Create Organization Form */}
        <div className="chart-card">
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', marginBottom: '1.5rem' }}>
            🏢 Create New Organization
          </h3>
          
          {creationSuccess && (
            <div className="success-container" style={{ marginBottom: '1rem', padding: '0.8rem', borderRadius: '10px' }}>
              <span>✅</span> <span>{creationSuccess}</span>
            </div>
          )}
          {creationError && (
            <div className="error-container" style={{ marginBottom: '1rem', padding: '0.8rem', borderRadius: '10px' }}>
              <span>⚠️</span> <span>{creationError}</span>
            </div>
          )}

          <form onSubmit={handleCreateOrg} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem', fontWeight: '750', color: 'var(--text-secondary)' }}>
              Organization Name
              <input
                type="text"
                required
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                placeholder="e.g. Eco Corp Ltd"
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
            <button
              type="submit"
              disabled={creatingOrg}
              className="btn-submit"
              style={{ padding: '0.8rem', fontWeight: '800' }}
            >
              {creatingOrg ? 'Creating...' : 'Create Organization'}
            </button>
          </form>
        </div>

        {/* Assign Admin Form */}
        <div className="chart-card">
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', marginBottom: '1.5rem' }}>
            🔑 Create Organization Admin
          </h3>

          {assignSuccess && (
            <div className="success-container" style={{ marginBottom: '1rem', padding: '0.8rem', borderRadius: '10px' }}>
              <span>✅</span> <span>{assignSuccess}</span>
            </div>
          )}
          {assignError && (
            <div className="error-container" style={{ marginBottom: '1rem', padding: '0.8rem', borderRadius: '10px' }}>
              <span>⚠️</span> <span>{assignError}</span>
            </div>
          )}

          <form onSubmit={handleAssignAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem', fontWeight: '750', color: 'var(--text-secondary)' }}>
              Target Organization
              <select
                required
                value={assignForm.orgId}
                onChange={(e) => setAssignForm({ ...assignForm, orgId: e.target.value })}
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
              >
                <option value="">-- Choose Organization --</option>
                {orgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem', fontWeight: '750', color: 'var(--text-secondary)' }}>
              Admin Username
              <input
                type="text"
                required
                value={assignForm.username}
                onChange={(e) => setAssignForm({ ...assignForm, username: e.target.value })}
                placeholder="e.g. eco_admin"
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
              Admin Email Address
              <input
                type="email"
                required
                value={assignForm.email}
                onChange={(e) => setAssignForm({ ...assignForm, email: e.target.value })}
                placeholder="e.g. admin@corp.com"
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
              Initial Password
              <input
                type="password"
                required
                minLength={6}
                value={assignForm.password}
                onChange={(e) => setAssignForm({ ...assignForm, password: e.target.value })}
                placeholder="At least 6 characters"
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

            <button
              type="submit"
              disabled={assigningAdmin}
              className="btn-submit"
              style={{ padding: '0.8rem', fontWeight: '800' }}
            >
              {assigningAdmin ? 'Assigning...' : 'Assign Administrator'}
            </button>
          </form>
        </div>

      </div>

      {/* Organizations Listing Grid */}
      <section className="chart-card">
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', marginBottom: '1.5rem' }}>
          🏢 Registered Organizations
        </h3>
        {orgsLoading ? (
          <div>Loading list...</div>
        ) : orgsError ? (
          <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>{orgsError}</p>
        ) : orgs.length === 0 ? (
          <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No organizations registered yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                  <th style={{ padding: '0.8rem' }}>ID</th>
                  <th style={{ padding: '0.8rem' }}>Organization Name</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((org) => (
                  <tr key={org.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.8rem', color: 'var(--text-light)', fontFamily: 'monospace' }}>{org.id}</td>
                    <td style={{ padding: '0.8rem', fontWeight: '750' }}>{org.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
