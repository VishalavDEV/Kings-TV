import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchApi } from '../utils/fetchApi';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter your admin email and password.');
      return;
    }

    setLoading(true);
    try {
      // Try /admin/login endpoint first, fallback to /auth/login
      let res;
      try {
        res = await fetchApi('/admin/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
      } catch (err) {
        res = await fetchApi('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
      }

      if (res && res.accessToken) {
        localStorage.setItem('accessToken', res.accessToken);
        if (res.refreshToken) {
          localStorage.setItem('refreshToken', res.refreshToken);
        }
        if (res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));
        }
        if (res.permissions) {
          localStorage.setItem('permissions', JSON.stringify(res.permissions));
        }
        navigate('/dashboard');
      } else if (res && (res.error || res.message)) {
        setErrorMsg(res.error || res.message);
      } else {
        setErrorMsg('Invalid login credentials.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="card-brand-header">
          <div className="brand-logo">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
          <h1>Public Vani Panel</h1>
          <p className="card-subtitle">KINGS 24x7 Administration Console</p>
        </div>

        {errorMsg && <div className="login-error-banner">{errorMsg}</div>}

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Admin Email Address</label>
            <div className="input-icon-wrapper">
              <i className="fa-solid fa-envelope icon"></i>
              <input
                type="email"
                id="email"
                placeholder="admin@king24x7.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-icon-wrapper">
              <i className="fa-solid fa-lock icon"></i>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Panel'}
          </button>
        </form>

        <div className="card-footer-link">
          <Link to="/" className="back-home-link">
            <i className="fa-solid fa-arrow-left"></i> Go Back to the Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
