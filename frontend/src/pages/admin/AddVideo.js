import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

const styles = {
  container: { maxWidth: '600px', margin: '2rem auto', padding: '0 1.5rem' },
  card: { background: '#fff', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem' },
  title: { fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' },
  subjectLabel: { color: '#64748b', fontSize: '0.9rem', marginBottom: '1.75rem' },
  formGroup: { marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.65rem 0.875rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none' },
  textarea: { width: '100%', padding: '0.65rem 0.875rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none', resize: 'vertical', minHeight: '80px' },
  hint: { fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.35rem' },
  preview: { marginTop: '1rem', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e2e8f0' },
  previewTitle: { fontSize: '0.8rem', color: '#64748b', padding: '0.5rem', background: '#f8fafc' },
  btn: { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginRight: '1rem' },
  cancelBtn: { background: '#f1f5f9', color: '#374151', border: 'none', padding: '0.75rem 2rem', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: '500', cursor: 'pointer' }
};

const extractYoutubeId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

const AddVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', youtubeUrl: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/subjects/${id}`)
      .then(({ data }) => setSubject(data))
      .catch(() => setError('Subject not found'));
  }, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const rawVideoId = extractYoutubeId(form.youtubeUrl);
  // Only allow safe YouTube video IDs (11 alphanumeric chars, dashes, underscores)
  const videoId = rawVideoId && /^[A-Za-z0-9_-]{11}$/.test(rawVideoId) ? rawVideoId : null;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!videoId) { setError('Please enter a valid YouTube URL'); return; }
    setError('');
    setLoading(true);
    try {
      await api.post('/videos', {
        title: form.title,
        description: form.description,
        youtubeUrl: form.youtubeUrl,
        subjectId: id
      });
      setSuccess('Video added successfully!');
      setForm({ title: '', description: '', youtubeUrl: '' });
      setTimeout(() => navigate('/admin/subjects'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.title}>Add YouTube Video 🎥</div>
        {subject && <div style={styles.subjectLabel}>Subject: <strong>{subject.title}</strong></div>}

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Video Title *</label>
            <input style={styles.input} name="title" value={form.title} onChange={handleChange} placeholder="e.g., Introduction Lecture" required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea style={styles.textarea} name="description" value={form.description} onChange={handleChange} placeholder="Brief description..." />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>YouTube URL *</label>
            <input
              style={styles.input}
              name="youtubeUrl"
              value={form.youtubeUrl}
              onChange={handleChange}
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
            <div style={styles.hint}>Supports youtube.com/watch, youtu.be, and youtube.com/shorts URLs</div>
          </div>

          {videoId && (
            <div style={styles.preview}>
              <div style={styles.previewTitle}>Preview:</div>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title="Preview"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          <div style={{ marginTop: '1.5rem' }}>
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Video'}
            </button>
            <button style={styles.cancelBtn} type="button" onClick={() => navigate('/admin/subjects')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVideo;
