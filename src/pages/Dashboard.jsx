import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';
import CustomDropdown from '../components/CustomDropdown';
import { useLanguage } from '../context/LanguageContext';

const COLORS = ['#225c3b', '#0284c7', '#769482', '#0f766e'];

const RANGE_OPTIONS = [
  { value: 'daily', label: 'Daily (Last 7 Days)' },
  { value: 'weekly', label: 'Weekly (Last 4 Weeks)' },
  { value: 'monthly', label: 'Monthly (Last 6 Months)' },
  { value: 'yearly', label: 'Yearly (Last 3 Years)' },
];

const PLACEHOLDER_SUMMARY = {
  todayTotalEmission: 4.8,
  categoryBreakdown: [
    { category: 'transport', co2Emission: 4.2, percentage: 50.0 },
    { category: 'electricity', co2Emission: 2.8, percentage: 33.3 },
    { category: 'food', co2Emission: 1.4, percentage: 16.7 },
    { category: 'shopping', co2Emission: 0.0, percentage: 0.0 },
  ],
  trend: [
    { label: '2026-06-30', co2Emission: 1.2 },
    { label: '2026-07-01', co2Emission: 3.5 },
    { label: '2026-07-02', co2Emission: 2.4 },
    { label: '2026-07-03', co2Emission: 5.1 },
    { label: '2026-07-04', co2Emission: 1.8 },
    { label: '2026-07-05', co2Emission: 4.0 },
    { label: '2026-07-06', co2Emission: 4.8 },
  ],
};

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [summary, setSummary] = useState(null);
  const [range, setRange] = useState('daily');
  const [usingPlaceholder, setUsingPlaceholder] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/dashboard?range=${range}`);
        setSummary(res.data);
      } catch (err) {
        // Endpoint not implemented yet on the backend — show placeholder data
        setSummary(PLACEHOLDER_SUMMARY);
        setUsingPlaceholder(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [range]);

  if (loading || !summary) return <div className="loading-screen">Loading dashboard...</div>;

  const categoryData = summary.categoryBreakdown || [];
  const trendData = summary.trend || [];
  const totalEmission = categoryData.reduce((sum, item) => sum + (item.co2Emission || 0), 0);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>{t('welcomeBack', 'Welcome back')}, {user?.username}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            {t('dashboardIntro', 'Here is your carbon footprint dashboard analysis')}
          </p>
        </div>
      </header>

      {usingPlaceholder && (
        <div className="notice-text" style={{ marginBottom: '2rem' }}>
          Showing sample data — connect the /api/dashboard endpoint to see live numbers.
        </div>
      )}

      {/* KPI Stats highlight grid */}
      <section style={{ marginBottom: '2.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <div className="chart-card stat-card" style={{ flex: 1, minWidth: '240px', padding: '1.6rem 2rem', borderTop: '4px solid #6366f1', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, var(--surface-color) 75%)' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            ⚡ {t('weeklyFootprint', "Today's Carbon Footprint")}
          </span>
          <span style={{ fontSize: '2.35rem', fontWeight: '850', color: '#6366f1', marginTop: '0.5rem', display: 'block' }}>
            {(summary.todayTotalEmission ?? 0).toFixed(2)} <small style={{ fontSize: '1.1rem' }}>kg CO₂e</small>
          </span>
        </div>

        <div className="chart-card stat-card" style={{ flex: 1, minWidth: '240px', padding: '1.6rem 2rem', borderTop: '4px solid #8b5cf6', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, var(--surface-color) 75%)' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: '800', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            🌍 Total All-Time Emissions
          </span>
          <span style={{ fontSize: '2.35rem', fontWeight: '850', color: '#8b5cf6', marginTop: '0.5rem', display: 'block' }}>
            {(summary.totalAllTimeEmission ?? 0).toFixed(1)} <small style={{ fontSize: '1.1rem' }}>kg CO₂e</small>
          </span>
        </div>
      </section>

      <section className="chart-grid">
        <div className="chart-card">
          <h3>Footprint by Category</h3>
          {totalEmission > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="co2Emission"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(props) => {
                    const { name, percent, payload } = props;
                    if (!percent || percent <= 0) return '';
                    const categoryName = payload?.category || name || 'unknown';
                    const percentageValue = payload?.percentage || (percent * 100);
                    return `${categoryName.toUpperCase()} (${percentageValue.toFixed(1)}%)`;
                  }}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={entry.category || index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)} kg CO2e`} />
                <Legend formatter={(value) => value ? value.toUpperCase() : 'UNKNOWN'} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '280px', textAlign: 'center' }}>
              <span style={{ fontSize: '2.5rem' }}>🌱</span>
              <p style={{ marginTop: '0.8rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                No personal activities logged yet.
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.2rem' }}>
                Use the "Log Activity" page to record your carbon footprint.
              </p>
            </div>
          )}
        </div>

        <div className="chart-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0 }}>Emissions Trend</h3>
            <div style={{ width: '220px' }}>
              <CustomDropdown
                options={RANGE_OPTIONS}
                value={range}
                onChange={(val) => setRange(val)}
                placeholder="Select Range"
              />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)} kg`} />
              <Line type="monotone" dataKey="co2Emission" stroke="#0284c7" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Personalized Recommendations */}
      {summary.recommendations && summary.recommendations.length > 0 && (
        <section className="chart-card" style={{ marginTop: '2rem', borderLeft: '4px solid var(--primary-color)', padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary-color)', fontSize: '1.15rem' }}>
            <span>💡</span> Personalized Sustainability Recommendations
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {summary.recommendations.map((rec, index) => (
              <li key={index} style={{ display: 'flex', gap: '0.8rem', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                <span>🌱</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}