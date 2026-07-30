import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

const styles = {
  container: { maxWidth: '600px', margin: '2rem auto', padding: '0 1.5rem' },
  card: { background: '#fff', borderRadius: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '2rem' },
  title: { fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '1.75rem' },
  formGroup: { marginBottom: '1.25rem' },
  label: { display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.4rem' },
  input: { width: '100%', padding: '0.65rem 0.875rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none' },
  textarea: { width: '100%', padding: '0.65rem 0.875rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none', resize: 'vertical', minHeight: '100px' },
  select: { width: '100%', padding: '0.65rem 0.875rem', border: '1px solid #d1d5db', borderRadius: '0.5rem', fontSize: '0.95rem', outline: 'none', background: '#fff' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  btn: { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: '#fff', border: 'none', padding: '0.75rem 2rem', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginRight: '1rem' },
  cancelBtn: { background: '#f1f5f9', color: '#374151', border: 'none', padding: '0.75rem 2rem', borderRadius: '0.5rem', fontSize: '1rem', fontWeight: '500', cursor: 'pointer' }
};

const CreateSubject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({ title: '', description: '', accessType: 'free', price: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      api.get(`/subjects/${id}`)
        .then(({ data }) => setForm({
          title: data.title || '',
          description: data.description || '',
          accessType: data.accessType || 'free',
          price: data.price || ''
        }))
        .catch(() => setError('Failed to load subject'));
    }
  }, [id, isEditing]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        accessType: form.accessType,
        price: form.accessType === 'paid' ? parseFloat(form.price) || 0 : 0
      };

      if (isEditing) {
        await api.put(`/subjects/${id}`, payload);
      } else {
        await api.post('/subjects', payload);
      }
      navigate('/admin/subjects');
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.title}>{isEditing ? 'Edit Subject ✏️' : 'Create Subject ➕'}</div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Title *</label>
            <input
              style={styles.input}
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g., Mathematics 101"
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief description of the subject..."
            />
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Access Type *</label>
              <select style={styles.select} name="accessType" value={form.accessType} onChange={handleChange}>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {form.accessType === 'paid' && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Price (USD) *</label>
                <input
                  style={styles.input}
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="9.99"
                  min="0.50"
                  step="0.01"
                  required
                />
              </div>
            )}
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button style={styles.btn} type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditing ? 'Update Subject' : 'Create Subject')}
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

export default CreateSubject;
