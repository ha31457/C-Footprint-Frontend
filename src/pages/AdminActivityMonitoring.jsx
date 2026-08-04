import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';
import CustomDropdown from '../components/CustomDropdown';

const LIST_RANGE_OPTIONS = [
  { value: '', label: 'All Time' },
  { value: 'daily', label: 'Today (Daily)' },
  { value: 'weekly', label: 'Last 7 Days (Weekly)' },
  { value: 'monthly', label: 'Last 30 Days (Monthly)' },
  { value: 'yearly', label: 'Last 365 Days (Yearly)' },
];

export default function AdminActivityMonitoring() {
  const [platformActivities, setPlatformActivities] = useState([]);
  const [totalCo2, setTotalCo2] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fetchingProof, setFetchingProof] = useState(false);

  const handleViewProof = async (logId) => {
    setFetchingProof(true);
    try {
      const response = await apiClient.get(`/activities/${logId}/proof`, {
        responseType: 'blob'
      });
      const imgUrl = URL.createObjectURL(response.data);
      setPreviewUrl(imgUrl);
      setPreviewOpen(true);
    } catch (err) {
      alert('Failed to retrieve proof image or you do not have permission.');
    } finally {
      setFetchingProof(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
  };

  // Search & Filters for Activities
  const [listRange, setListRange] = useState('');
  const [listCategory, setListCategory] = useState('');
  const [listDate, setListDate] = useState('');
  const [textSearch, setTextSearch] = useState('');

  // Fetch Platform Activities Log List
  useEffect(() => {
    const fetchPlatformActivitiesList = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (listDate) {
          params.date = listDate;
        } else if (listRange) {
          params.range = listRange;
        }
        if (listCategory) {
          params.category = listCategory;
        }
        
        const res = await apiClient.get('/admin/activities/list', { params });
        const data = res.data || {};
        setPlatformActivities(data.activities || []);
        setTotalCo2(data.totalCo2Emission || 0);
        setCategoryBreakdown(data.categoryBreakdown || {});
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch platform activities.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlatformActivitiesList();
  }, [listRange, listDate, listCategory]);

  const handleClearFilters = () => {
    setListRange('');
    setListCategory('');
    setListDate('');
    setTextSearch('');
    setCategoryBreakdown({});
  };

  // Filter activities locally
  const filteredActivities = platformActivities.filter((act) => {
    const query = textSearch.toLowerCase().trim();
    if (!query) return true;
    return (
      (act.username && act.username.toLowerCase().includes(query)) ||
      (act.userEmail && act.userEmail.toLowerCase().includes(query)) ||
      (act.activityType && act.activityType.toLowerCase().includes(query)) ||
      (act.category && act.category.toLowerCase().includes(query))
    );
  });

  return (
    <div className="dashboard" style={{ maxWidth: '1280px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Activity Monitoring</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Monitor and audit all logged carbon footprint logs platform-wide
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

          {/* Total Platform CO2 KPI Badge */}
          <div className="chart-card" style={{ padding: '0.8rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '240px', borderRadius: '16px' }}>
            <span style={{ fontSize: '1.8rem' }}>🌍</span>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Platform CO₂ Audited</span>
              <h3 style={{ margin: '0.1rem 0 0', fontSize: '1.4rem', color: 'var(--error-color)', fontWeight: '850' }}>
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

      {/* Auditing Panel */}
      <section className="chart-card">
        <h3 style={{ marginBottom: '1.2rem' }}>Platform Activity Log Audit</h3>

        {/* Filter Bar Controls */}
        <div className="filter-bar" style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap', marginBottom: '1.8rem', alignItems: 'flex-end' }}>
          <div style={{ flex: '1', minWidth: '220px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Search User / Category / Type</label>
            <input
              type="text"
              className="search-input"
              placeholder="Search by username, email, type..."
              value={textSearch}
              onChange={(e) => setTextSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                outline: 'none',
                background: 'rgba(255,255,255,0.7)',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-family)',
              }}
            />
          </div>

          <div style={{ width: '180px' }}>
            <CustomDropdown
              label="Filter Category"
              options={[
                { value: '', label: 'All Categories' },
                { value: 'transport', label: 'Transport' },
                { value: 'electricity', label: 'Electricity' },
                { value: 'food', label: 'Food' },
                { value: 'shopping', label: 'Shopping' },
                { value: 'waste', label: 'Waste' },
                { value: 'water', label: 'Water' },
                { value: 'heating', label: 'Heating' },
                { value: 'other', label: 'Other / Custom' },
              ]}
              value={listCategory}
              onChange={setListCategory}
              placeholder="All Categories"
            />
          </div>

          <div style={{ width: '180px' }}>
            <CustomDropdown
              label="Audit Time Range"
              options={LIST_RANGE_OPTIONS}
              value={listRange}
              onChange={(val) => {
                setListRange(val);
                setListDate(''); // Clear date override if selecting range
              }}
              placeholder="Filter by Range"
            />
          </div>

          <div style={{ width: '160px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '0.4rem', display: 'block' }}>Exact Calendar Date</label>
            <input
              type="date"
              value={listDate}
              onChange={(e) => {
                setListDate(e.target.value);
                setListRange(''); // Clear range if picking date
              }}
              style={{
                width: '100%',
                padding: '0.55rem 1rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                outline: 'none',
                background: 'rgba(255,255,255,0.7)',
                fontSize: '0.9rem',
                fontFamily: 'var(--font-family)',
                height: '38px',
              }}
            />
          </div>

          {(listRange || listCategory || listDate || textSearch) && (
            <button
              onClick={handleClearFilters}
              style={{
                padding: '0.6rem 1.4rem',
                background: 'transparent',
                border: '1px solid var(--text-light)',
                borderRadius: '12px',
                color: 'var(--text-secondary)',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s',
                height: '38px',
              }}
              onMouseEnter={(e) => { e.target.style.background = 'rgba(0,0,0,0.03)'; }}
              onMouseLeave={(e) => { e.target.style.background = 'transparent'; }}
            >
              Reset Filters
            </button>
          )}
        </div>

        {loading ? (
          <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Loading platform activities...</p>
        ) : filteredActivities.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Log Date</th>
                  <th>User Details</th>
                  <th>Category</th>
                  <th>Activity Type</th>
                  <th>Quantity logged</th>
                  <th>CO2 (kg)</th>
                  <th>Proof</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((act) => (
                  <tr key={act.id}>
                    <td style={{ fontWeight: '700' }}>{act.logDate}</td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{act.username || 'Unknown'}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{act.userEmail || '-'}</span>
                      </div>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{act.category}</td>
                    <td>{act.activityType?.replace('_', ' ')}</td>
                    <td>
                      {act.quantity} {act.unit}
                    </td>
                    <td style={{ fontWeight: '800', color: 'var(--primary-color)' }}>
                      {act.co2Emission?.toFixed(2)}
                    </td>
                    <td>
                      {act.imageProofId ? (
                        <button
                          onClick={() => handleViewProof(act.id)}
                          disabled={fetchingProof}
                          style={{
                            padding: '0.45rem 1rem',
                            fontSize: '0.78rem',
                            fontWeight: '800',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, var(--primary-color), #34d399)',
                            color: '#ffffff',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(16, 185, 129, 0.25)',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            letterSpacing: '0.03em',
                            textTransform: 'uppercase'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)';
                            e.currentTarget.style.boxShadow = '0 6px 15px rgba(16, 185, 129, 0.4)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 10px rgba(16, 185, 129, 0.25)';
                          }}
                        >
                          <span style={{ fontSize: '0.85rem' }}>🖼️</span>
                          <span>View Proof</span>
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '0.8rem', fontStyle: 'italic' }}>No Proof</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '2rem 0' }}>
            No matching platform carbon logs found.
          </p>
        )}
      </section>

      {previewOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }} onClick={handleClosePreview}>
          <div style={{
            background: 'var(--surface-color)',
            borderRadius: '24px',
            padding: '2rem',
            maxWidth: '90%',
            maxHeight: '90%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            position: 'relative',
            boxShadow: 'var(--shadow-lg)'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.8rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Proof Document Image</h4>
              <button onClick={handleClosePreview} style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}>&times;</button>
            </div>
            <img src={previewUrl} alt="Proof upload preview" style={{
              maxWidth: '100%',
              maxHeight: '65vh',
              borderRadius: '16px',
              objectFit: 'contain'
            }} />
          </div>
        </div>
      )}

      {fetchingProof && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(255,255,255,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div className="loading-spinner" style={{
              width: '24px',
              height: '24px',
              border: '3px solid var(--border-color)',
              borderTop: '3px solid var(--primary-color)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <span style={{ fontWeight: '700', color: 'var(--primary-color)' }}>Retrieving proof details...</span>
          </div>
        </div>
      )}
    </div>
  );
}
