import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const styles = {
  container: { maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' },
  header: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: '#fff',
    padding: '2.5rem 1.5rem',
    borderRadius: '1rem',
    marginBottom: '2rem'
  },
  title: { fontSize: '2rem', fontWeight: '700', marginBottom: '0.75rem' },
  description: { opacity: 0.85, fontSize: '1rem', marginBottom: '1rem' },
  badge: {
    display: 'inline-block',
    padding: '0.3rem 0.8rem',
    borderRadius: '2rem',
    fontSize: '0.85rem',
    fontWeight: '600',
    background: 'rgba(255,255,255,0.2)',
    color: '#fff'
  },
  section: {
    background: '#fff',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1.5rem',
    marginBottom: '1.5rem'
  },
  sectionTitle: { fontSize: '1.2rem', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' },
  noteItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.875rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
    marginBottom: '0.75rem',
    background: '#f8fafc'
  },
  noteTitle: { fontWeight: '500', color: '#1e293b', fontSize: '0.95rem' },
  noteDesc: { fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' },
  downloadBtn: {
    background: '#4f46e5',
    color: '#fff',
    border: 'none',
    padding: '0.4rem 0.9rem',
    borderRadius: '0.4rem',
    fontSize: '0.85rem',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block'
  },
  videoWrapper: { position: 'relative', paddingBottom: '56.25%', height: 0, marginBottom: '1.5rem', borderRadius: '0.5rem', overflow: 'hidden' },
  iframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' },
  lockBox: {
    textAlign: 'center',
    padding: '3rem 2rem',
    background: '#fff',
    borderRadius: '1rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  lockIcon: { fontSize: '4rem', marginBottom: '1rem' },
  lockTitle: { fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.75rem' },
  lockDesc: { color: '#64748b', marginBottom: '2rem' },
  buyBtn: {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    border: 'none',
    padding: '0.85rem 2.5rem',
    borderRadius: '0.5rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer'
  }
};

const SubjectPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    api.get(`/subjects/${id}`)
      .then(({ data }) => setSubject(data))
      .catch(() => setError('Subject not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async (noteId, noteTitle) => {
    try {
      const response = await api.get(`/notes/${noteId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', noteTitle);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed: ' + (err.response?.data?.message || 'Unknown error'));
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      window.location.href = '/login';
      return;
    }
    setPurchasing(true);
    try {
      const { data } = await api.post('/payments/create-checkout-session', { subjectId: id });
      window.location.href = data.url;
    } catch (err) {
      alert(err.response?.data?.message || 'Payment error');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) return <div className="spinner" />;
  if (error) return <div style={styles.container}><div className="alert alert-error">{error}</div></div>;
  if (!subject) return null;

  const isLocked = subject.locked;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>{subject.title}</div>
        {subject.description && <div style={styles.description}>{subject.description}</div>}
        <span style={styles.badge}>
          {subject.accessType === 'free' ? '🆓 Free' : `💰 $${subject.price?.toFixed(2)}`}
        </span>
      </div>

      {isLocked ? (
        <div style={styles.lockBox}>
          <div style={styles.lockIcon}>🔒</div>
          <div style={styles.lockTitle}>Premium Content</div>
          <div style={styles.lockDesc}>
            Purchase this subject to access all notes and videos.
          </div>
          <button style={styles.buyBtn} onClick={handleBuyNow} disabled={purchasing}>
            {purchasing ? 'Redirecting...' : `Buy Now — $${subject.price?.toFixed(2)}`}
          </button>
          {!user && (
            <div style={{ marginTop: '1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
              <Link to="/login" style={{ color: '#4f46e5' }}>Login</Link> to purchase
            </div>
          )}
        </div>
      ) : (
        <>
          {subject.notes && subject.notes.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>📄 Notes ({subject.notes.length})</div>
              {subject.notes.map(note => (
                <div key={note._id} style={styles.noteItem}>
                  <div>
                    <div style={styles.noteTitle}>{note.title}</div>
                    {note.description && <div style={styles.noteDesc}>{note.description}</div>}
                  </div>
                  <button style={styles.downloadBtn} onClick={() => handleDownload(note._id, note.title)}>
                    ⬇ Download
                  </button>
                </div>
              ))}
            </div>
          )}

          {subject.videos && subject.videos.length > 0 && (
            <div style={styles.section}>
              <div style={styles.sectionTitle}>🎥 Videos ({subject.videos.length})</div>
              {subject.videos.map(video => (
                <div key={video._id} style={{ marginBottom: '2rem' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.75rem', color: '#1e293b' }}>{video.title}</div>
                  {video.description && <div style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{video.description}</div>}
                  <div style={styles.videoWrapper}>
                    <iframe
                      style={styles.iframe}
                      src={`https://www.youtube.com/embed/${video.youtubeVideoId}`}
                      title={video.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {subject.notes?.length === 0 && subject.videos?.length === 0 && (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem 0' }}>
              No content added yet for this subject.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubjectPage;
