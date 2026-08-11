import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

export default function OrgAdminPanel() {
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // 1. Stats & User Analytics States
  const [summaryStats, setSummaryStats] = useState(null);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [activitiesRange, setActivitiesRange] = useState('monthly');
  const [activitiesAnalytics, setActivitiesAnalytics] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState('');

  // 2. Employees roster & provisioning States
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState('');
  
  const [empForm, setEmpForm] = useState({ username: '', email: '', temporaryPassword: '' });
  const [provisionSuccess, setProvisionSuccess] = useState('');
  const [provisionError, setProvisionError] = useState('');
  const [provisioning, setProvisioning] = useState(false);

  // Inspecting single employee activities
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [empActivities, setEmpActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);

  // 3. Search and Filter Activity Logs States
  const [filterLogs, setFilterLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState('');
  const [logFilters, setLogFilters] = useState({
    range: '',
    date: '',
    category: ''
  });

  // 4. Scoped Leaderboard States
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [leaderboardError, setLeaderboardError] = useState('');

  // 5. Scoped Complaints States
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(true);
  const [complaintsError, setComplaintsError] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  // Export File states
  const [exporting, setExporting] = useState(null);

  // Fetch Overview Data
  const fetchOverviewData = async () => {
    setOverviewLoading(true);
    setOverviewError('');
    try {
      const [summaryRes, usersRes, actRes] = await Promise.all([
        apiClient.get('/org-admin/reports/summary'),
        apiClient.get('/org-admin/analytics/users'),
        apiClient.get(`/org-admin/analytics/activities?range=${activitiesRange}`)
      ]);
      setSummaryStats(summaryRes.data);
      setUserAnalytics(usersRes.data);
      setActivitiesAnalytics(actRes.data);
    } catch (err) {
      console.error('[OrgAdmin] Error fetching overview data:', err);
      setOverviewError('Failed to fetch analytics datasets.');
    } finally {
      setOverviewLoading(false);
    }
  };

  // Fetch Employees List
  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    setEmployeesError('');
    try {
      const response = await apiClient.get('/org-admin/employees');
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('[OrgAdmin] Roster fetch failed:', err);
      setEmployeesError('Failed to load employee list.');
    } finally {
      setEmployeesLoading(false);
    }
  };

  // Fetch Logged Activities Stream
  const fetchActivities = async () => {
    setLogsLoading(true);
    setLogsError('');
    try {
      const { range, date, category } = logFilters;
      const params = {};
      if (range) params.range = range;
      if (date) params.date = date;
      if (category) params.category = category;

      const response = await apiClient.get('/org-admin/activities', { params });
      setFilterLogs(response.data?.activities || response.data || []);
    } catch (err) {
      console.error('[OrgAdmin] Activities list load error:', err);
      setLogsError('Failed to search activity logs.');
    } finally {
      setLogsLoading(false);
    }
  };

  // Fetch Scoped Leaderboard rankings
  const fetchLeaderboard = async () => {
    setLeaderboardLoading(true);
    setLeaderboardError('');
    try {
      const response = await apiClient.get('/org-admin/leaderboard');
      // Format checks: accept direct array or wrapped entries
      const list = Array.isArray(response.data)
        ? response.data
        : (response.data?.entries || response.data?.rankings || []);
      setLeaderboard(list);
    } catch (err) {
      console.error('[OrgAdmin] Scoped leaderboard load error:', err);
      setLeaderboardError('Failed to load organization standings.');
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Fetch Scoped Complaints
  const fetchComplaints = async () => {
    setComplaintsLoading(true);
    setComplaintsError('');
    try {
      const response = await apiClient.get('/org-admin/support');
      setComplaints(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('[OrgAdmin] Scoped complaints fetch failed:', err);
      setComplaintsError('Failed to retrieve employee complaints.');
    } finally {
      setComplaintsLoading(false);
    }
  };

  // Watchers for initial and tab switching mounts
  useEffect(() => {
    fetchOverviewData();
  }, [activitiesRange]);

  useEffect(() => {
    if (activeTab === 'employees') fetchEmployees();
    if (activeTab === 'logs') fetchActivities();
    if (activeTab === 'leaderboard') fetchLeaderboard();
    if (activeTab === 'support') fetchComplaints();
  }, [activeTab]);

  // Provision new employee
  const handleProvision = async (e) => {
    e.preventDefault();
    setProvisioning(true);
    setProvisionSuccess('');
    setProvisionError('');

    try {
      await apiClient.post('/org-admin/employees', empForm);
      setProvisionSuccess(`Account for "${empForm.username}" provisioned successfully!`);
      setEmpForm({ username: '', email: '', temporaryPassword: '' });
      fetchEmployees();
      setTimeout(() => setProvisionSuccess(''), 4000);
    } catch (err) {
      console.error('[OrgAdmin] Provisioning employee failed:', err);
      setProvisionError(err.response?.data?.message || 'Failed to provision employee credentials.');
    } finally {
      setProvisioning(false);
    }
  };

  // Disable account
  const handleDisableEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to suspend this employee? They will be locked out of the app.')) return;
    try {
      await apiClient.put(`/org-admin/employees/${employeeId}/disable`);
      fetchEmployees();
    } catch (err) {
      console.error('[OrgAdmin] Disabling employee failed:', err);
      alert(err.response?.data?.message || 'Failed to suspend employee account.');
    }
  };

  // Enable account
  const handleEnableEmployee = async (employeeId) => {
    try {
      await apiClient.put(`/org-admin/employees/${employeeId}/enable`);
      fetchEmployees();
    } catch (err) {
      console.error('[OrgAdmin] Enabling employee failed:', err);
      alert(err.response?.data?.message || 'Failed to restore employee account.');
    }
  };

  // Inspect employee activities logs list
  const handleInspectEmployee = async (emp) => {
    setSelectedEmp(emp);
    setActivitiesLoading(true);
    setEmpActivities([]);
    try {
      const response = await apiClient.get(`/org-admin/employees/${emp.id}/activities`);
      setEmpActivities(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('[OrgAdmin] Failed to load inspect activities:', err);
      alert('Failed to inspect employee activities.');
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Support complaint replying
  const handleReplyComplaint = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setReplyLoading(true);
    try {
      await apiClient.post(`/org-admin/support/${replyTarget.id}/reply`, {
        replyText: replyText
      });
      setReplyText('');
      setReplyTarget(null);
      fetchComplaints();
      alert('Reply submitted successfully!');
    } catch (err) {
      console.error('[OrgAdmin] Reply submission failed:', err);
      alert(err.response?.data?.message || 'Failed to submit complaint resolution reply.');
    } finally {
      setReplyLoading(false);
    }
  };

  // Download export documents
  const handleExport = async (format) => {
    setExporting(format);
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}/org-admin/reports/export?format=${format}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error('File export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `org_report.${format === 'word' ? 'docx' : format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(`[OrgAdmin] Report export failed:`, err);
      alert(`Failed to export organization summary as ${format.toUpperCase()}.`);
    } finally {
      setExporting(null);
    }
  };

  const breakdown = summaryStats?.categoryBreakdown || {};
  const totalCategoryCo2 = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="dashboard" style={{ maxWidth: '1280px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1>Organization Management Panel</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Monitor corporate carbon reduction footprints, provision employees, and moderate support reports
          </p>
        </div>
      </header>

      {/* Main tab control buttons */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'overview', label: '📊 Dashboard Overview' },
          { id: 'employees', label: '👥 Employee Roster' },
          { id: 'logs', label: '📜 Activity Search' },
          { id: 'leaderboard', label: '🏅 Org Leaderboard' },
          { id: 'support', label: '🙋‍♂️ Support Tickets' },
          { id: 'export', label: '📥 Download Exports' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '800',
              fontSize: '0.85rem',
              cursor: 'pointer',
              background: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
              color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.25s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW & ANALYTICS TAB */}
      {activeTab === 'overview' && (
        <div>
          {overviewError && (
            <div className="error-container" style={{ marginBottom: '2rem' }}>
              <span>⚠️</span> <span>{overviewError}</span>
            </div>
          )}

          {overviewLoading ? (
            <div>Loading statistics...</div>
          ) : (
            <div>
              {/* Summary Cards */}
              <div className="chart-grid" style={{ marginBottom: '2rem' }}>
                
                {/* Users Count Card */}
                <div className="chart-card stat-card" style={{ borderTop: '4px solid var(--primary-color)' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    👥 Employee Directory
                  </span>
                  <span style={{ fontSize: '2rem', fontWeight: '850', color: 'var(--text-primary)', marginTop: '0.4rem', display: 'block' }}>
                    {userAnalytics?.totalUsers || 0} <small style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-light)' }}>Total</small>
                  </span>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem', fontWeight: '750' }}>
                    <span style={{ color: 'var(--primary-color)' }}>🟢 {userAnalytics?.enabledUsers || 0} Active</span>
                    <span style={{ color: 'var(--error-color)' }}>🔴 {userAnalytics?.disabledUsers || 0} Suspended</span>
                  </div>
                </div>

                {/* Carbon Audit card */}
                <div className="chart-card stat-card" style={{ borderTop: '4px solid #8b5cf6' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    🌱 Carbon Audited
                  </span>
                  <span style={{ fontSize: '2rem', fontWeight: '850', color: '#8b5cf6', marginTop: '0.4rem', display: 'block' }}>
                    {summaryStats?.totalCo2?.toFixed(1) || '0.0'} <small style={{ fontSize: '0.88rem' }}>kg CO₂e</small>
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '0.5rem', display: 'block' }}>
                    Average {summaryStats?.averageCo2PerUser?.toFixed(1) || '0.0'} kg per active profile
                  </span>
                </div>

                {/* General Stats summary */}
                <div className="chart-card stat-card" style={{ borderTop: '4px solid #eab308' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    🏆 Milestone badges
                  </span>
                  <span style={{ fontSize: '2rem', fontWeight: '850', color: '#eab308', marginTop: '0.4rem', display: 'block' }}>
                    {summaryStats?.badgesAwarded || 0} <small style={{ fontSize: '0.88rem' }}>Awarded</small>
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginTop: '0.5rem', display: 'block' }}>
                    Total logged activities: <strong>{summaryStats?.totalLogs || 0}</strong>
                  </span>
                </div>

              </div>

              {/* Advanced Activity Analytics & Category breakdown */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.2rem' }}>
                
                {/* Category breakdown */}
                <div className="chart-card">
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '850', marginBottom: '1.5rem' }}>
                    Category Breakdown
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    {Object.keys(breakdown).length > 0 ? (
                      Object.entries(breakdown).map(([cat, val]) => {
                        const pct = ((val / totalCategoryCo2) * 100).toFixed(0);
                        return (
                          <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '750' }}>
                              <span style={{ textTransform: 'capitalize' }}>
                                {cat === 'transport' ? '🚗 Transport' : cat === 'energy' ? '⚡ Energy' : cat}
                              </span>
                              <span style={{ color: 'var(--text-secondary)' }}>
                                {val.toFixed(1)} kg ({pct}%)
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '99px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: cat === 'transport' ? 'var(--primary-color)' : '#8b5cf6', borderRadius: '99px' }} />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p style={{ color: 'var(--text-light)', fontStyle: 'italic', margin: 0 }}>No category breakdown stats logged yet.</p>
                    )}
                  </div>
                </div>

                {/* Range Filter Activity stats */}
                <div className="chart-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.8rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '850' }}>
                      Emissions Activity Analytics
                    </h3>
                    <select
                      value={activitiesRange}
                      onChange={(e) => setActivitiesRange(e.target.value)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-color)',
                        color: 'var(--text-primary)',
                        fontWeight: '750',
                        fontSize: '0.78rem',
                        outline: 'none'
                      }}
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 1rem', background: 'var(--bg-color)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '750', color: 'var(--text-secondary)' }}>Range Emissions Sum:</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: '850', color: 'var(--primary-color)' }}>
                        {activitiesAnalytics?.totalCo2EmissionKgs?.toFixed(2) || activitiesAnalytics?.totalCo2?.toFixed(2) || activitiesAnalytics?.totalCo2Emission?.toFixed(2) || '0.00'} kg
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem 1rem', background: 'var(--bg-color)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: '750', color: 'var(--text-secondary)' }}>Activity Submissions:</span>
                      <span style={{ fontSize: '0.95rem', fontWeight: '850', color: 'var(--text-primary)' }}>
                        {activitiesAnalytics?.activityCount || activitiesAnalytics?.totalLogs || 0} submissions
                      </span>
                    </div>

                    <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', margin: '0.2rem 0 0 0', lineHeight: '1.4' }}>
                      * Emissions analytics compile metrics corresponding to logs completed within the selected range bucket.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. EMPLOYEES ROSTER TAB */}
      {activeTab === 'employees' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem' }}>
          
          {/* Employees List */}
          <div className="chart-card" style={{ minWidth: '450px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', marginBottom: '1.5rem' }}>
              Employee Directory
            </h3>

            {employeesError && (
              <div className="error-container" style={{ marginBottom: '1rem' }}>
                <span>⚠️</span> <span>{employeesError}</span>
              </div>
            )}

            {employeesLoading ? (
              <div>Loading employees...</div>
            ) : employees.length === 0 ? (
              <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>No employee profiles provisioned yet.</p>
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

          {/* Forms & Inspectors stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Provisioning Form */}
            <div className="chart-card">
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '850', marginBottom: '1.2rem' }}>
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

            {/* Inspect employee activities */}
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
                  <p style={{ color: 'var(--text-light)', fontStyle: 'italic', margin: 0 }}>No activities logged yet.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '320px', overflowY: 'auto', paddingRight: '0.2rem' }}>
                    {empActivities.map((act) => (
                      <div key={act.id} style={{ padding: '0.8rem', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: '750' }}>
                          <span style={{ textTransform: 'capitalize' }}>
                            {act.category === 'transport' ? '🚗' : act.category === 'energy' ? '⚡' : '🌱'} {act.category} ({act.activityType})
                          </span>
                          <span style={{ color: 'var(--primary-color)' }}>-{act.co2Emission?.toFixed(1) || '0.0'} kg CO₂</span>
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
      )}

      {/* 3. SEARCH & FILTER ACTIVITY LOGS TAB */}
      {activeTab === 'logs' && (
        <div>
          {/* Filters Form */}
          <div className="chart-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '850', marginBottom: '1.2rem' }}>
              🔍 Search Filters
            </h3>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <label style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem', fontWeight: '750', color: 'var(--text-secondary)' }}>
                Range
                <select
                  value={logFilters.range}
                  onChange={(e) => setLogFilters({ ...logFilters, range: e.target.value })}
                  style={{ padding: '0.55rem 0.8rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none' }}
                >
                  <option value="">All Ranges</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </label>

              <label style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem', fontWeight: '750', color: 'var(--text-secondary)' }}>
                Specific Date (YYYY-MM-DD)
                <input
                  type="date"
                  value={logFilters.date}
                  onChange={(e) => setLogFilters({ ...logFilters, date: e.target.value })}
                  style={{ padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </label>

              <label style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.75rem', fontWeight: '750', color: 'var(--text-secondary)' }}>
                Category
                <select
                  value={logFilters.category}
                  onChange={(e) => setLogFilters({ ...logFilters, category: e.target.value })}
                  style={{ padding: '0.55rem 0.8rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none' }}
                >
                  <option value="">All Categories</option>
                  <option value="transport">Transport</option>
                  <option value="energy">Energy</option>
                  <option value="food">Food</option>
                  <option value="waste">Waste</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <button
                onClick={fetchActivities}
                className="btn-submit"
                style={{ padding: '0.65rem 1.4rem', fontWeight: '800' }}
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Results table */}
          <div className="chart-card">
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', marginBottom: '1.5rem' }}>
              Corporate Logged Activities List
            </h3>

            {logsError && (
              <div className="error-container" style={{ marginBottom: '1rem' }}>
                <span>⚠️</span> <span>{logsError}</span>
              </div>
            )}

            {logsLoading ? (
              <div>Searching activities...</div>
            ) : filterLogs.length === 0 ? (
              <p style={{ color: 'var(--text-light)', fontStyle: 'italic', margin: 0 }}>No matching activity logs found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="history-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                      <th style={{ padding: '0.8rem' }}>Employee</th>
                      <th style={{ padding: '0.8rem' }}>Category</th>
                      <th style={{ padding: '0.8rem' }}>Type</th>
                      <th style={{ padding: '0.8rem' }}>Amount</th>
                      <th style={{ padding: '0.8rem' }}>Date</th>
                      <th style={{ padding: '0.8rem', textAlign: 'right' }}>Emissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterLogs.map((log) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.8rem', fontWeight: '750' }}>{log.username || 'Employee'}</td>
                        <td style={{ padding: '0.8rem', textTransform: 'capitalize' }}>{log.category}</td>
                        <td style={{ padding: '0.8rem', color: 'var(--text-secondary)' }}>{log.activityType}</td>
                        <td style={{ padding: '0.8rem' }}>{log.quantity} {log.unit}</td>
                        <td style={{ padding: '0.8rem' }}>{log.logDate}</td>
                        <td style={{ padding: '0.8rem', textAlign: 'right', fontWeight: '800', color: 'var(--primary-color)' }}>
                          -{log.co2Emission?.toFixed(1) || '0.0'} kg
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. SCOPED LEADERBOARD TAB */}
      {activeTab === 'leaderboard' && (
        <div className="chart-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', marginBottom: '1.5rem' }}>
            🏆 Corporate Standings Leaderboard
          </h3>

          {leaderboardError && (
            <div className="error-container" style={{ marginBottom: '1rem' }}>
              <span>⚠️</span> <span>{leaderboardError}</span>
            </div>
          )}

          {leaderboardLoading ? (
            <div>Loading standings...</div>
          ) : leaderboard.length === 0 ? (
            <p style={{ color: 'var(--text-light)', fontStyle: 'italic', margin: 0 }}>No standings registered.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="history-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '0.8rem', width: '80px' }}>Rank</th>
                    <th style={{ padding: '0.8rem' }}>Employee</th>
                    <th style={{ padding: '0.8rem', textAlign: 'right' }}>Total Carbon Reduced</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((item, index) => {
                    const rankNum = item.rank || index + 1;
                    return (
                      <tr key={item.username || index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.8rem' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: rankNum === 1 ? 'rgba(234,179,8,0.1)' : rankNum === 2 ? 'rgba(156,163,175,0.1)' : 'rgba(0,0,0,0.05)',
                              color: rankNum === 1 ? '#eab308' : rankNum === 2 ? '#6b7280' : 'var(--text-secondary)',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: '850',
                              fontSize: '0.8rem'
                            }}
                          >
                            {rankNum === 1 ? '👑' : rankNum}
                          </span>
                        </td>
                        <td style={{ padding: '0.8rem', fontWeight: '750' }}>{item.username}</td>
                        <td style={{ padding: '0.8rem', textAlign: 'right', fontWeight: '850', color: 'var(--primary-color)' }}>
                          🌱 {item.totalCo2Emission?.toFixed(1) || item.totalCo2?.toFixed(1) || '0.0'} kg
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. SUPPORT COMPLAINTS TAB */}
      {activeTab === 'support' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem' }}>
          
          {/* Complaints list */}
          <div className="chart-card" style={{ minWidth: '450px' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', marginBottom: '1.5rem' }}>
              Employee Support Complaints
            </h3>

            {complaintsError && (
              <div className="error-container" style={{ marginBottom: '1rem' }}>
                <span>⚠️</span> <span>{complaintsError}</span>
              </div>
            )}

            {complaintsLoading ? (
              <div>Loading support tickets...</div>
            ) : complaints.length === 0 ? (
              <p style={{ color: 'var(--text-light)', fontStyle: 'italic', margin: 0 }}>No support complaints filed.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {complaints.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="stat-card"
                    style={{
                      padding: '1.2rem',
                      borderRadius: '16px',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-color)',
                      borderLeft: ticket.resolved ? '4px solid var(--primary-color)' : '4px solid var(--error-color)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: '750' }}>
                      <span>👤 {ticket.username || 'Employee'}</span>
                      <span style={{ color: ticket.resolved ? 'var(--primary-color)' : 'var(--error-color)' }}>
                        {ticket.resolved ? 'Resolved' : 'Open Ticket'}
                      </span>
                    </div>

                    <h4 style={{ margin: '0.6rem 0 0.2rem 0', fontSize: '0.9rem', fontWeight: '800' }}>{ticket.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{ticket.description}</p>
                    
                    {ticket.replyText && (
                      <div style={{ marginTop: '0.8rem', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--text-light)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <strong>Response:</strong> {ticket.replyText}
                      </div>
                    )}

                    {!ticket.resolved && (
                      <button
                        onClick={() => setReplyTarget(ticket)}
                        className="btn-submit"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.72rem', borderRadius: '6px', marginTop: '0.8rem' }}
                      >
                        ✍️ Reply & Resolve
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reply Form Section */}
          <div>
            {replyTarget ? (
              <div className="chart-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '850' }}>
                    Resolve Ticket #{replyTarget.id}
                  </h3>
                  <button onClick={() => setReplyTarget(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
                </div>

                <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  <strong>Complaint Title:</strong> {replyTarget.title} <br />
                  <strong>Detail:</strong> {replyTarget.description}
                </div>

                <form onSubmit={handleReplyComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem', fontWeight: '750', color: 'var(--text-secondary)' }}>
                    Resolution Text
                    <textarea
                      required
                      rows={4}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="e.g. Resolved. Please check your dashboard logs again."
                      style={{
                        padding: '0.7rem 0.9rem',
                        borderRadius: '10px',
                        border: '1.5px solid var(--border-color)',
                        background: 'var(--bg-color)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '0.82rem',
                        fontFamily: 'inherit',
                        resize: 'vertical'
                      }}
                    />
                  </label>
                  <button type="submit" disabled={replyLoading} className="btn-submit" style={{ padding: '0.75rem', fontWeight: '850' }}>
                    {replyLoading ? 'Submitting resolution...' : 'Send Reply & Close Ticket'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2.5rem' }}>
                <span style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💬</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '850' }}>Complaint Resolution</h3>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '300px' }}>
                  Select an open support ticket on the left to write an official resolution reply and automatically toggle its status to resolved.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. DOWNLOAD EXPORTS TAB */}
      {activeTab === 'export' && (
        <section className="chart-card" style={{ padding: '2rem', borderLeft: '5px solid var(--primary-color)' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: '850' }}>
            📥 Export Corporate Records
          </h3>
          <p style={{ margin: '0.3rem 0 1.5rem 0', fontSize: '0.88rem', color: 'var(--text-light)', lineHeight: '1.4' }}>
            Download spreadsheets or print-ready reports compiling employee logged emissions, organization statistics, and reduction analytics.
          </p>

          <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => handleExport('pdf')}
              disabled={exporting !== null}
              className="btn-submit"
              style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#ffffff', padding: '0.8rem 1.6rem', border: 'none', fontWeight: '800' }}
            >
              {exporting === 'pdf' ? 'Generating PDF...' : '📄 Download PDF Report'}
            </button>
            <button
              onClick={() => handleExport('word')}
              disabled={exporting !== null}
              className="btn-submit"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#ffffff', padding: '0.8rem 1.6rem', border: 'none', fontWeight: '800' }}
            >
              {exporting === 'word' ? 'Generating DOCX...' : '📝 Download Word (DOCX)'}
            </button>
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting !== null}
              className="btn-submit"
              style={{ background: 'linear-gradient(135deg, #10b981, #047857)', color: '#ffffff', padding: '0.8rem 1.6rem', border: 'none', fontWeight: '800' }}
            >
              {exporting === 'csv' ? 'Generating CSV...' : '📊 Download CSV File'}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
