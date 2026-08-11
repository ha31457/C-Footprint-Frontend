import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export default function OrgAdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [empForm, setEmpForm] = useState({ username: '', email: '', temporaryPassword: '' });
  const [provisionSuccess, setProvisionSuccess] = useState('');
  const [provisionError, setProvisionError] = useState('');
  const [provisioning, setProvisioning] = useState(false);

  // Inspecting single employee activities
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [empActivities, setEmpActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/org-admin/employees');
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('[OrgAdminEmployees] Failed to fetch roster:', err);
      setError('Failed to retrieve employee rosters.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleProvision = async (e) => {
    e.preventDefault();
    setProvisioning(true);
    setProvisionSuccess('');
    setProvisionError('');

    try {
      await apiClient.post('/org-admin/employees', empForm);
      setProvisionSuccess(`Employee "${empForm.username}" provisioned successfully!`);
      setEmpForm({ username: '', email: '', temporaryPassword: '' });
      fetchEmployees();
      setTimeout(() => setProvisionSuccess(''), 4000);
    } catch (err) {
      console.error('[OrgAdminEmployees] Provision failed:', err);
      setProvisionError(err.response?.data?.message || 'Failed to provision employee credentials.');
    } finally {
      setProvisioning(false);
    }
  };

  const handleDisableEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to suspend this employee? They will lose access to the platform.')) return;
    try {
      await apiClient.put(`/org-admin/employees/${employeeId}/disable`);
      fetchEmployees();
    } catch (err) {
      console.error('[OrgAdminEmployees] Disable employee failed:', err);
      alert(err.response?.data?.message || 'Failed to suspend employee account.');
    }
  };

  const handleEnableEmployee = async (employeeId) => {
    try {
      await apiClient.put(`/org-admin/employees/${employeeId}/enable`);
      fetchEmployees();
    } catch (err) {
      console.error('[OrgAdminEmployees] Enable employee failed:', err);
      alert(err.response?.data?.message || 'Failed to restore employee account.');
    }
  };

  const handleInspectEmployee = async (emp) => {
    setSelectedEmp(emp);
    setActivitiesLoading(true);
    setEmpActivities([]);
    try {
      const response = await apiClient.get(`/org-admin/employees/${emp.id}/activities`);
      setEmpActivities(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('[OrgAdminEmployees] Logs inspect failed:', err);
      alert('Failed to inspect employee activities.');
    } finally {
      setActivitiesLoading(false);
    }
  };

  return (
    <div className="dashboard" style={{ maxWidth: '1280px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1>Employee Directory</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Provision user login accounts, suspend/restore access, and audit employee carbon transaction histories
          </p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem' }}>
        
        {/* Roster Table */}
        <div className="chart-card" style={{ minWidth: '450px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', marginBottom: '1.5rem' }}>
            Employees Listing
          </h3>

          {error && (
            <div className="error-container" style={{ marginBottom: '1rem' }}>
              <span>⚠️</span> <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div>Loading employee registry...</div>
          ) : employees.length === 0 ? (
            <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No employees registered yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="history-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '0.8rem' }}>Username</th>
                    <th style={{ padding: '0.8rem' }}>Status</th>
                    <th style={{ padding: '0.8rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.8rem' }}>
                        <div style={{ fontWeight: '750' }}>{emp.username}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-light)' }}>{emp.email}</div>
                      </td>
                      <td style={{ padding: '0.8rem' }}>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '999px',
                            fontWeight: '750',
                            background: emp.enabled ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                            color: emp.enabled ? 'var(--primary-color)' : 'var(--error-color)'
                          }}
                        >
                          {emp.enabled ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td style={{ padding: '0.8rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleInspectEmployee(emp)}
                            className="btn-submit"
                            style={{ padding: '0.35rem 0.7rem', fontSize: '0.7rem', borderRadius: '6px' }}
                          >
                            🔍 Logs
                          </button>
                          {emp.enabled ? (
                            <button
                              onClick={() => handleDisableEmployee(emp.id)}
                              style={{
                                padding: '0.35rem 0.7rem',
                                fontSize: '0.7rem',
                                borderRadius: '6px',
                                border: 'none',
                                background: 'rgba(239,68,68,0.1)',
                                color: 'var(--error-color)',
                                fontWeight: '750',
                                cursor: 'pointer'
                              }}
                            >
                              🔴 Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEnableEmployee(emp.id)}
                              style={{
                                padding: '0.35rem 0.7rem',
                                fontSize: '0.7rem',
                                borderRadius: '6px',
                                border: 'none',
                                background: 'rgba(16,185,129,0.1)',
                                color: 'var(--primary-color)',
                                fontWeight: '750',
                                cursor: 'pointer'
                              }}
                            >
                              🟢 Restore
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Stack: Provision form & activity inspect */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Provision form */}
          <div className="chart-card">
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', marginBottom: '1.2rem' }}>
              ➕ Provision Employee
            </h3>

            {provisionSuccess && (
              <div className="success-container" style={{ marginBottom: '1rem', padding: '0.8rem', borderRadius: '10px' }}>
                <span>✅</span> <span>{provisionSuccess}</span>
              </div>
            )}
            {provisionError && (
              <div className="error-container" style={{ marginBottom: '1rem', padding: '0.8rem', borderRadius: '10px' }}>
                <span>⚠️</span> <span>{provisionError}</span>
              </div>
            )}

            <form onSubmit={handleProvision} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.78rem', fontWeight: '750', color: 'var(--text-secondary)' }}>
                Username
                <input
                  type="text"
                  required
                  value={empForm.username}
                  onChange={(e) => setEmpForm({ ...empForm, username: e.target.value })}
                  placeholder="e.g. ecoemployee"
                  style={{ padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.82rem' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.78rem', fontWeight: '750', color: 'var(--text-secondary)' }}>
                Email Address
                <input
                  type="email"
                  required
                  value={empForm.email}
                  onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                  placeholder="e.g. emp@ecocorp.com"
                  style={{ padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.82rem' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.78rem', fontWeight: '750', color: 'var(--text-secondary)' }}>
                Temporary Password
                <input
                  type="text"
                  required
                  value={empForm.temporaryPassword}
                  onChange={(e) => setEmpForm({ ...empForm, temporaryPassword: e.target.value })}
                  placeholder="At least 6 characters"
                  style={{ padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none', fontSize: '0.82rem' }}
                />
              </label>
              <button type="submit" disabled={provisioning} className="btn-submit" style={{ padding: '0.75rem', marginTop: '0.4rem', fontWeight: '850' }}>
                {provisioning ? 'Provisioning...' : 'Provision Employee'}
              </button>
            </form>
          </div>

          {/* Inspect details */}
          {selectedEmp && (
            <div className="chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '850' }}>
                  Logs: {selectedEmp.username}
                </h3>
                <button onClick={() => setSelectedEmp(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
              </div>

              {activitiesLoading ? (
                <div>Loading logged activities...</div>
              ) : empActivities.length === 0 ? (
                <p style={{ color: 'var(--text-light)', fontStyle: 'italic', margin: 0 }}>No logged carbon footprint activities found.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '0.2rem' }}>
                  {empActivities.map((act) => (
                    <div key={act.id} style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '750' }}>
                        <span style={{ textTransform: 'capitalize' }}>
                          {act.category === 'transport' ? '🚗' : act.category === 'energy' ? '⚡' : '🌱'} {act.category} ({act.activityType})
                        </span>
                        <span style={{ color: 'var(--primary-color)' }}>-{act.co2Emission?.toFixed(1) || '0.0'} kg</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                        <span>Amount: {act.quantity} {act.unit}</span>
                        <span>Logged: {act.logDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
