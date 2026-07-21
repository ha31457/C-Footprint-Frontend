import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import CustomDropdown from '../components/CustomDropdown';

const CATEGORY_FILTER_OPTIONS = [
  { value: '', label: 'All Categories' },
  { value: 'transport', label: 'Transport' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'food', label: 'Food' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'waste', label: 'Waste' },
  { value: 'water', label: 'Water' },
  { value: 'heating', label: 'Heating' },
  { value: 'other', label: 'Other / Custom' },
];

const RANGE_FILTER_OPTIONS = [
  { value: '', label: 'All Time Presets' },
  { value: 'daily', label: 'Daily (Today)' },
  { value: 'weekly', label: 'Weekly (Last 7 Days)' },
  { value: 'monthly', label: 'Monthly (Last 30 Days)' },
  { value: 'yearly', label: 'Yearly (Last 365 Days)' },
  { value: 'custom', label: 'Custom Date Range...' },
];

export default function UserActivityHistory() {
  const [history, setHistory] = useState([]);
  const [totalCo2, setTotalCo2] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters State
  const [filters, setFilters] = useState({
    category: '',
    range: '',
    date: '',
    startDate: '',
    endDate: ''
  });

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.range) params.range = filters.range;
      if (filters.date) params.date = filters.date;
      
      if (filters.range === 'custom') {
        if (filters.startDate) params.startDate = filters.startDate;
        if (filters.endDate) params.endDate = filters.endDate;
      }

      const res = await apiClient.get('/activities', { params });
      
      // Handle the new wrapped object structure
      const data = res.data || {};
      setHistory(data.activities || []);
      setTotalCo2(data.totalCo2Emission || 0);
      setCategoryBreakdown(data.categoryBreakdown || {});
    } catch (err) {
      setError('Failed to load activity history. Please verify parameters.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [filters]);

  const handleClearFilters = () => {
    setFilters({
      category: '',
      range: '',
      date: '',
      startDate: '',
      endDate: ''
    });
    setCategoryBreakdown({});
  };

  const isCustomRange = filters.range === 'custom';

  return (
    <div className="dashboard" style={{ maxWidth: '1000px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>My Activity History</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Browse, filter, and review all your logged carbon footprint activities
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Sub-List Category Breakdown Map */}
          {Object.keys(categoryBreakdown).length > 0 && (
            <div className="chart-card" style={{ padding: '0.6rem 1.2rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', borderRadius: '16px', fontSize: '0.85rem', alignItems: 'center' }}>
              <strong style={{ color: 'var(--text-secondary)', marginRight: '0.3rem' }}>Category Split:</strong>
              {Object.entries(categoryBreakdown).map(([cat, val]) => (
                <span key={cat} style={{ textTransform: 'capitalize', fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'var(--primary-light)', color: 'var(--primary-color)', borderRadius: '8px', fontWeight: '700' }}>
                  {cat}: {val.toFixed(1)} kg
                </span>
              ))}
            </div>
          )}

          {/* Total Emissions KPI Badge */}
          <div className="chart-card" style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '220px', borderRadius: '16px' }}>
            <span style={{ fontSize: '1.8rem' }}>☁️</span>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Filtered CO₂ Emission</span>
              <h3 style={{ margin: '0.1rem 0 0', fontSize: '1.4rem', color: 'var(--primary-color)', fontWeight: '850' }}>
                {totalCo2.toFixed(2)} kg
              </h3>
            </div>
          </div>
        </div>
      </header>

      {error && (
        <div className="error-container" style={{ marginBottom: '2rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Advanced Filter Row Controls */}
      <section className="filter-controls-row">
        <div className="filter-control-item">
          <CustomDropdown
            label="Filter Category"
            placeholder="All Categories"
            options={CATEGORY_FILTER_OPTIONS}
            value={filters.category}
            onChange={(val) => setFilters((prev) => ({ ...prev, category: val }))}
          />
        </div>

        <div className="filter-control-item">
          <CustomDropdown
            label="Time Range preset"
            placeholder="All Time"
            options={RANGE_FILTER_OPTIONS}
            value={filters.range}
            onChange={(val) => setFilters((prev) => ({ ...prev, range: val }))}
          />
        </div>

        <div className="filter-control-item">
          <label>Exact Date</label>
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
            placeholder="Select Date"
          />
        </div>

        {isCustomRange && (
          <>
            <div className="filter-control-item">
              <label>Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="filter-control-item">
              <label>End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </>
        )}

        <button
          type="button"
          onClick={handleClearFilters}
          className="filter-btn-clear"
        >
          Reset Filters
        </button>
      </section>

      {/* History table */}
      <section className="chart-card">
        <h3 style={{ marginBottom: '1.2rem' }}>Historical Logs</h3>
        {loading ? (
          <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Loading historical logs...</p>
        ) : history.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Activity Type</th>
                  <th>Quantity Logged</th>
                  <th>Emissions (kg CO2e)</th>
                </tr>
              </thead>
              <tbody>
                {history.map((log) => (
                  <tr key={log.id}>
                    <td style={{ fontWeight: '700' }}>{log.logDate}</td>
                    <td style={{ textTransform: 'capitalize' }}>{log.category}</td>
                    <td>{log.activityType?.replace('_', ' ')}</td>
                    <td>
                      {log.quantity} {log.unit}
                    </td>
                    <td style={{ fontWeight: '800', color: 'var(--primary-color)' }}>
                      {log.co2Emission?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-light)' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.8rem' }}>🌱</span>
            <p style={{ fontWeight: '700', color: 'var(--text-secondary)' }}>No matching logged activities found.</p>
            <p style={{ fontSize: '0.85rem', marginTop: '0.2rem' }}>Adjust your filters or log new activities to populate this list!</p>
          </div>
        )}
      </section>
    </div>
  );
}
