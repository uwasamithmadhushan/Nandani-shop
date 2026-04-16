import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchMe, getToken, setToken } from '../api';
import './Dashboard.css';

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

export default function Dashboard() {
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

  async function handleInvoiceSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const subject = form.querySelector('#subject')?.value || '';
    const dueDate = form.querySelector('#dueDate')?.value || '';
    const currency = form.querySelector('#currency')?.value || '';
    const qtyInput = form.querySelector('.qty-input');
    const qty = qtyInput ? Number(qtyInput.value || '1') : 1;

    const invoicePayload = {
      subject,
      dueDate,
      currency,
      items: [
        {
          description: 'Summer 2K23 T-shirt',
          quantity: qty,
          unitPrice: 125000,
          currencyCode: 'IDR',
        },
      ],
    };

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoicePayload),
      });
      if (!res.ok) {
        console.error('Failed to save invoice', await res.text());
        window.alert('Error saving invoice to backend');
        return;
      }
      const saved = await res.json();
      window.alert(`Invoice saved with ID: ${saved.id}`);
    } catch (err) {
      console.error(err);
      window.alert('Could not reach backend. Is it running on port 4000?');
    }
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

  return (
    <>
      <div className="topbar">
        <div className="brand">
          <div className="brand-logo">න</div>
          <div className="brand-text">
            <div className="brand-title">නන්දනි වෙළදසැල</div>
            <div className="brand-subtitle">Smart Invoice Dashboard</div>
          </div>
        </div>
        <div className="topbar-actions">
          <Link to="/products/new" className="dashboard-topbar-button">
            + Add Product
          </Link>
          <Link to="/profile" className="profile-menu-trigger" title="View profile">
            <span className="profile-menu-avatar">{initials}</span>
            <span className="profile-menu-text">
              <span className="profile-menu-label">Profile</span>
              <span className="profile-menu-name">{displayName}</span>
              <span className="profile-menu-email">{user.email}</span>
            </span>
          </Link>
        </div>
      </div>

      <div className="app-shell">
        <aside className="sidebar" />

        <main className="main">
          <section className="overview-row">
            <div className="pill-tabs">
              <button type="button" className="pill-tab pill-tab-active">
                New Invoice
              </button>
              <button type="button" className="pill-tab">
                History
              </button>
              <button type="button" className="pill-tab">
                Reports
              </button>
            </div>
            <div className="stats">
              <div className="stat-card">
                <div className="stat-label">Invoices this month</div>
                <div className="stat-value">24</div>
                <div className="stat-sub">+8 vs last month</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Total billed</div>
                <div className="stat-value">Rs 245,000</div>
                <div className="stat-sub">Settled 82%</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Pending payments</div>
                <div className="stat-value">Rs 42,500</div>
                <div className="stat-sub stat-sub-warning">3 invoices overdue</div>
              </div>
            </div>
          </section>

          <section className="card card-form">
            <header className="card-header card-header-inline">
              <h1>Invoice Details</h1>
              <div className="search-bar">
                <span className="search-icon">🔍</span>
                <input className="search-input" type="search" placeholder="Search invoices..." />
              </div>
            </header>

            <form className="invoice-form" onSubmit={handleInvoiceSubmit}>
              <div className="field-group">
                <label className="field-label">
                  People <span className="required">*</span>
                </label>
                <div className="person-chip">
                  <div className="avatar">{initials}</div>
                  <div className="person-meta">
                    <div className="person-name">{displayName}</div>
                    <div className="person-email">{user.email}</div>
                  </div>
                  <span className="person-badge">On Arto+</span>
                  <button type="button" className="icon-button" aria-label="Edit person">
                    ✎
                  </button>
                </div>
              </div>

              <div className="field-group">
                <label className="field-label" htmlFor="subject">
                  Subject
                </label>
                <input id="subject" className="input" placeholder="Service per June 2023" />
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label className="field-label" htmlFor="dueDate">
                    Due date
                  </label>
                  <div className="input input-with-icon">
                    <input id="dueDate" type="date" />
                  </div>
                </div>
                <div className="field-group">
                  <label className="field-label" htmlFor="currency">
                    Currency
                  </label>
                  <div className="select">
                    <select id="currency" defaultValue="Rs — Sri Lankan Rupee (LKR)">
                      <option>Rs — Sri Lankan Rupee (LKR)</option>
                      <option>USD — US Dollar</option>
                      <option>EUR — Euro</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="section-title-row">
                <h2 className="section-title">Product</h2>
                <Link to="/products/new" className="link-button link-button-strong">
                  + Add Product
                </Link>
              </div>

              <div className="product-table">
                <div className="product-row">
                  <div className="product-main">
                    <div className="product-image">T</div>
                    <div>
                      <div className="product-name">Summer 2K23 T-shirt</div>
                      <div className="product-sub">Rs 1,250.00</div>
                    </div>
                  </div>
                  <div className="product-qty">
                    <label className="field-label">Qty</label>
                    <input type="number" min={1} defaultValue={1} className="input qty-input" />
                  </div>
                  <div className="product-tax">
                    <label className="field-label">Tax</label>
                    <div className="select">
                      <select defaultValue="10%">
                        <option>10%</option>
                        <option>5%</option>
                        <option>0%</option>
                      </select>
                    </div>
                  </div>
                  <button type="button" className="icon-button icon-button-muted" aria-label="Remove item">
                    🗑
                  </button>
                </div>

                <button type="button" className="link-button">
                  + Add New Line
                </button>
              </div>

              <div className="options">
                <label className="option">
                  <input type="checkbox" />
                  <span>Add Coupon</span>
                </label>
                <label className="option">
                  <input type="checkbox" defaultChecked />
                  <span>Add Discount</span>
                  <div className="select select-sm">
                    <select defaultValue="Summer Sale 10th">
                      <option>Summer Sale 11th</option>
                      <option>New Customer</option>
                    </select>
                  </div>
                </label>
              </div>

              <div className="footer-row">
                <div className="footer-left">Last saved: Today at 4:30 PM</div>
                <div className="footer-actions">
                  <button type="button" className="btn btn-ghost">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <span className="btn-dot" />
                    <span>Processing Invoice</span>
                  </button>
                </div>
              </div>
            </form>
          </section>
        </main>
      </div>
    </>
  );
}
