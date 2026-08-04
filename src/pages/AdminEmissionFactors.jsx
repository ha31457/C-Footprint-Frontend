import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import CustomDropdown from '../components/CustomDropdown';
import ConfirmModal from '../components/ConfirmModal';

const CATEGORY_OPTIONS = [
  { value: 'transport', label: 'Transport' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'food', label: 'Food' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'recycling', label: 'Recycling' },
  { value: 'other', label: 'Other / Custom' },
];

const UNIT_OPTIONS = [
  { value: 'km', label: 'km' },
  { value: 'kWh', label: 'kWh' },
  { value: 'servings', label: 'servings' },
  { value: 'USD', label: 'USD' },
  { value: 'count', label: 'count' },
  { value: 'items', label: 'items' },
  { value: 'other', label: 'other' },
];

export default function AdminEmissionFactors() {
  const [factors, setFactors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  // Creation State
  const [showAddForm, setShowAddForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    category: '',
    activityType: '',
    factor: '',
    unit: ''
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);

  // Editing State
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    factor: '',
    unit: ''
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

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

  const fetchFactors = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/admin/emission-factors');
      setFactors(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch platform emission factors.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFactors();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFeedback('');

    if (!createForm.category) {
      setError('Please select a category.');
      return;
    }
    if (!createForm.activityType.trim()) {
      setError('Please enter an activity type code.');
      return;
    }
    const factorNum = parseFloat(createForm.factor);
    if (isNaN(factorNum) || factorNum < 0) {
      setError('Emission factor value must be a positive number.');
      return;
    }
    if (!createForm.unit) {
      setError('Please select a unit.');
      return;
    }

    setCreateSubmitting(true);
    try {
      const res = await apiClient.post('/admin/emission-factors', {
        category: createForm.category,
        activityType: createForm.activityType.toUpperCase().trim(),
        factor: factorNum,
        unit: createForm.unit
      });

      setFactors((prev) => [res.data, ...prev]);
      setFeedback(`Emission factor '${res.data.activityType}' created successfully!`);
      setShowAddForm(false);
      setCreateForm({ category: '', activityType: '', factor: '', unit: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create emission factor.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const startEdit = (factorObj) => {
    setEditingId(factorObj.id);
    setEditForm({
      factor: factorObj.factor,
      unit: factorObj.unit
    });
  };

  const handleUpdateSubmit = async (e, factorId) => {
    e.preventDefault();
    setError('');
    setFeedback('');

    const factorNum = parseFloat(editForm.factor);
    if (isNaN(factorNum) || factorNum < 0) {
      setError('Factor value must be a positive number.');
      return;
    }
    if (!editForm.unit) {
      setError('Please select a unit.');
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await apiClient.put(`/admin/emission-factors/${factorId}`, {
        factor: factorNum,
        unit: editForm.unit
      });

      setFactors((prev) =>
        prev.map((f) => (f.id === factorId ? { ...f, factor: res.data.factor, unit: res.data.unit } : f))
      );
      setFeedback('Emission factor updated successfully!');
      setEditingId(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update emission factor.');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (factorId, activityType) => {
    try {
      setError('');
      setFeedback('');
      await apiClient.delete(`/admin/emission-factors/${factorId}`);
      setFactors((prev) => prev.filter((f) => f.id !== factorId));
      setFeedback(`Emission factor '${activityType}' successfully deleted.`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete emission factor.');
    }
  };

  return (
    <div className="dashboard" style={{ maxWidth: '1280px' }}>
      <ConfirmModal
        isOpen={modalOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalOpen(false)}
      />

      <header className="dashboard-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Emission Factors</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Configure and audit greenhouse coefficent values for activity categories
          </p>
        </div>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setError('');
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
          {showAddForm ? 'Close Add Form' : 'Add New Factor'}
        </button>
      </header>

      {error && (
        <div className="error-container" style={{ marginBottom: '2rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {feedback && (
        <div className="success-container" style={{ marginBottom: '2rem' }}>
          <span>✅</span>
          <span>{feedback}</span>
        </div>
      )}

      {/* Add Form Card */}
      {showAddForm && (
        <div className="chart-card" style={{ padding: '2.5rem', marginBottom: '2rem', border: '1px solid var(--primary-color)' }}>
          <h3 style={{ marginBottom: '1.2rem', color: 'var(--primary-color)' }}>Create Emission Factor</h3>
          
          <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
              <CustomDropdown
                label="Category"
                placeholder="Select Category"
                options={CATEGORY_OPTIONS}
                value={createForm.category}
                onChange={(val) => setCreateForm((prev) => ({ ...prev, category: val }))}
              />

              <label>
                Activity Type (Unique Code)
                <input
                  type="text"
                  value={createForm.activityType}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, activityType: e.target.value }))}
                  placeholder="e.g. ELECTRICITY_SOLAR"
                  required
                />
              </label>
            </div>

            <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.2rem' }}>
              <label>
                Factor Value (kg CO2e per unit)
                <input
                  type="number"
                  step="0.0001"
                  value={createForm.factor}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, factor: e.target.value }))}
                  placeholder="e.g. 0.45"
                  required
                />
              </label>

              <CustomDropdown
                label="Unit"
                placeholder="Select Unit"
                options={UNIT_OPTIONS}
                value={createForm.unit}
                onChange={(val) => setCreateForm((prev) => ({ ...prev, unit: val }))}
              />
            </div>

            <button type="submit" disabled={createSubmitting} style={{ marginTop: '0.5rem', alignSelf: 'flex-start', padding: '0.7rem 2.5rem' }}>
              {createSubmitting ? 'Creating factor...' : 'Create Factor'}
            </button>
          </form>
        </div>
      )}

      {/* Factors Table Card */}
      <section className="chart-card">
        <h3 style={{ marginBottom: '1.2rem' }}>Emissions Factor Directory</h3>
        {loading ? (
          <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Loading emission factors...</p>
        ) : factors.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Activity Type</th>
                  <th>Unit</th>
                  <th>Factor (kg CO2e)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {factors.map((f) => {
                  const isEditing = editingId === f.id;
                  return (
                    <tr key={f.id}>
                      <td style={{ textTransform: 'capitalize', fontWeight: '700' }}>{f.category}</td>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{f.activityType}</span>
                      </td>
                      <td>
                        {isEditing ? (
                          <div style={{ width: '130px' }}>
                            <CustomDropdown
                              placeholder="Unit"
                              options={UNIT_OPTIONS}
                              value={editForm.unit}
                              onChange={(val) => setEditForm((prev) => ({ ...prev, unit: val }))}
                            />
                          </div>
                        ) : (
                          f.unit
                        )}
                      </td>
                      <td style={{ fontWeight: '800', color: 'var(--primary-color)' }}>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.0001"
                            value={editForm.factor}
                            onChange={(e) => setEditForm((prev) => ({ ...prev, factor: e.target.value }))}
                            style={{ width: '100px', padding: '0.4rem', fontSize: '0.9rem', height: '36px' }}
                            required
                          />
                        ) : (
                          f.factor
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={(e) => handleUpdateSubmit(e, f.id)}
                              disabled={editSubmitting}
                              className="disable-btn"
                              style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.75rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'var(--primary-color)',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '700'
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="disable-btn"
                              style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.75rem',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                background: 'transparent',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontWeight: '700'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => startEdit(f)}
                              className="disable-btn"
                              style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.75rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'var(--primary-light)',
                                color: 'var(--primary-color)',
                                cursor: 'pointer',
                                fontWeight: '700'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => triggerConfirm(
                                'Delete Factor',
                                `Are you sure you want to delete the emission factor for '${f.activityType}'? Active calculations using this category might be affected.`,
                                () => handleDelete(f.id, f.activityType)
                              )}
                              className="disable-btn"
                              style={{
                                padding: '0.4rem 0.8rem',
                                fontSize: '0.75rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'var(--error-color)',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: '700'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem 0' }}>
            No platform emission factors registered.
          </p>
        )}
      </section>
    </div>
  );
}
