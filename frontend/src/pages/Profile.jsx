import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchMe, getToken, setToken } from '../api';
import './Dashboard.css';
import './Profile.css';

function userInitials(user) {
  if (!user) return '?';
  const name = user.name?.trim();
  if (name) {
    const parts = name.split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }
  return String(user.email).slice(0, 2).toUpperCase();
}

function formatJoined(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return '—';
  }
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      navigate('/login', { replace: true });
      return;
    }
    fetchMe()
      .then((data) => setUser(data.user))
      .catch(() => {
        setToken(null);
        navigate('/login', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  function logout() {
    setToken(null);
    navigate('/login', { replace: true });
  }

  if (loading || !user) {
    return (
      <div className="auth-page">
        <p className="auth-muted">Loading…</p>
      </div>
    );
  }

  const displayName = user.name?.trim() || user.email.split('@')[0];
  const initials = userInitials(user);
  const roleLabel = user.role === 'admin' ? 'Administrator' : 'Member';

  return (
    <>
      <div className="topbar">
        <Link to="/dashboard" className="brand profile-brand-link">
          <div className="brand-logo">න</div>
          <div className="brand-text">
            <div className="brand-title">නන්දනි වෙළදසැල</div>
            <div className="brand-subtitle">Back to dashboard</div>
          </div>
        </Link>
        <div className="topbar-actions">
          <Link to="/dashboard" className="profile-back-link">
            ← Dashboard
          </Link>
        </div>
      </div>

      <div className="profile-shell">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar" aria-hidden="true">
              {initials}
            </div>
            <div className="profile-header-text">
              <h1 className="profile-name">{displayName}</h1>
              <p className="profile-email">{user.email}</p>
              <span className={`profile-role-badge ${user.role === 'admin' ? 'profile-role-admin' : ''}`}>
                {roleLabel}
              </span>
            </div>
          </div>

          <dl className="profile-details">
            <div className="profile-detail-row">
              <dt>Full name</dt>
              <dd>{user.name?.trim() || '—'}</dd>
            </div>
            <div className="profile-detail-row">
              <dt>Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="profile-detail-row">
              <dt>Account type</dt>
              <dd>{roleLabel}</dd>
            </div>
            <div className="profile-detail-row">
              <dt>Member since</dt>
              <dd>{formatJoined(user.createdAt)}</dd>
            </div>
          </dl>

          <div className="profile-actions">
            {user.role === 'admin' && (
              <Link to="/admin" className="btn btn-primary profile-admin-dashboard-btn">
                Admin dashboard
              </Link>
            )}
            <button type="button" className="btn btn-primary profile-signout" onClick={logout}>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
