import React, { useEffect, useState } from 'react';
import apiClient from '../api/apiClient';

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get('/dashboard');
        setRecommendations(res.data?.recommendations || []);
      } catch (err) {
        setError('Failed to fetch personalized recommendations.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  return (
    <div className="dashboard" style={{ maxWidth: '1280px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1>Personalized Action Center</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Tailored carbon reduction steps and ecological habits to scale your climate impact
          </p>
        </div>
      </header>

      {error && (
        <div className="error-container" style={{ marginBottom: '2rem' }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Calculating action paths...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 1: Personalized dynamic recommendations */}
          <section className="chart-card" style={{ padding: '2.5rem', borderLeft: '5px solid var(--primary-color)' }}>
            <h3 style={{ marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--primary-color)', fontSize: '1.25rem' }}>
              <span>💡</span> Dynamic Action Plan (Based on Your Logs)
            </h3>
            {recommendations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                {recommendations.map((rec, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1.2rem 1.5rem',
                      background: 'var(--primary-light)',
                      borderRadius: '12px',
                      display: 'flex',
                      gap: '1rem',
                      alignItems: 'flex-start',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>🌱</span>
                    <div>
                      <h4 style={{ margin: '0 0 0.3rem 0', color: 'var(--primary-color)', fontWeight: '750' }}>Step {index + 1}</h4>
                      <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{rec}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '1rem 0', color: 'var(--text-light)', fontStyle: 'italic', fontSize: '0.9rem' }}>
                No personalized entries found. Start logging activities on the "Activity Logging" page to generate customized green paths!
              </div>
            )}
          </section>

          {/* Section 2: Global general tips list */}
          <section className="chart-card" style={{ padding: '2.5rem' }}>
            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Global Sustainability Guidelines</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.8rem' }}>
              
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>💧</div>
                <h4 style={{ marginBottom: '0.5rem', fontWeight: '750' }}>Water Conservation</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                  Avoid running tap water during brushing, reduce average shower times by 2 minutes, and prefer tap over bottled beverages to lower packaging emissions.
                </p>
              </div>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>⚡</div>
                <h4 style={{ marginBottom: '0.5rem', fontWeight: '750' }}>Heating & Utilities</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                  Turn down heaters by 1 degree, use natural gas over electric heat where cleaner, and unplug smart items when leaving rooms to save idle grid power.
                </p>
              </div>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>♻️</div>
                <h4 style={{ marginBottom: '0.5rem', fontWeight: '750' }}>Waste & Materials</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                  Avoid sending organic materials to landfills which releases methane. Actively recycle packaging, plastic bottles, and glass jars system-wide.
                </p>
              </div>

            </div>
          </section>

        </div>
      )}
    </div>
  );
}
