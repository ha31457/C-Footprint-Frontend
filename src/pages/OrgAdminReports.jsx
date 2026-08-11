import React, { useState } from 'react';
import apiClient from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

export default function OrgAdminReports() {
  const { accessToken } = useAuth();
  const [exporting, setExporting] = useState(null);

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const response = await fetch(`${apiClient.defaults.baseURL}/org-admin/reports/export?format=${format}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error('File export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `org_report.${format === 'word' ? 'docx' : format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error(`[OrgAdminReports] Export as ${format} failed:`, err);
      alert(`Failed to export organization summary report as ${format.toUpperCase()}.`);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="dashboard" style={{ maxWidth: '1280px' }}>
      <header className="dashboard-header" style={{ marginBottom: '2.5rem' }}>
        <div>
          <h1>Corporate Audits & Reports</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Download spreadsheet summaries or print-ready files containing employee logged emissions
          </p>
        </div>
      </header>

      <section className="chart-card" style={{ padding: '2rem', borderLeft: '5px solid var(--primary-color)' }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: '850' }}>
          📥 Download Organization Records
        </h3>
        <p style={{ margin: '0.3rem 0 1.5rem 0', fontSize: '0.88rem', color: 'var(--text-light)', lineHeight: '1.4' }}>
          Auditing files automatically compile organizational milestones, total carbon outputs, user lists, and category percentages.
        </p>

        <div style={{ display: 'flex', gap: '1.2rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
            className="btn-submit"
            style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#ffffff', padding: '0.8rem 1.6rem', border: 'none', fontWeight: '800' }}
          >
            {exporting === 'pdf' ? 'Generating PDF...' : '📄 Download PDF Report'}
          </button>
          <button
            onClick={() => handleExport('word')}
            disabled={exporting !== null}
            className="btn-submit"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#ffffff', padding: '0.8rem 1.6rem', border: 'none', fontWeight: '800' }}
          >
            {exporting === 'word' ? 'Generating DOCX...' : '📝 Download Word (DOCX)'}
          </button>
          <button
            onClick={() => handleExport('csv')}
            disabled={exporting !== null}
            className="btn-submit"
            style={{ background: 'linear-gradient(135deg, #10b981, #047857)', color: '#ffffff', padding: '0.8rem 1.6rem', border: 'none', fontWeight: '800' }}
          >
            {exporting === 'csv' ? 'Generating CSV...' : '📊 Download CSV File'}
          </button>
        </div>
      </section>
    </div>
  );
}
