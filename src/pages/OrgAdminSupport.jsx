import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export default function OrgAdminSupport() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.get('/org-admin/support');
      setComplaints(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('[OrgAdminSupport] Scoped support fetch failed:', err);
      setError('Failed to retrieve corporate employee support tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

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
      alert('Official resolution reply submitted successfully!');
    } catch (err) {
      console.error('[OrgAdminSupport] Resolution reply failed:', err);
      alert(err.response?.data?.message || 'Failed to submit resolving ticket response.');
    } finally {
      setReplyLoading(false);
    }
  };

  return (
    <div className="dashboard" style={{ maxWidth: '1280px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1>Corporate Support Tickets</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Moderate scoped complaints, write resolutions, and answer questions submitted by your employees
          </p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2.5rem' }}>
        
        {/* Complaints registry */}
        <div className="chart-card" style={{ minWidth: '450px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '850', marginBottom: '1.5rem' }}>
            Support Tickets Registry
          </h3>

          {error && (
            <div className="error-container" style={{ marginBottom: '1rem' }}>
              <span>⚠️</span> <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div>Loading corporate feedback registry...</div>
          ) : complaints.length === 0 ? (
            <p style={{ color: 'var(--text-light)', fontStyle: 'italic', margin: 0 }}>No employee complaints filed.</p>
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
                      {ticket.resolved ? 'Resolved' : 'Open'}
                    </span>
                  </div>

                  <h4 style={{ margin: '0.6rem 0 0.2rem 0', fontSize: '0.9rem', fontWeight: '800' }}>{ticket.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{ticket.description}</p>
                  
                  {ticket.replyText && (
                    <div style={{ marginTop: '0.8rem', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--text-light)', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <strong>Resolution Response:</strong> {ticket.replyText}
                    </div>
                  )}

                  {!ticket.resolved && (
                    <button
                      onClick={() => setReplyTarget(ticket)}
                      className="btn-submit"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.72rem', borderRadius: '6px', marginTop: '0.8rem' }}
                    >
                      ✍️ Resolve Ticket
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply resolving panel */}
        <div>
          {replyTarget ? (
            <div className="chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '850' }}>
                  Resolve Support Case #{replyTarget.id}
                </h3>
                <button onClick={() => setReplyTarget(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
              </div>

              <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <strong>Title:</strong> {replyTarget.title} <br />
                <strong>Detail:</strong> {replyTarget.description}
              </div>

              <form onSubmit={handleReplyComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.78rem', fontWeight: '750', color: 'var(--text-secondary)' }}>
                  Resolution text
                  <textarea
                    required
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Describe how the complaint was resolved..."
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
                  {replyLoading ? 'Submitting resolution...' : 'Send Resolution & Close Ticket'}
                </button>
              </form>
            </div>
          ) : (
            <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '2.5rem' }}>
              <span style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💬</span>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '850' }}>Ticket Resolution</h3>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '300px' }}>
                Select an open employee ticket on the left to write an official resolution reply and automatically toggle its status to resolved.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
