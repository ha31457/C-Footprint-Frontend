import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function Support() {
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  
  // Submit states
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Predefined Categories from server
  const [categories, setCategories] = useState([]);

  // Ticket history states (for logged-in users)
  const [tickets, setTickets] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/support/categories');
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to retrieve support categories:', err);
    }
  };

  const fetchTickets = async () => {
    if (!isAuthenticated) return;
    setHistoryLoading(true);
    try {
      const res = await apiClient.get('/support/me');
      const ticketList = Array.isArray(res.data) ? res.data : [];
      setTickets(ticketList);
      
      if (ticketList.length === 0) {
        setShowNewForm(true);
      } else {
        setSelectedTicket(ticketList[0]);
        setShowNewForm(false);
      }
    } catch (err) {
      console.error('Failed to fetch personal tickets:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setEmail(user?.email || '');
      fetchTickets();
    } else {
      setEmail('');
      setTickets([]);
      setSelectedTicket(null);
      setShowNewForm(true);
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiClient.post('/support', {
        email,
        category,
        complaintText
      });
      setSuccess('Your support ticket has been submitted. An administrator will reply to your registered email shortly.');
      setComplaintText('');
      setCategory('');
      
      if (isAuthenticated) {
        // Reload list and switch view back to list
        const res = await apiClient.get('/support/me');
        const updatedList = Array.isArray(res.data) ? res.data : [];
        setTickets(updatedList);
        if (updatedList.length > 0) {
          // Auto select the newly submitted ticket (first in sorted list)
          setSelectedTicket(updatedList[0]);
          setShowNewForm(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit support request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 1. Simple layout for guest users
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--bg-color)'
      }}>
        <div className="animated-bg-container" style={{ opacity: 0.7 }}>
          <div className="bg-blob bg-blob-1" style={{ top: '10%', left: '10%' }} />
          <div className="bg-blob bg-blob-2" style={{ bottom: '15%', right: '10%' }} />
        </div>

        <div className="chart-card" style={{
          maxWidth: '540px',
          width: '100%',
          padding: '2.5rem 2rem',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-xl)',
          background: 'var(--card-gradient)',
          borderTop: '4px solid var(--primary-color)',
          zIndex: 5
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.6rem' }}>🙋‍♂️</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '850', margin: 0 }}>Public Help & Support</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              Submit a support ticket regarding account queries or platform diagnostics.
            </p>
          </div>

          {success && (
            <div style={{
              padding: '1rem 1.2rem',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              borderRadius: '12px',
              marginBottom: '1.5rem',
              fontWeight: '750',
              fontSize: '0.88rem',
              lineHeight: '1.45',
              border: '1px solid rgba(16, 185, 129, 0.25)'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: '750', fontSize: '0.88rem', marginBottom: '0.45rem', color: 'var(--text-primary)' }}>
                Registered Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. user@example.com"
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: error ? '1.5px solid var(--error-color)' : '1px solid var(--border-color)',
                  background: 'var(--surface-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
              {error && (
                <span style={{
                  color: 'var(--error-color)',
                  fontSize: '0.8rem',
                  fontWeight: '750',
                  marginTop: '0.4rem',
                  display: 'block'
                }}>
                  ⚠️ {error}
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '750', fontSize: '0.88rem', marginBottom: '0.45rem', color: 'var(--text-primary)' }}>
                Problem Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--surface-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: '750', fontSize: '0.88rem', marginBottom: '0.45rem', color: 'var(--text-primary)' }}>
                Complaint Description / Message
              </label>
              <textarea
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Explain the issue you are experiencing in detail..."
                required
                rows={5}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--surface-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none',
                  resize: 'none',
                  transition: 'all 0.2s',
                  lineHeight: '1.45'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
              style={{ width: '100%', padding: '0.95rem', marginTop: '0.4rem' }}
            >
              {loading ? 'Submitting ticket...' : 'Submit Support Request'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.6rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.2rem' }}>
            <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: '750', textDecoration: 'none', fontSize: '0.88rem' }}>
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Dual Pane Dashboard for Authenticated users
  return (
    <div className="dashboard" style={{ maxWidth: '1350px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Help & Support Center</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Browse ticket histories, resolve complaint chats, and file help center tickets
          </p>
        </div>
      </header>

      {historyLoading && tickets.length === 0 ? (
        <div className="loading-screen">Loading support history...</div>
      ) : (
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* Left Column: Tickets list thread navigation */}
          <div style={{ width: '330px', display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '280px' }}>
            <button
              onClick={() => {
                setShowNewForm(true);
                setSelectedTicket(null);
                setSuccess('');
                setError('');
                setCategory('');
              }}
              className="btn-submit"
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              ➕ Create New Ticket
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '480px', overflowY: 'auto' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Your Support Tickets ({tickets.length})
              </span>

              {tickets.length > 0 ? (
                tickets.map((t) => {
                  const isActive = selectedTicket?.id === t.id && !showNewForm;
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTicket(t);
                        setShowNewForm(false);
                        setSuccess('');
                        setError('');
                      }}
                      className="chart-card"
                      style={{
                        padding: '1rem 1.25rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        border: isActive ? '1.5px solid var(--primary-color)' : '1px solid var(--border-color)',
                        background: isActive ? 'var(--primary-light)' : 'var(--surface-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                          📅 {new Date(t.createdAt).toLocaleDateString()}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '99px',
                            fontWeight: '800',
                            background: t.resolved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                            color: t.resolved ? '#10b981' : '#f59e0b',
                            border: `1.1px solid ${t.resolved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'}`
                          }}
                        >
                          {t.resolved ? 'Resolved' : 'Pending'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.68rem', padding: '0.05rem 0.35rem', borderRadius: '4px', background: 'var(--border-color)', color: 'var(--text-secondary)' }}>
                          {t.category || 'General'}
                        </span>
                      </div>
                      <p style={{
                        margin: 0,
                        fontSize: '0.85rem',
                        color: 'var(--text-primary)',
                        fontWeight: '750',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {t.complaintText}
                      </p>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-light)', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>
                  No previous tickets found.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Dynamic views */}
          <div className="chart-card" style={{ flex: 1, minWidth: '320px', minHeight: '520px', display: 'flex', flexDirection: 'column', padding: '2.2rem' }}>
            
            {showNewForm ? (
              // Option A: Submit form
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.25rem' }}>Create Support Complaint</h3>

                {success && (
                  <div style={{ padding: '0.8rem 1rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '10px', marginBottom: '1.2rem', fontSize: '0.85rem', fontWeight: '750' }}>
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: '750', fontSize: '0.85rem', marginBottom: '0.45rem' }}>
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-color)',
                        color: 'var(--text-light)',
                        fontSize: '0.92rem',
                        cursor: 'not-allowed'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: '750', fontSize: '0.85rem', marginBottom: '0.45rem' }}>
                      Problem Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.8rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--surface-color)',
                        color: 'var(--text-primary)',
                        fontSize: '0.92rem',
                        outline: 'none'
                      }}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <label style={{ display: 'block', fontWeight: '750', fontSize: '0.85rem', marginBottom: '0.45rem' }}>
                      Complaint Description
                    </label>
                    <textarea
                      value={complaintText}
                      onChange={(e) => setComplaintText(e.target.value)}
                      placeholder="Explain your queries or technical issues..."
                      required
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
                        lineHeight: '1.4',
                        flex: 1,
                        minHeight: '160px'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-submit"
                    style={{ width: '100%', padding: '0.85rem' }}
                  >
                    {loading ? 'Submitting ticket...' : 'Submit Support Request'}
                  </button>
                </form>
              </div>
            ) : selectedTicket ? (
              // Option B: Render Chat bubbles
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
                
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Ticket Conversation</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                        ID: {selectedTicket.id}
                      </span>
                      <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: '99px', background: 'var(--primary-light)', color: 'var(--primary-color)', fontWeight: '700' }}>
                        {selectedTicket.category || 'General'}
                      </span>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.35rem 0.8rem',
                      borderRadius: '99px',
                      fontWeight: '800',
                      background: selectedTicket.resolved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: selectedTicket.resolved ? '#10b981' : '#f59e0b',
                      border: `1.1px solid ${selectedTicket.resolved ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)'}`
                    }}
                  >
                    {selectedTicket.resolved ? 'Resolved' : 'Awaiting Reply'}
                  </span>
                </div>

                {/* Chat container */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, overflowY: 'auto', padding: '1rem', background: 'var(--bg-color)', borderRadius: '16px', border: '1px solid var(--border-color)', minHeight: '300px' }}>
                  
                  {/* User bubble (Right aligned) */}
                  <div style={{ alignSelf: 'flex-end', maxWidth: '82%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginBottom: '0.2rem' }}>
                      {user?.username} &bull; {new Date(selectedTicket.createdAt).toLocaleString()}
                    </span>
                    <div style={{
                      padding: '0.85rem 1.2rem',
                      background: 'var(--primary-color)',
                      color: '#ffffff',
                      borderRadius: '16px 16px 2px 16px',
                      fontSize: '0.92rem',
                      lineHeight: '1.45',
                      boxShadow: 'var(--shadow-sm)',
                      wordBreak: 'break-word'
                    }}>
                      {selectedTicket.complaintText}
                    </div>
                  </div>

                  {/* Admin reply (Left aligned) */}
                  {selectedTicket.resolved && selectedTicket.replyText ? (
                    <div style={{ alignSelf: 'flex-start', maxWidth: '82%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginBottom: '0.2rem' }}>
                        🛠️ Support Agent &bull; {new Date(selectedTicket.repliedAt || selectedTicket.createdAt).toLocaleString()}
                      </span>
                      <div style={{
                        padding: '0.85rem 1.2rem',
                        background: 'var(--surface-color)',
                        color: 'var(--text-primary)',
                        borderRadius: '16px 16px 16px 2px',
                        fontSize: '0.92rem',
                        lineHeight: '1.45',
                        boxShadow: 'var(--shadow-sm)',
                        border: '1px solid var(--border-color)',
                        wordBreak: 'break-word'
                      }}>
                        {selectedTicket.replyText}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      alignSelf: 'flex-start',
                      padding: '0.75rem 1.2rem',
                      background: 'rgba(245, 158, 11, 0.08)',
                      color: '#f59e0b',
                      borderRadius: '12px',
                      fontSize: '0.82rem',
                      border: '1px solid rgba(245, 158, 11, 0.15)',
                      fontStyle: 'italic',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <span>🕒</span>
                      <span>An administrator is reviewing your ticket. Replies will appear here.</span>
                    </div>
                  )}

                </div>

              </div>
            ) : (
              // Option C: Empty active state
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-secondary)', padding: '2rem' }}>
                <span style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>💬</span>
                <p style={{ fontWeight: '750', fontSize: '1rem', margin: 0 }}>No Ticket Selected</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: '0.25rem 0 0 0' }}>
                  Select an item from the history list or click Create Ticket to submit a request.
                </p>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
