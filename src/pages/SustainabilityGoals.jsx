import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

export default function SustainabilityGoals() {
  const [activeGoals, setActiveGoals] = useState([]);
  const [goalHistory, setGoalHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Goal Creation Form State
  const [targetPercentage, setTargetPercentage] = useState(20.0);
  const [periodType, setPeriodType] = useState('WEEKLY');
  const [durationDays, setDurationDays] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Edit Goal Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [editTargetPct, setEditTargetPct] = useState(20.0);
  const [editPeriodType, setEditPeriodType] = useState('WEEKLY');
  const [editDurationDays, setEditDurationDays] = useState('');
  const [updating, setUpdating] = useState(false);

  // Cancel Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingGoalId, setCancellingGoalId] = useState(null);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingGoalId, setDeletingGoalId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Active Goals (returns List<GoalResponse> or GoalResponse)
      try {
        const activeRes = await apiClient.get('/goals/active');
        if (activeRes.status === 200 && activeRes.data) {
          const list = Array.isArray(activeRes.data) ? activeRes.data : [activeRes.data];
          setActiveGoals(list.filter((g) => g && g.id));
        } else {
          setActiveGoals([]);
        }
      } catch (err) {
        if (err.response?.status === 204) {
          setActiveGoals([]);
        } else {
          console.error('Failed to fetch active goals', err);
        }
      }

      // Fetch Goal History
      const historyRes = await apiClient.get('/goals');
      setGoalHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
    } catch (err) {
      console.error('Failed to load goals data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        targetReductionPercentage: parseFloat(targetPercentage),
        periodType: periodType,
        ...(durationDays ? { durationDays: parseInt(durationDays, 10) } : {})
      };

      await apiClient.post('/goals', payload);
      setFormSuccess('Carbon reduction goal activated successfully!');
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to set sustainability goal.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEditModal = (goal) => {
    setEditingGoal(goal);
    setEditTargetPct(goal.targetReductionPercentage || 20);
    setEditPeriodType(goal.periodType || 'WEEKLY');
    setEditDurationDays('');
    setShowEditModal(true);
  };

  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    if (!editingGoal) return;
    setUpdating(true);
    try {
      const payload = {
        targetReductionPercentage: parseFloat(editTargetPct),
        periodType: editPeriodType,
        ...(editDurationDays ? { durationDays: parseInt(editDurationDays, 10) } : {})
      };

      await apiClient.put(`/goals/${editingGoal.id}`, payload);
      setShowEditModal(false);
      setEditingGoal(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update goal.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelGoal = async () => {
    if (!cancellingGoalId) return;
    try {
      await apiClient.put(`/goals/${cancellingGoalId}/cancel`);
      setShowCancelModal(false);
      setCancellingGoalId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel goal.');
    }
  };

  const handleDeleteGoal = async () => {
    if (!deletingGoalId) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/goals/${deletingGoalId}`);
      setShowDeleteModal(false);
      setDeletingGoalId(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete goal.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="dashboard" style={{ maxWidth: '1000px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Sustainability Reduction Goals</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Establish target footprint reduction goals, monitor budget consumption, and track achievements
          </p>
        </div>
      </header>

      {loading ? (
        <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Loading goals dashboard...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Active Goals Section */}
          <section className="chart-card" style={{ padding: '2.2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.2rem', margin: 0 }}>
                <span>🎯</span> Active Reduction Targets ({activeGoals.length})
              </h3>
            </div>

            {activeGoals.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {activeGoals.map((goal) => {
                  const currentEm = goal.currentEmission ?? 0;
                  const targetEm = goal.targetEmission ?? 1;
                  const budgetConsumedPct = targetEm > 0 ? Math.min(Math.max((currentEm / targetEm) * 100, 0), 100) : 0;

                  return (
                    <div
                      key={goal.id}
                      style={{
                        padding: '1.8rem',
                        background: 'var(--bg-color)',
                        borderRadius: '16px',
                        border: '1.5px solid var(--border-color)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <span className="status-badge status-active" style={{ fontSize: '0.82rem', padding: '0.35rem 0.9rem', fontWeight: '800' }}>
                          {goal.periodType} GOAL
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          📅 {goal.startDate} to {goal.endDate}
                        </span>
                      </div>

                      {/* Dynamic Alert Banner */}
                      {goal.alertMessage && (
                        <div
                          style={{
                            padding: '1rem 1.2rem',
                            borderRadius: '12px',
                            marginBottom: '1.4rem',
                            background: goal.isOnTrack ? 'var(--primary-light)' : 'rgba(239, 68, 68, 0.1)',
                            border: `1.5px solid ${goal.isOnTrack ? 'var(--primary-color)' : 'var(--error-color)'}`,
                            color: goal.isOnTrack ? 'var(--primary-color)' : 'var(--error-color)',
                            fontWeight: '750',
                            fontSize: '0.9rem',
                            lineHeight: '1.4'
                          }}
                        >
                          {goal.alertMessage}
                        </div>
                      )}

                      {/* Metrics Grid */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.4rem' }}>
                        <div style={{ padding: '1rem', background: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'block', marginBottom: '0.3rem' }}>Target Reduction</span>
                          <span style={{ fontSize: '1.5rem', fontWeight: '850', color: 'var(--primary-color)' }}>{goal.targetReductionPercentage}%</span>
                        </div>
                        <div style={{ padding: '1rem', background: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'block', marginBottom: '0.3rem' }}>Baseline Emission</span>
                          <span style={{ fontSize: '1.5rem', fontWeight: '850' }}>{(goal.baselineEmission ?? 0).toFixed(1)} <small style={{ fontSize: '0.8rem' }}>kg</small></span>
                        </div>
                        <div style={{ padding: '1rem', background: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'block', marginBottom: '0.3rem' }}>Allowed Budget Limit</span>
                          <span style={{ fontSize: '1.5rem', fontWeight: '850', color: 'var(--accent-color)' }}>{(goal.targetEmission ?? 0).toFixed(1)} <small style={{ fontSize: '0.8rem' }}>kg</small></span>
                        </div>
                        <div style={{ padding: '1rem', background: 'var(--surface-color)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '700', display: 'block', marginBottom: '0.3rem' }}>Emissions Logged</span>
                          <span style={{ fontSize: '1.5rem', fontWeight: '850', color: goal.isOnTrack ? 'var(--text-primary)' : 'var(--error-color)' }}>
                            {(goal.currentEmission ?? 0).toFixed(1)} <small style={{ fontSize: '0.8rem' }}>kg</small>
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar: Budget Consumed */}
                      <div style={{ marginBottom: '1.4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '750', marginBottom: '0.4rem' }}>
                          <span>Emission Budget Consumed</span>
                          <span>{budgetConsumedPct.toFixed(1)}% Used</span>
                        </div>
                        <div style={{ height: '10px', background: 'var(--border-color)', borderRadius: '999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${budgetConsumedPct}%`,
                              height: '100%',
                              background: goal.isOnTrack ? 'var(--primary-color)' : 'var(--error-color)',
                              borderRadius: '999px',
                              transition: 'width 0.4s ease'
                            }}
                          />
                        </div>
                      </div>

                      {/* Goal Actions Bar */}
                      <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(goal)}
                          style={{
                            padding: '0.45rem 1rem',
                            background: 'transparent',
                            border: '1.5px solid var(--primary-color)',
                            color: 'var(--primary-color)',
                            borderRadius: '8px',
                            fontWeight: '750',
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          ✏️ Edit Goal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCancellingGoalId(goal.id);
                            setShowCancelModal(true);
                          }}
                          style={{
                            padding: '0.45rem 1rem',
                            background: 'transparent',
                            border: '1.5px solid var(--warning-color)',
                            color: 'var(--warning-color)',
                            borderRadius: '8px',
                            fontWeight: '750',
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel Goal
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeletingGoalId(goal.id);
                            setShowDeleteModal(true);
                          }}
                          style={{
                            padding: '0.45rem 1rem',
                            background: 'transparent',
                            border: '1.5px solid var(--error-color)',
                            color: 'var(--error-color)',
                            borderRadius: '8px',
                            fontWeight: '750',
                            fontSize: '0.82rem',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️ Delete Goal
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.2rem 0', color: 'var(--text-secondary)' }}>
                <p style={{ margin: '0 0 0.4rem 0', fontWeight: '700', fontSize: '1rem' }}>No active reduction goals set.</p>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-light)', margin: 0 }}>Select a period type and percentage below to activate your target!</p>
              </div>
            )}
          </section>

          {/* Premium Goal Creation Form */}
          <section className="chart-card" style={{ padding: '2.2rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.3rem' }}>
                Activate New Reduction Goal
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', margin: 0 }}>
                Choose a target reduction percentage and timeline period below. Multiple goals can run concurrently.
              </p>
            </div>

            {formError && (
              <div className="error-container" style={{ marginBottom: '1.5rem' }}>
                <span>⚠️</span>
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div style={{ padding: '1rem 1.2rem', background: 'var(--primary-light)', color: 'var(--primary-color)', borderRadius: '12px', marginBottom: '1.5rem', fontWeight: '750' }}>
                {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Custom Interactive Period Selection Cards */}
              <div>
                <label style={{ fontWeight: '750', fontSize: '0.92rem', display: 'block', marginBottom: '0.8rem', color: 'var(--text-primary)' }}>
                  1. Select Timeline Period
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                  
                  {/* Weekly Card */}
                  <div
                    onClick={() => setPeriodType('WEEKLY')}
                    style={{
                      padding: '1.2rem',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      border: `2px solid ${periodType === 'WEEKLY' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                      background: periodType === 'WEEKLY' ? 'var(--primary-light)' : 'var(--bg-color)',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>📅</div>
                    <h4 style={{ margin: '0 0 0.2rem 0', color: periodType === 'WEEKLY' ? 'var(--primary-color)' : 'var(--text-primary)', fontWeight: '800' }}>
                      Weekly Goal
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>7 Days Target Reduction</p>
                    {periodType === 'WEEKLY' && (
                      <span style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--primary-color)', fontWeight: '850' }}>✓</span>
                    )}
                  </div>

                  {/* Monthly Card */}
                  <div
                    onClick={() => setPeriodType('MONTHLY')}
                    style={{
                      padding: '1.2rem',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      border: `2px solid ${periodType === 'MONTHLY' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                      background: periodType === 'MONTHLY' ? 'var(--primary-light)' : 'var(--bg-color)',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🗓️</div>
                    <h4 style={{ margin: '0 0 0.2rem 0', color: periodType === 'MONTHLY' ? 'var(--primary-color)' : 'var(--text-primary)', fontWeight: '800' }}>
                      Monthly Goal
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>30 Days Target Reduction</p>
                    {periodType === 'MONTHLY' && (
                      <span style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--primary-color)', fontWeight: '850' }}>✓</span>
                    )}
                  </div>

                  {/* Total Card */}
                  <div
                    onClick={() => setPeriodType('TOTAL')}
                    style={{
                      padding: '1.2rem',
                      borderRadius: '16px',
                      cursor: 'pointer',
                      border: `2px solid ${periodType === 'TOTAL' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                      background: periodType === 'TOTAL' ? 'var(--primary-light)' : 'var(--bg-color)',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🎯</div>
                    <h4 style={{ margin: '0 0 0.2rem 0', color: periodType === 'TOTAL' ? 'var(--primary-color)' : 'var(--text-primary)', fontWeight: '800' }}>
                      Total Target
                    </h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Custom Goal Duration</p>
                    {periodType === 'TOTAL' && (
                      <span style={{ position: 'absolute', top: '12px', right: '12px', color: 'var(--primary-color)', fontWeight: '850' }}>✓</span>
                    )}
                  </div>

                </div>
              </div>

              {/* Target Reduction Percentage Selector & Quick Presets */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                  <label style={{ fontWeight: '750', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    2. Target Carbon Reduction Percentage
                  </label>
                  <span style={{ fontSize: '1.1rem', fontWeight: '850', color: 'var(--primary-color)' }}>
                    {targetPercentage}%
                  </span>
                </div>

                {/* Quick Presets */}
                <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
                  {[10, 20, 30, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTargetPercentage(pct)}
                      style={{
                        padding: '0.45rem 1rem',
                        borderRadius: '999px',
                        border: `1.5px solid ${targetPercentage === pct ? 'var(--primary-color)' : 'var(--border-color)'}`,
                        background: targetPercentage === pct ? 'var(--primary-color)' : 'transparent',
                        color: targetPercentage === pct ? '#ffffff' : 'var(--text-primary)',
                        fontWeight: '750',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {pct}% {pct === 20 ? '(Recommended)' : ''}
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={targetPercentage}
                  onChange={(e) => setTargetPercentage(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
              </div>

              {/* Custom Duration (Optional) */}
              <div className="form-group">
                <label htmlFor="durationDays" style={{ fontWeight: '750', fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                  3. Custom Duration in Days (Optional)
                </label>
                <input
                  id="durationDays"
                  type="number"
                  min="1"
                  placeholder="Leave empty for default timeline"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="form-control"
                  style={{ marginTop: '0.4rem', borderRadius: '10px' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-submit"
                style={{
                  alignSelf: 'flex-start',
                  padding: '0.9rem 2.5rem',
                  fontWeight: '800',
                  borderRadius: '12px',
                  fontSize: '0.95rem'
                }}
              >
                {submitting ? 'Activating Goal...' : 'Activate Goal'}
              </button>
            </form>
          </section>

          {/* Goal History Table */}
          <section className="chart-card" style={{ padding: '2.2rem' }}>
            <h3 style={{ marginBottom: '1.2rem', fontSize: '1.25rem' }}>Goal Audit History</h3>
            {goalHistory.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Period Type</th>
                      <th>Target Reduction %</th>
                      <th>Baseline CO₂</th>
                      <th>Target Budget</th>
                      <th>Status</th>
                      <th>Timeline Dates</th>
                    </tr>
                  </thead>
                  <tbody>
                    {goalHistory.map((goal) => (
                      <tr key={goal.id}>
                        <td style={{ fontWeight: '700' }}>{goal.periodType}</td>
                        <td style={{ fontWeight: '850', color: 'var(--primary-color)' }}>{goal.targetReductionPercentage}%</td>
                        <td>{(goal.baselineEmission ?? 0).toFixed(1)} kg</td>
                        <td>{(goal.targetEmission ?? 0).toFixed(1)} kg</td>
                        <td>
                          <span
                            className={`status-badge ${
                              goal.status === 'ACTIVE'
                                ? 'status-active'
                                : goal.status === 'CANCELLED'
                                ? 'status-disabled'
                                : 'status-active'
                            }`}
                          >
                            {goal.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {goal.startDate} to {goal.endDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p style={{ color: 'var(--text-light)', fontStyle: 'italic', fontSize: '0.9rem' }}>No past goal records logged.</p>
            )}
          </section>

        </div>
      )}

      {/* Edit Goal Modal */}
      {showEditModal && editingGoal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal" style={{ maxWidth: '480px', padding: '2rem' }}>
            <h3>Edit Sustainability Goal</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
              Update your target reduction percentage and timeline for this goal.
            </p>

            <form onSubmit={handleUpdateGoal} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="form-group">
                <label style={{ fontWeight: '750', fontSize: '0.88rem' }}>
                  Target Reduction Percentage: {editTargetPct}%
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="1"
                  value={editTargetPct}
                  onChange={(e) => setEditTargetPct(parseFloat(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer', marginTop: '0.4rem' }}
                />
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '750', fontSize: '0.88rem' }}>Timeline Period</label>
                <select
                  value={editPeriodType}
                  onChange={(e) => setEditPeriodType(e.target.value)}
                  className="form-control"
                  style={{ marginTop: '0.4rem' }}
                >
                  <option value="WEEKLY">WEEKLY (7 Days)</option>
                  <option value="MONTHLY">MONTHLY (30 Days)</option>
                  <option value="TOTAL">TOTAL (Custom)</option>
                </select>
              </div>

              <div className="form-group">
                <label style={{ fontWeight: '750', fontSize: '0.88rem' }}>Custom Duration in Days (Optional)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Leave blank to preserve current timeline"
                  value={editDurationDays}
                  onChange={(e) => setEditDurationDays(e.target.value)}
                  className="form-control"
                  style={{ marginTop: '0.4rem' }}
                />
              </div>

              <div className="modal-actions" style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingGoal(null);
                  }}
                  className="btn-modal-cancel"
                >
                  Cancel
                </button>
                <button type="submit" disabled={updating} className="btn-modal-confirm">
                  {updating ? 'Saving...' : 'Save Goal Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Goal Modal */}
      {showCancelModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <h3>Cancel Active Goal?</h3>
            <p>Are you sure you want to cancel this active sustainability reduction target? This action cannot be undone.</p>
            <div className="modal-actions">
              <button onClick={() => setShowCancelModal(false)} className="btn-modal-cancel">
                Keep Goal
              </button>
              <button onClick={handleCancelGoal} className="btn-modal-confirm">
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Goal Modal */}
      {showDeleteModal && (
        <div className="custom-modal-overlay">
          <div className="custom-modal">
            <h3>Delete Goal?</h3>
            <p>Are you sure you want to permanently delete this goal? It will be removed from your active and historical audit logs.</p>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteModal(false)} className="btn-modal-cancel">
                Keep Goal
              </button>
              <button onClick={handleDeleteGoal} disabled={deleting} className="btn-modal-confirm" style={{ background: 'var(--error-color)' }}>
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
