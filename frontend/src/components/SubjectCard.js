import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
  card: {
    background: '#fff',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
  },
  thumbnail: {
    width: '100%',
    height: '160px',
    objectFit: 'cover',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '3rem'
  },
  body: {
    padding: '1.25rem',
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  title: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '0.5rem'
  },
  description: {
    fontSize: '0.875rem',
    color: '#64748b',
    marginBottom: '1rem',
    flex: 1,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto'
  },
  freeBadge: {
    background: '#dcfce7',
    color: '#15803d',
    padding: '0.25rem 0.65rem',
    borderRadius: '2rem',
    fontSize: '0.78rem',
    fontWeight: '600'
  },
  paidBadge: {
    background: '#ede9fe',
    color: '#6d28d9',
    padding: '0.25rem 0.65rem',
    borderRadius: '2rem',
    fontSize: '0.78rem',
    fontWeight: '600'
  },
  btn: {
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    border: 'none',
    padding: '0.45rem 1rem',
    borderRadius: '0.4rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer'
  }
};

const SubjectCard = ({ subject }) => {
  const isPaid = subject.accessType === 'paid';

  return (
    <Link to={`/subjects/${subject._id}`} style={{ textDecoration: 'none' }}>
      <div
        style={styles.card}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }}
      >
        <div style={styles.thumbnail}>
          {subject.thumbnail ? (
            <img src={subject.thumbnail} alt={subject.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            '📖'
          )}
        </div>
        <div style={styles.body}>
          <div style={styles.title}>{subject.title}</div>
          <div style={styles.description}>{subject.description || 'No description available.'}</div>
          <div style={styles.footer}>
            <span style={isPaid ? styles.paidBadge : styles.freeBadge}>
              {isPaid ? `$${subject.price.toFixed(2)}` : 'FREE'}
            </span>
            <button style={styles.btn}>View</button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SubjectCard;
