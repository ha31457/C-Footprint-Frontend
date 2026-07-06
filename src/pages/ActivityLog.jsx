import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import CustomDropdown from '../components/CustomDropdown';

const ACTIVITY_MAPPING = {
  transport: [
    { value: 'CAR_GASOLINE', label: 'Car (Gasoline)', unit: 'km' },
    { value: 'CAR_DIESEL', label: 'Car (Diesel)', unit: 'km' },
    { value: 'PUBLIC_BUS', label: 'Public Bus', unit: 'km' },
    { value: 'FLIGHT', label: 'Flight', unit: 'km' },
  ],
  electricity: [
    { value: 'ELECTRICITY_GRID', label: 'Grid Electricity', unit: 'kWh' },
    { value: 'ELECTRICITY_SOLAR', label: 'Solar Electricity', unit: 'kWh' },
  ],
  food: [
    { value: 'MEAL_MEAT', label: 'Meat Meal', unit: 'servings' },
    { value: 'MEAL_VEGETARIAN', label: 'Vegetarian Meal', unit: 'servings' },
    { value: 'MEAL_VEGAN', label: 'Vegan Meal', unit: 'servings' },
  ],
  shopping: [
    { value: 'SHOPPING_CLOTHING', label: 'Clothing Shopping', unit: 'USD' },
    { value: 'SHOPPING_ELECTRONICS', label: 'Electronics Shopping', unit: 'USD' },
  ],
};

const CATEGORY_OPTIONS = [
  { value: 'transport', label: 'Transport' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'food', label: 'Food' },
  { value: 'shopping', label: 'Shopping' },
];

const getTodayString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export default function ActivityLog() {
  const [form, setForm] = useState({
    category: 'transport',
    activityType: 'CAR_GASOLINE',
    quantity: '',
    unit: 'km',
    logDate: getTodayString(),
  });
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await apiClient.get('/activities');
      setHistory(res.data || []);
    } catch (err) {
      console.error('Failed to fetch activities history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleCategoryChange = (cat) => {
    const defaultType = ACTIVITY_MAPPING[cat][0];
    setForm({
      ...form,
      category: cat,
      activityType: defaultType.value,
      unit: defaultType.unit,
    });
  };

  const handleTypeChange = (typeVal) => {
    const selectedType = ACTIVITY_MAPPING[form.category].find((t) => t.value === typeVal);
    setForm({
      ...form,
      activityType: typeVal,
      unit: selectedType ? selectedType.unit : '',
    });
  };

  const handleDateChange = (e) => {
    setForm({ ...form, logDate: e.target.value });
  };

  const handleQuantityChange = (e) => {
    setForm({ ...form, quantity: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const qty = parseFloat(form.quantity);
    if (isNaN(qty) || qty < 0) {
      setError('Quantity must be a positive numeric value.');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/activities', {
        ...form,
        quantity: qty,
      });
      setMessage('Activity logged successfully!');
      setForm({
        category: 'transport',
        activityType: 'CAR_GASOLINE',
        quantity: '',
        unit: 'km',
        logDate: getTodayString(),
      });
      // Refresh the history log table
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log activity. Please verify inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const typeOptions = ACTIVITY_MAPPING[form.category] || [];

  return (
    <div className="activity-log-page" style={{ maxWidth: '720px' }}>
      <h2>Log an Activity</h2>
      <form className="activity-form" onSubmit={handleSubmit} style={{ marginBottom: '3rem' }}>
        {error && (
          <div className="error-container">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="success-container">
            <span>✅</span>
            <span>{message}</span>
          </div>
        )}

        <div className="form-row">
          <CustomDropdown
            label="Category"
            placeholder="Select Category"
            options={CATEGORY_OPTIONS}
            value={form.category}
            onChange={handleCategoryChange}
          />

          <CustomDropdown
            label="Activity Type"
            placeholder="Select Type"
            options={typeOptions}
            value={form.activityType}
            onChange={handleTypeChange}
          />
        </div>

        <div className="form-row">
          <label>
            Quantity
            <input
              type="number"
              step="0.01"
              value={form.quantity}
              onChange={handleQuantityChange}
              placeholder={`Amount in ${form.unit}`}
              required
            />
          </label>

          <label>
            Date
            <input
              type="date"
              value={form.logDate}
              onChange={handleDateChange}
              required
            />
          </label>
        </div>

        <div className="form-row" style={{ gridTemplateColumns: '1fr' }}>
          <label>
            Assigned Unit (auto)
            <input type="text" value={form.unit} readOnly style={{ background: 'rgba(27,58,39,0.05)', color: 'var(--text-secondary)', borderStyle: 'dashed' }} />
          </label>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Log Activity'}
        </button>
      </form>

      {/* History Log Section */}
      <section className="chart-card">
        <h3 style={{ marginBottom: '1rem' }}>Activity Logging History</h3>
        {loadingHistory ? (
          <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Loading historical logs...</p>
        ) : history.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Emissions (kg CO2e)</th>
                </tr>
              </thead>
              <tbody>
                {history.map((log) => (
                  <tr key={log.id}>
                    <td>{log.logDate}</td>
                    <td style={{ textTransform: 'capitalize' }}>{log.category}</td>
                    <td>{log.activityType.replace('_', ' ')}</td>
                    <td>
                      {log.quantity} {log.unit}
                    </td>
                    <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>
                      {log.co2Emission?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '1rem 0' }}>
            No carbon activities logged yet.
          </p>
        )}
      </section>
    </div>
  );
}