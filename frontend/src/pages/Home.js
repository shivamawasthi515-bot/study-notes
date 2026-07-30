import React, { useEffect, useState } from 'react';
import api from '../api';
import SubjectCard from '../components/SubjectCard';

const styles = {
  hero: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: '#fff',
    padding: '4rem 1.5rem',
    textAlign: 'center'
  },
  heroTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '1rem'
  },
  heroSub: {
    fontSize: '1.125rem',
    opacity: 0.85,
    maxWidth: '600px',
    margin: '0 auto'
  },
  section: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '3rem 1.5rem'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '1.5rem'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: '3rem 0',
    fontSize: '1rem'
  }
};

const Home = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/subjects')
      .then(({ data }) => setSubjects(data))
      .catch(() => setError('Failed to load subjects'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div style={styles.hero}>
        <div style={styles.heroTitle}>📚 Study Notes & Videos</div>
        <div style={styles.heroSub}>
          Access premium study materials, notes and video lectures. Learn at your own pace.
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>All Subjects</div>
        {error && <div className="alert alert-error">{error}</div>}
        {loading ? (
          <div className="spinner" />
        ) : subjects.length === 0 ? (
          <div style={styles.empty}>No subjects available yet. Check back soon!</div>
        ) : (
          <div style={styles.grid}>
            {subjects.map(subject => (
              <SubjectCard key={subject._id} subject={subject} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
