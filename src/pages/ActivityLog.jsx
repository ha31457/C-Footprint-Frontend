import { useState } from 'react';
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
  waste: [
    { value: 'WASTE_LANDFILL', label: 'Landfill Waste', unit: 'kg' },
    { value: 'WASTE_RECYCLE', label: 'Recycled Waste', unit: 'kg' },
  ],
  water: [
    { value: 'WATER_TAP', label: 'Tap Water', unit: 'L' },
    { value: 'WATER_BOTTLED', label: 'Bottled Water', unit: 'L' },
  ],
  heating: [
    { value: 'HEATING_NATURAL_GAS', label: 'Natural Gas Heating', unit: 'kWh' },
    { value: 'HEATING_ELECTRIC', label: 'Electric Heating', unit: 'kWh' },
  ],
};

const CATEGORY_OPTIONS = [
  { value: 'transport', label: 'Transport' },
  { value: 'electricity', label: 'Electricity' },
  { value: 'food', label: 'Food' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'waste', label: 'Waste' },
  { value: 'water', label: 'Water' },
  { value: 'heating', label: 'Heating' },
  { value: 'other', label: 'Other / Custom' },
];

const UNIT_OPTIONS = [
  { value: 'km', label: 'km' },
  { value: 'kWh', label: 'kWh' },
  { value: 'servings', label: 'servings' },
  { value: 'USD', label: 'USD' },
  { value: 'kg', label: 'kg' },
  { value: 'L', label: 'L' },
  { value: 'other', label: 'other' },
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
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCategoryChange = (cat) => {
    if (cat === 'other') {
      setForm({
        ...form,
        category: cat,
        activityType: '',
        unit: 'km',
      });
    } else {
      const defaultType = ACTIVITY_MAPPING[cat][0];
      setForm({
        ...form,
        category: cat,
        activityType: defaultType.value,
        unit: defaultType.unit,
      });
    }
  };

  const handleTypeChange = (typeVal) => {
    const selectedType = ACTIVITY_MAPPING[form.category]?.find((t) => t.value === typeVal);
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

    if (form.category === 'other' && !form.activityType.trim()) {
      setError('Please input a custom activity type name.');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/activities', {
        ...form,
        quantity: qty,
      });
      setMessage('Activity logged successfully!');
      // Reset form defaults
      setForm({
        category: 'transport',
        activityType: 'CAR_GASOLINE',
        quantity: '',
        unit: 'km',
        logDate: getTodayString(),
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log activity. Please verify inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const isOther = form.category === 'other';
  const typeOptions = ACTIVITY_MAPPING[form.category] || [];

  return (
    <div className="activity-log-page" style={{ maxWidth: '720px' }}>
      <h2>Log an Activity</h2>
      <form className="activity-form" onSubmit={handleSubmit}>
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

          {isOther ? (
            <label>
              Custom Activity Type
              <input
                type="text"
                value={form.activityType}
                onChange={(e) => setForm({ ...form, activityType: e.target.value })}
                placeholder="e.g. charging_my_device"
                required
              />
            </label>
          ) : (
            <CustomDropdown
              label="Activity Type"
              placeholder="Select Type"
              options={typeOptions}
              value={form.activityType}
              onChange={handleTypeChange}
            />
          )}
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
          {isOther ? (
            <CustomDropdown
              label="Custom Unit"
              placeholder="Select unit"
              options={UNIT_OPTIONS}
              value={form.unit}
              onChange={(val) => setForm({ ...form, unit: val })}
            />
          ) : (
            <label>
              Assigned Unit (auto)
              <input
                type="text"
                value={form.unit}
                readOnly
                style={{ background: 'rgba(27,58,39,0.05)', color: 'var(--text-secondary)', borderStyle: 'dashed' }}
              />
            </label>
          )}
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Log Activity'}
        </button>
      </form>
    </div>
  );
}