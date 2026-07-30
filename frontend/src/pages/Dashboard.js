import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import SubjectCard from '../components/SubjectCard';

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' },
  title: { fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' },
  subtitle: { color: '#64748b', marginBottom: '2rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  empty: {
    textAlign: 'center',
    padding: '3rem 0',
    color: '#94a3b8'
  }
};

const Dashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(({ data }) => setUserData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  const purchased = userData?.purchasedSubjects || [];

  return (
    <div style={styles.container}>
      <div style={styles.title}>My Courses 🎓</div>
      <div style={styles.subtitle}>
        Welcome back, {userData?.name}! Here are your purchased subjects.
      </div>

      {purchased.length === 0 ? (
        <div style={styles.empty}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
          <div style={{ marginBottom: '1rem' }}>You haven't purchased any subjects yet.</div>
          <Link
            to="/"
            style={{
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: '#fff',
              padding: '0.65rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: '600'
            }}
          >
            Browse Subjects
          </Link>
        </div>
      ) : (
        <div style={styles.grid}>
          {purchased.map(subject => (
            <SubjectCard key={subject._id} subject={subject} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
