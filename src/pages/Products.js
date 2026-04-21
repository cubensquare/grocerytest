import React, { useState, useEffect } from 'react';
import { getProducts, getCategories, createProduct, updateProduct, deleteProduct, updateStock } from '../services/api';
import toast from 'react-hot-toast';
import { getProductImage } from '../utils/visuals';

const emptyForm = { name: '', barcode: '', category_id: '', price: '', cost_price: '', stock: '', unit: 'pcs', image_url: '', active: 1 };

const UNITS = ['pcs', 'kg', 'g', 'litre', 'ml', 'pack', 'dozen', 'bottle', 'can', 'box', 'tube', 'bar', 'jar'];

function ProductModal({ product, categories, onSave, onClose }) {
  const [form, setForm] = useState(product ? { ...product } : { ...emptyForm });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product) {
        await updateProduct(product.id, form);
        toast.success('Product updated!');
      } else {
        await createProduct(form);
        toast.success('Product created!');
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3>{product ? '✏️ Edit Product' : '➕ New Product'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Product Name *</label>
              <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Barcode</label>
              <input className="form-input" value={form.barcode || ''} placeholder="EAN / UPC" onChange={e => setForm({ ...form, barcode: e.target.value })} />
            </div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}>
              <label className="form-label">Image URL</label>
              <input
                className="form-input"
                value={form.image_url || ''}
                placeholder="https://..."
                onChange={e => setForm({ ...form, image_url: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category_id || ''} onChange={e => setForm({ ...form, category_id: e.target.value })}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Selling Price (₹) *</label>
              <input className="form-input" type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Cost Price (₹)</label>
              <input className="form-input" type="number" min="0" step="0.01" value={form.cost_price || ''} onChange={e => setForm({ ...form, cost_price: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Stock Quantity</label>
              <input className="form-input" type="number" min="0" value={form.stock || ''} onChange={e => setForm({ ...form, stock: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-select" value={form.unit || 'pcs'} onChange={e => setForm({ ...form, unit: e.target.value })}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            {product && (
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.active} onChange={e => setForm({ ...form, active: parseInt(e.target.value) })}>
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
              {loading ? <span className="spinner" /> : (product ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StockModal({ product, onSave, onClose }) {
  const [stock, setStock] = useState(product.stock);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateStock(product.id, stock);
      toast.success('Stock updated!');
      onSave();
    } catch {
      toast.error('Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 360 }}>
        <div className="modal-header">
          <h3>📦 Update Stock</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <p style={{ color: 'var(--text2)', marginBottom: 16, fontSize: 14 }}>{product.name}</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label className="form-label">New Stock Quantity ({product.unit})</label>
            <input className="form-input" type="number" min="0" value={stock}
              onChange={e => setStock(parseInt(e.target.value))} required />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Update Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // 'add' | 'edit' | 'stock'
  const [selected, setSelected] = useState(null);

  const fetchData = () => {
    setLoading(true);
    Promise.all([getProducts({ active: undefined }), getCategories()])
      .then(([p, c]) => { setProducts(p.data); setCategories(c.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (product) => {
    if (!window.confirm(`Deactivate "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      toast.success('Product deactivated');
      fetchData();
    } catch {
      toast.error('Failed to deactivate');
    }
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search));
    const matchCat = !filterCategory || p.category_id === parseInt(filterCategory);
    return matchSearch && matchCat;
  });

  const formatCurrency = (v) => `₹${Number(v).toFixed(2)}`;
  const margin = (p) => p.cost_price > 0 ? (((p.price - p.cost_price) / p.price) * 100).toFixed(0) : null;

  return (
    <>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>Products</h1>
            <p>Manage your product catalog and inventory</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setSelected(null); setModal('add'); }}>
            + Add Product
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Filters */}
        <div className="flex gap-12 mb-16">
          <div className="search-bar" style={{ flex: 1 }}>
            <span className="search-icon">🔍</span>
            <input className="form-input" placeholder="Search by name or barcode..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="form-select" style={{ width: 200 }} value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Stats row */}
        <div className="grid-4 mb-16">
          {[
            { label: 'Total Products', value: products.length, color: 'var(--blue)' },
            { label: 'Active', value: products.filter(p => p.active).length, color: 'var(--accent)' },
            { label: 'Low Stock (≤10)', value: products.filter(p => p.stock <= 10 && p.active).length, color: 'var(--orange)' },
            { label: 'Out of Stock', value: products.filter(p => p.stock === 0 && p.active).length, color: 'var(--red)' },
          ].map(stat => (
            <div key={stat.label} className="card" style={{ textAlign: 'center', padding: '14px 16px' }}>
              <div style={{ fontSize: 22, fontFamily: 'Inter', fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Barcode</th>
                  <th>Price</th>
                  <th>Cost</th>
                  <th>Margin</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="thumb-image">
                          <img src={getProductImage(p)} alt="" aria-hidden="true" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.unit}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-blue">{p.category_name || '—'}</span></td>
                    <td style={{ fontFamily: 'Inter', fontSize: 12, color: 'var(--text3)' }}>{p.barcode || '—'}</td>
                    <td style={{ fontFamily: 'Inter', fontWeight: 700, color: 'var(--accent)' }}>{formatCurrency(p.price)}</td>
                    <td style={{ color: 'var(--text2)' }}>{p.cost_price > 0 ? formatCurrency(p.cost_price) : '—'}</td>
                    <td>
                      {margin(p) ? (
                        <span className={`badge ${Number(margin(p)) > 20 ? 'badge-green' : 'badge-orange'}`}>
                          {margin(p)}%
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={`badge ${p.stock === 0 ? 'badge-red' : p.stock <= 10 ? 'badge-orange' : 'badge-green'}`}>
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.active ? 'badge-green' : 'badge-gray'}`}>
                        {p.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-8">
                        <button className="btn btn-ghost btn-sm"
                          onClick={() => { setSelected(p); setModal('stock'); }} title="Update stock">
                          📦
                        </button>
                        <button className="btn btn-ghost btn-sm"
                          onClick={() => { setSelected(p); setModal('edit'); }} title="Edit">
                          ✏️
                        </button>
                        {p.active === 1 && (
                          <button className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(p)} title="Deactivate">
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state">
                        <div className="illustration">
                          <img src={getProductImage({ name: 'Products', category_name: 'household' })} alt="" aria-hidden="true" />
                        </div>
                        <p>No products found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <ProductModal product={modal === 'edit' ? selected : null} categories={categories}
          onSave={() => { setModal(null); fetchData(); }}
          onClose={() => setModal(null)} />
      )}
      {modal === 'stock' && selected && (
        <StockModal product={selected}
          onSave={() => { setModal(null); fetchData(); }}
          onClose={() => setModal(null)} />
      )}
    </>
  );
}
