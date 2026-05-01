import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const styles = {
  nav: {
    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
    color: '#fff',
    padding: '0 1.5rem',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 2px 10px rgba(79, 70, 229, 0.3)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  brand: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.5px'
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  link: {
    color: 'rgba(255,255,255,0.85)',
    padding: '0.4rem 0.8rem',
    borderRadius: '0.4rem',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'background 0.2s',
    cursor: 'pointer'
  },
  btn: {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)',
    padding: '0.4rem 1rem',
    borderRadius: '0.4rem',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  adminBadge: {
    background: '#fbbf24',
    color: '#78350f',
    padding: '0.2rem 0.6rem',
    borderRadius: '0.3rem',
    fontSize: '0.75rem',
    fontWeight: '600'
  }
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>📚 StudyNotes</Link>
      <div style={styles.links}>
        <Link to="/" style={styles.link}>Browse</Link>
        {user ? (
          <>
            <Link to="/dashboard" style={styles.link}>My Courses</Link>
            {user.role === 'admin' && (
              <Link to="/admin" style={{ ...styles.link, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={styles.adminBadge}>Admin</span>
              </Link>
            )}
            <span style={{ ...styles.link, color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
              {user.name}
            </span>
            <button style={styles.btn} onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register">
              <button style={styles.btn}>Sign Up</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
