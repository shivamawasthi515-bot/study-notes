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
  fileInput: { display: 'block', width: '100%', padding: '0.65rem', border: '2px dashed #d1d5db', borderRadius: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', background: '#f8fafc' },
  btn: { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginRight: '1rem' },
  cancelBtn: { background: '#f1f5f9', color: '#374151', border: 'none', padding: '0.75rem 2rem', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: '500', cursor: 'pointer' }
};

const UploadNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [subject, setSubject] = useState(null);
  const [form, setForm] = useState({ title: '', description: '' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/subjects/${id}`)
      .then(({ data }) => setSubject(data))
      .catch(() => setError('Subject not found'));
  }, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    if (!file) { setError('Please select a file'); return; }
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('subjectId', id);
      formData.append('file', file);

      await api.post('/notes', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Note uploaded successfully!');
      setForm({ title: '', description: '' });
      setFile(null);
      setTimeout(() => navigate('/admin/subjects'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.title}>Upload Note 📄</div>
        {subject && <div style={styles.subjectLabel}>Subject: <strong>{subject.title}</strong></div>}

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Note Title *</label>
            <input style={styles.input} name="title" value={form.title} onChange={handleChange} placeholder="e.g., Chapter 1 - Introduction" required />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea style={styles.textarea} name="description" value={form.description} onChange={handleChange} placeholder="Brief description..." />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>File (PDF or Word) *</label>
            <input
              style={styles.fileInput}
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={e => setFile(e.target.files[0])}
            />
            {file && <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#64748b' }}>Selected: {file.name}</div>}
          </div>
          <div style={{ marginTop: '1rem' }}>
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Note'}
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

export default UploadNote;
