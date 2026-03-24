import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMe, setToken, getToken } from '../api';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then((data) => setUser(data.user))
      .catch(() => {
        setToken(null);
        setError('Session expired. Please sign in again.');
      })
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    setToken(null);
    setUser(null);
  }

  if (loading) {
    return (
      <div className="auth-page">
        <p className="auth-muted">Loading…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-page">
        <div className="auth-card auth-card-wide">
          <div className="auth-brand">
            <div className="auth-logo">න</div>
            <div>
              <div className="auth-title">නන්දනි වෙළදසැල</div>
              <div className="auth-sub">Welcome — sign in to continue</div>
            </div>
          </div>
          {error && <div className="auth-error">{error}</div>}
          <div className="auth-actions">
            <Link className="auth-link-btn auth-link-btn-secondary" to="/login">
              Sign in
            </Link>
            <Link className="auth-link-btn auth-link-btn-secondary" to="/register">
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-brand">
          <div className="auth-logo">න</div>
          <div>
            <div className="auth-title">Signed in</div>
            <div className="auth-sub">
              {user.name ? `${user.name} · ` : ''}
              {user.email}
            </div>
          </div>
        </div>
        <p className="auth-muted">Your session token is stored in the browser.</p>
        <div className="auth-actions">
          <button type="button" className="auth-link-btn auth-link-btn-ghost" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
