import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';

const styles = {
  wrapper: {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem'
  },
  card: {
    background: '#fff',
    borderRadius: '1rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.1)',
    padding: '3rem',
    textAlign: 'center',
    maxWidth: '480px',
    width: '100%'
  },
  icon: { fontSize: '4rem', marginBottom: '1rem' },
  title: { fontSize: '1.75rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.75rem' },
  desc: { color: '#64748b', marginBottom: '2rem' },
  btn: {
    display: 'inline-block',
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    padding: '0.75rem 2rem',
    borderRadius: '0.5rem',
    fontWeight: '600',
    marginRight: '1rem'
  }
};

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setError('No session ID found');
      return;
    }

    api.get(`/payments/verify/${sessionId}`)
      .then(({ data }) => {
        if (data.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setError('Payment not completed');
        }
      })
      .catch(err => {
        setStatus('error');
        setError(err.response?.data?.message || 'Verification failed');
      });
  }, [sessionId]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {status === 'verifying' && (
          <>
            <div style={styles.icon}>⏳</div>
            <div style={styles.title}>Verifying Payment...</div>
            <div className="spinner" />
          </>
        )}

        {status === 'success' && (
          <>
            <div style={styles.icon}>🎉</div>
            <div style={styles.title}>Payment Successful!</div>
            <div style={styles.desc}>
              You now have access to your purchased subject. Start learning right away!
            </div>
            <Link to="/dashboard" style={styles.btn}>My Courses</Link>
            <Link to="/" style={{ color: '#4f46e5', fontWeight: '500' }}>Browse More</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={styles.icon}>❌</div>
            <div style={styles.title}>Something went wrong</div>
            <div style={styles.desc}>{error}</div>
            <Link to="/" style={styles.btn}>Go Home</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
