import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createProduct, fetchProducts, getToken } from '../api';
import './AddProduct.css';

export default function AddProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    visibleOnStorefront: true,
    name: '',
    sku: '',
    productType: 'Physical',
    category: 'General',
    price: '',
    stock: '0',
    description: '',
  });

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }

    fetchProducts()
      .then((productData) => {
        setProducts(productData.products || []);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        category: form.category,
        description: form.description,
        price: Number(form.price),
        stock: Number(form.stock),
      };
      const data = await createProduct(payload);
      setProducts((current) => [data.product, ...current]);
      setForm({
        visibleOnStorefront: true,
        name: '',
        sku: '',
        productType: 'Physical',
        category: 'General',
        price: '',
        stock: '0',
        description: '',
      });
      setSuccess('Product added successfully.');
    } catch (err) {
      setError(err.message || 'Could not save product');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="auth-page">
        <p className="auth-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="product-editor-page">
      <div className="product-editor-shell">
        <header className="product-editor-top">
          <Link to="/dashboard" className="product-editor-backlink">
            <span aria-hidden="true">←</span>
            <span>VIEW PRODUCTS</span>
          </Link>
          <h1 className="product-editor-title">Add Product</h1>
          <div className="product-editor-divider" />
        </header>

        <div className="product-editor-layout">
          <aside className="product-editor-sidebar">
            <div className="editor-sidebar-group">
              <div className="editor-sidebar-heading">PRODUCT INFORMATION</div>
              <button type="button" className="editor-sidebar-item editor-sidebar-item-active">
                Basic Information
              </button>
              <button type="button" className="editor-sidebar-item">
                Description
              </button>
              <button type="button" className="editor-sidebar-item">
                Images & Videos
              </button>
              <button type="button" className="editor-sidebar-item">
                Product Identifiers
              </button>
              <button type="button" className="editor-sidebar-item">
                Pricing
              </button>
              <button type="button" className="editor-sidebar-item">
                Inventory
              </button>
            </div>

            <div className="editor-sidebar-group">
              <div className="editor-sidebar-heading">PRODUCT OPTIONS</div>
              <button type="button" className="editor-sidebar-item">
                Variations
              </button>
              <button type="button" className="editor-sidebar-item">
                Customizations
              </button>
            </div>

            <div className="editor-sidebar-group">
              <div className="editor-sidebar-heading">STOREFRONT</div>
              <button type="button" className="editor-sidebar-item">
                Search Settings
              </button>
            </div>
          </aside>

          <main className="product-editor-main">
            <div className="product-editor-header">
              <h2>Product Information</h2>
              <p>Information to help define a product.</p>
            </div>

            <section className="product-editor-card">
              <h3>Basic Information</h3>

              {error && <div className="product-editor-alert product-editor-alert-error">{error}</div>}
              {success && <div className="product-editor-alert product-editor-alert-success">{success}</div>}

              <form className="product-editor-form" onSubmit={handleSubmit}>
                <label className="product-editor-checkbox" htmlFor="visibleOnStorefront">
                  <input
                    id="visibleOnStorefront"
                    name="visibleOnStorefront"
                    type="checkbox"
                    checked={form.visibleOnStorefront}
                    onChange={handleChange}
                  />
                  <span>Visible on Storefront</span>
                </label>

                <div className="product-editor-grid">
                  <label className="product-editor-field" htmlFor="name">
                    <span>
                      Product Name <em>*</em>
                    </span>
                    <input id="name" name="name" value={form.name} onChange={handleChange} required />
                  </label>

                  <label className="product-editor-field" htmlFor="sku">
                    <span>SKU</span>
                    <input id="sku" name="sku" value={form.sku} onChange={handleChange} placeholder="BCMUG" />
                  </label>

                  <label className="product-editor-field" htmlFor="productType">
                    <span>Product Type</span>
                    <select id="productType" name="productType" value={form.productType} onChange={handleChange}>
                      <option>Physical</option>
                      <option>Digital</option>
                      <option>Service</option>
                    </select>
                  </label>

                  <label className="product-editor-field" htmlFor="price">
                    <span>
                      Default Price <em>*</em> (excluding tax)
                    </span>
                    <input
                      id="price"
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="20.00"
                      required
                    />
                  </label>

                  <label className="product-editor-field" htmlFor="stock">
                    <span>Inventory / Stock</span>
                    <input
                      id="stock"
                      name="stock"
                      type="number"
                      min="0"
                      step="1"
                      value={form.stock}
                      onChange={handleChange}
                    />
                  </label>

                  <label className="product-editor-field" htmlFor="category">
                    <span>Category</span>
                    <input id="category" name="category" value={form.category} onChange={handleChange} />
                  </label>
                </div>

                <label className="product-editor-field" htmlFor="description">
                  <span>Description</span>
                  <textarea
                    id="description"
                    name="description"
                    rows="4"
                    value={form.description}
                    onChange={handleChange}
                  />
                </label>

                <div className="product-editor-actions">
                  <button type="submit" className="product-editor-btn product-editor-btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Product'}
                  </button>
                  <Link to="/dashboard" className="product-editor-btn product-editor-btn-muted">
                    Cancel
                  </Link>
                  <div className="product-editor-meta">Products in catalog: {products.length}</div>
                </div>
              </form>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}