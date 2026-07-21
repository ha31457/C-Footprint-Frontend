import React from 'react';

export default function PlaceholderPage({ title, icon = '🌱' }) {
  return (
    <div className="dashboard" style={{ maxWidth: '800px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <span>{icon}</span> {title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Fully integrated sidebar endpoint navigation mockup
          </p>
        </div>
      </header>

      <div className="chart-card" style={{ padding: '3rem 2rem', textAlign: 'center', minHeight: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '4.5rem', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.05))', display: 'block', marginBottom: '1.5rem' }}>🛠️</span>
        <h3 style={{ fontSize: '1.5rem', color: 'var(--primary-color)', fontWeight: '800', marginBottom: '0.5rem' }}>Feature Under Construction</h3>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto 1.5rem', lineHeight: '1.6', fontWeight: '500' }}>
          This page has been successfully routed in the main sidebar layout panel. The frontend page controls are prepared and await backend database entity integration.
        </p>
        <div style={{ display: 'inline-block', background: 'var(--primary-light)', color: 'var(--primary-color)', padding: '0.4rem 1.2rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: '700' }}>
          Mockup Page Active
        </div>
      </div>
    </div>
  );
}
