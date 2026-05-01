import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const styles = {
  container: { maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '1.75rem', fontWeight: '700', color: '#1e293b' },
  newBtn: {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    padding: '0.65rem 1.25rem',
    borderRadius: '0.5rem',
    fontWeight: '600',
    fontSize: '0.9rem',
    display: 'inline-block'
  },
  table: { width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  th: { padding: '0.875rem 1rem', background: '#f8fafc', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', borderBottom: '1px solid #e2e8f0' },
  td: { padding: '1rem', borderBottom: '1px solid #f1f5f9', color: '#1e293b', fontSize: '0.9rem' },
  freeBadge: { background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.6rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: '600' },
  paidBadge: { background: '#ede9fe', color: '#6d28d9', padding: '0.2rem 0.6rem', borderRadius: '2rem', fontSize: '0.75rem', fontWeight: '600' },
  actionLink: { color: '#4f46e5', fontWeight: '500', fontSize: '0.85rem', marginRight: '0.75rem' },
  deleteBtn: { color: '#dc2626', fontWeight: '500', fontSize: '0.85rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }
};

const ManageSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = () => {
    api.get('/subjects')
      .then(({ data }) => setSubjects(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete subject "${title}"?`)) return;
    try {
      await api.delete(`/subjects/${id}`);
      setSubjects(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>Manage Subjects 📚</div>
        <Link to="/admin/subjects/new" style={styles.newBtn}>+ New Subject</Link>
      </div>

      {loading ? <div className="spinner" /> : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Title</th>
              <th style={styles.th}>Access</th>
              <th style={styles.th}>Price</th>
              <th style={styles.th}>Notes</th>
              <th style={styles.th}>Videos</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.length === 0 ? (
              <tr><td colSpan="6" style={{ ...styles.td, textAlign: 'center', color: '#94a3b8' }}>No subjects yet</td></tr>
            ) : subjects.map(s => (
              <tr key={s._id}>
                <td style={styles.td}>{s.title}</td>
                <td style={styles.td}>
                  <span style={s.accessType === 'free' ? styles.freeBadge : styles.paidBadge}>
                    {s.accessType}
                  </span>
                </td>
                <td style={styles.td}>{s.accessType === 'paid' ? `$${s.price.toFixed(2)}` : '—'}</td>
                <td style={styles.td}>{s.notes?.length || 0}</td>
                <td style={styles.td}>{s.videos?.length || 0}</td>
                <td style={styles.td}>
                  <Link to={`/admin/subjects/${s._id}/edit`} style={styles.actionLink}>Edit</Link>
                  <Link to={`/admin/subjects/${s._id}/upload-note`} style={styles.actionLink}>+ Note</Link>
                  <Link to={`/admin/subjects/${s._id}/add-video`} style={styles.actionLink}>+ Video</Link>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(s._id, s.title)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ManageSubjects;
