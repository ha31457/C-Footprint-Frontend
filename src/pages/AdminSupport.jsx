import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

export default function AdminSupport() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering & Modal States
  const [filterTab, setFilterTab] = useState('ALL'); // ALL, PENDING, RESOLVED
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/support');
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve support tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const openReplyModal = (complaint) => {
    setSelectedComplaint(complaint);
    setReplyText('');
    setModalError('');
    setModalSuccess('');
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalSuccess('');
    setSubmittingReply(true);

    try {
      await apiClient.post(`/admin/support/${selectedComplaint.id}/reply`, {
        replyText
      });
      setModalSuccess('Reply submitted successfully! The user has been notified.');
      setTimeout(() => {
        setSelectedComplaint(null);
        fetchComplaints();
      }, 1200);
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to submit support reply.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (filterTab === 'PENDING') return !c.resolved;
    if (filterTab === 'RESOLVED') return c.resolved;
    return true;
  });

  if (loading) return <div className="loading-screen">Loading support dashboard...</div>;

  return (
    <div className="dashboard" style={{ maxWidth: '1350px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1>User Support Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Review, audit, and reply to complaints raised by community members
          </p>
        </div>
      </header>

      {error && (
        <div className="error-container" style={{ marginBottom: '2rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <section style={{ display: 'flex', gap: '0.8rem', marginBottom: '2.2rem', flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'RESOLVED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            style={{
              padding: '0.65rem 1.4rem',
              borderRadius: '10px',
              border: 'none',
              background: filterTab === tab ? 'var(--primary-color)' : 'var(--surface-color)',
              color: filterTab === tab ? '#ffffff' : 'var(--text-secondary)',
              fontWeight: '750',
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s',
              border: filterTab === tab ? 'none' : '1px solid var(--border-color)'
            }}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()} ({
              tab === 'ALL' ? complaints.length :
              tab === 'PENDING' ? complaints.filter(c => !c.resolved).length :
              complaints.filter(c => c.resolved).length
            })
          </button>
        ))}
      </section>

      {/* Grid List of support tickets */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((c) => (
            <div
              key={c.id}
              className="chart-card"
              style={{
                padding: '1.8rem 2rem',
                borderLeft: `4px solid ${c.resolved ? '#10b981' : '#f59e0b'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{c.email}</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginLeft: '1rem' }}>
                    📅 {new Date(c.createdAt).toLocaleString()}
                  </span>
                  <div style={{ marginTop: '0.35rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '99px', background: 'var(--primary-light)', color: 'var(--primary-color)', fontWeight: '700' }}>
                      🏷️ {c.category || 'General'}
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '999px',
                    fontWeight: '800',
                    background: c.resolved ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                    color: c.resolved ? '#10b981' : '#f59e0b',
                    border: `1px solid ${c.resolved ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                  }}
                >
                  {c.resolved ? 'Resolved' : 'Pending Action'}
                </span>
              </div>

              <p style={{
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.5',
                background: 'var(--bg-color)',
                padding: '1.1rem 1.4rem',
                borderRadius: '12px',
                margin: '0 0 1.2rem 0',
                border: '1px solid var(--border-color)'
              }}>
                {c.complaintText}
              </p>

              {c.resolved ? (
                <div style={{
                  background: 'var(--primary-light)',
                  padding: '1.1rem 1.4rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 92, 246, 0.15)'
                }}>
                  <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary-color)', display: 'block', letterSpacing: '0.04em', marginBottom: '0.35rem' }}>
                    ✍️ Admin Reply ({c.repliedAt ? new Date(c.repliedAt).toLocaleString() : 'Just now'})
                  </strong>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0, lineHeight: '1.45' }}>
                    {c.replyText}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => openReplyModal(c)}
                  className="btn-submit"
                  style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', width: 'fit-content' }}
                >
                  ✍️ Reply & Resolve Ticket
                </button>
              )}
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>📂</span>
            <p style={{ fontWeight: '750', fontSize: '1rem', margin: 0 }}>No support tickets found in this tab.</p>
          </div>
        )}
      </section>

      {/* Reply Modal */}
      {selectedComplaint && (
        <div className="modal-overlay" style={{ zIndex: 100 }}>
          <div className="modal-content" style={{ maxWidth: '560px', width: '90%' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Resolve Support Ticket</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 1.2rem 0' }}>
              Replying to user: <strong style={{ color: 'var(--text-primary)' }}>{selectedComplaint.email}</strong> &bull; 🏷️ {selectedComplaint.category || 'General'}
            </p>

            {modalSuccess && (
              <div style={{ padding: '0.8rem 1rem', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', borderRadius: '10px', marginBottom: '1rem', fontWeight: '750', fontSize: '0.85rem' }}>
                {modalSuccess}
              </div>
            )}
            {modalError && (
              <div style={{ padding: '0.8rem 1rem', background: 'rgba(239, 68, 68, 0.12)', color: 'var(--error-color)', borderRadius: '10px', marginBottom: '1rem', fontWeight: '750', fontSize: '0.85rem' }}>
                {modalError}
              </div>
            )}

            <div style={{
              background: 'var(--bg-color)',
              padding: '1rem',
              borderRadius: '12px',
              maxHeight: '120px',
              overflowY: 'auto',
              border: '1px solid var(--border-color)',
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              lineHeight: '1.45',
              marginBottom: '1.2rem'
            }}>
              <strong>Complaint:</strong> {selectedComplaint.complaintText}
            </div>

            <form onSubmit={handleSendReply} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '750', fontSize: '0.88rem', marginBottom: '0.45rem' }}>
                  Your Official Response
                </label>
                <textarea
                  placeholder="Type the resolution details here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  required
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.85rem 1rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--surface-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.92rem',
                    outline: 'none',
                    resize: 'none',
                    lineHeight: '1.4'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-modal-cancel"
                  style={{ flex: 1 }}
                  onClick={() => setSelectedComplaint(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReply}
                  className="btn-modal-confirm"
                  style={{ flex: 1 }}
                >
                  {submittingReply ? 'Submitting resolution...' : 'Send Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
