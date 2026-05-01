import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' },
  title: { fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' },
  subtitle: { color: '#64748b', marginBottom: '2rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1.25rem',
    marginBottom: '2.5rem'
  },
  statCard: {
    background: '#fff',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    textAlign: 'center'
  },
  statValue: { fontSize: '2.5rem', fontWeight: '700', color: '#4f46e5' },
  statLabel: { color: '#64748b', marginTop: '0.25rem', fontSize: '0.9rem' },
  actions: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
  actionBtn: {
    display: 'inline-block',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: '600',
    fontSize: '0.95rem',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    cursor: 'pointer'
  }
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.title}>Admin Dashboard 🛠</div>
      <div style={styles.subtitle}>Overview of your study notes platform</div>

      {loading ? <div className="spinner" /> : stats && (
        <div style={styles.grid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.totalUsers}</div>
            <div style={styles.statLabel}>Total Users</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.totalSubjects}</div>
            <div style={styles.statLabel}>Total Subjects</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{stats.totalPayments}</div>
            <div style={styles.statLabel}>Completed Payments</div>
          </div>
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: '#059669' }}>${stats.totalRevenue.toFixed(2)}</div>
            <div style={styles.statLabel}>Total Revenue</div>
          </div>
        </div>
      )}

      <div style={styles.actions}>
        <Link to="/admin/subjects" style={styles.actionBtn}>Manage Subjects</Link>
        <Link to="/admin/subjects/new" style={{ ...styles.actionBtn, background: 'linear-gradient(135deg, #059669, #10b981)' }}>
          + New Subject
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
