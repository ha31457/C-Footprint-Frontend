import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#225c3b', '#0284c7', '#769482', '#0f766e'];

const PLACEHOLDER_SUMMARY = {
  todayTotalEmission: 4.8,
  categoryBreakdown: [
    { category: 'transport', co2Emission: 4.2, percentage: 50.0 },
    { category: 'electricity', co2Emission: 2.8, percentage: 33.3 },
    { category: 'food', co2Emission: 1.4, percentage: 16.7 },
    { category: 'shopping', co2Emission: 0.0, percentage: 0.0 },
  ],
  weeklyTrend: [
    { date: '2026-06-30', co2Emission: 1.2 },
    { date: '2026-07-01', co2Emission: 3.5 },
    { date: '2026-07-02', co2Emission: 2.4 },
    { date: '2026-07-03', co2Emission: 5.1 },
    { date: '2026-07-04', co2Emission: 1.8 },
    { date: '2026-07-05', co2Emission: 4.0 },
    { date: '2026-07-06', co2Emission: 4.8 },
  ],
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [usingPlaceholder, setUsingPlaceholder] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await apiClient.get('/dashboard');
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
  }, []);

  if (loading || !summary) return <div className="loading-screen">Loading dashboard...</div>;

  const categoryData = summary.categoryBreakdown || [];
  const trendData = summary.weeklyTrend || [];
  const totalEmission = categoryData.reduce((sum, item) => sum + (item.co2Emission || 0), 0);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Welcome, {user?.username}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Here is your carbon footprint dashboard analysis
          </p>
        </div>
      </header>

      {usingPlaceholder && (
        <div className="notice-text" style={{ marginBottom: '2rem' }}>
          Showing sample data — connect the /api/dashboard endpoint to see live numbers.
        </div>
      )}

      {/* KPI Stats highlight card */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div className="chart-card" style={{ maxWidth: '360px', padding: '1.5rem 2rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Today's Carbon Footprint
          </span>
          <span style={{ fontSize: '2.25rem', fontWeight: '800', color: 'var(--primary-color)', marginTop: '0.4rem', display: 'block' }}>
            {summary.todayTotalEmission?.toFixed(2) || 0} kg CO2e
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
          <h3>Weekly CO2e Trend (kg)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `${parseFloat(value).toFixed(2)} kg`} />
              <Line type="monotone" dataKey="co2Emission" stroke="#0284c7" strokeWidth={3} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}