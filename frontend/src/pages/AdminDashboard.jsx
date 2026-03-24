import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAdminUsers, fetchMe, getToken, setToken } from '../api';
import './Dashboard.css';
import './Profile.css';
import './AdminDashboard.css';

function formatDate(iso) {
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

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listLoading, setListLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getToken()) {
      navigate('/login', { replace: true });
      return;
    }
    fetchMe()
      .then((data) => {
        const u = data.user;
        if (!u || u.role !== 'admin') {
          navigate('/dashboard', { replace: true });
          return;
        }
        setUser(u);
      })
      .catch(() => {
        setToken(null);
        navigate('/login', { replace: true });
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  useEffect(() => {
    if (loading || !user || user.role !== 'admin') return;
    setListLoading(true);
    setError('');
    fetchAdminUsers()
      .then((data) => setUsers(data.users || []))
      .catch((err) => {
        setError(err.message || 'Could not load users');
        setUsers([]);
      })
      .finally(() => setListLoading(false));
  }, [loading, user]);

  if (loading || !user) {
    return (
      <div className="auth-page">
        <p className="auth-muted">Loading…</p>
      </div>
    );
  }

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const memberCount = users.length - adminCount;

  return (
    <>
      <div className="topbar">
        <Link to="/dashboard" className="brand profile-brand-link">
          <div className="brand-logo">න</div>
          <div className="brand-text">
            <div className="brand-title">නන්දනි වෙළදසැල</div>
            <div className="brand-subtitle">Admin · User management</div>
          </div>
        </Link>
        <div className="topbar-actions admin-topbar-actions">
          <Link to="/dashboard" className="profile-back-link">
            Invoice dashboard
          </Link>
          <Link to="/profile" className="profile-back-link">
            Profile
          </Link>
        </div>
      </div>

      <div className="admin-shell">
        <header className="admin-header">
          <h1 className="admin-title">User management</h1>
          <p className="admin-lead">View all registered accounts, roles, and join dates.</p>
        </header>

        <div className="admin-stats">
          <div className="admin-stat-card">
            <div className="admin-stat-label">Total users</div>
            <div className="admin-stat-value">{users.length}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Administrators</div>
            <div className="admin-stat-value admin-stat-accent">{adminCount}</div>
          </div>
          <div className="admin-stat-card">
            <div className="admin-stat-label">Members</div>
            <div className="admin-stat-value">{memberCount}</div>
          </div>
        </div>

        <div className="admin-table-wrap">
          {error && <div className="admin-error">{error}</div>}
          {listLoading ? (
            <p className="admin-muted">Loading users…</p>
          ) : (
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((row) => (
                    <tr key={row.id}>
                      <td data-label="Name">{row.name?.trim() || '—'}</td>
                      <td data-label="Email">{row.email}</td>
                      <td data-label="Role">
                        <span className={`admin-role-pill ${row.role === 'admin' ? 'admin-role-pill-admin' : ''}`}>
                          {row.role === 'admin' ? 'Admin' : 'Member'}
                        </span>
                      </td>
                      <td data-label="Joined">{formatDate(row.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && !error && <p className="admin-muted">No users found.</p>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
