import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';
import toast from 'react-hot-toast';
import { getCategoryImage } from '../utils/visuals';

function CategoryModal({ category, onSave, onClose }) {
  const [form, setForm] = useState({ name: category?.name || '', description: category?.description || '' });
  const [loading, setLoading] = useState(false);
  const preview = getCategoryImage(form.name);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (category) { await updateCategory(category.id, form); toast.success('Category updated!'); }
      else          { await createCategory(form);              toast.success('Category created!'); }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h3>{category ? '✏️ Edit Category' : '➕ New Category'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* Live image preview */}
        <div style={{ width: '100%', height: 120, borderRadius: 12, overflow: 'hidden', marginBottom: 20, border: '1px solid var(--border)', position: 'relative' }}>
          <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
            display: 'flex', alignItems: 'flex-end', padding: '12px 14px'
          }}>
            <span style={{ color: '#fff', fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>
              {form.name || 'Category Name'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Category Name *</label>
              <input className="form-input" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required placeholder="e.g. Fruits & Vegetables" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" rows={3} value={form.description || ''}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description" style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
              {loading ? <span className="spinner" /> : (category ? 'Update' : 'Create Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(false);
  const [selected, setSelected]     = useState(null);

  const fetchData = () => {
    setLoading(true);
    getCategories().then(r => setCategories(r.data)).finally(() => setLoading(false));
  };
  useEffect(() => { fetchData(); }, []);

  const handleDelete = async (cat) => {
    if (cat.product_count > 0) { toast.error(`Cannot delete: ${cat.product_count} products in this category`); return; }
    if (!window.confirm(`Delete "${cat.name}"?`)) return;
    try { await deleteCategory(cat.id); toast.success('Category deleted'); fetchData(); }
    catch { toast.error('Failed to delete category'); }
  };

  return (
    <>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div><h1>Categories</h1><p>Organize your products into categories</p></div>
          <button className="btn btn-primary" onClick={() => { setSelected(null); setModal(true); }}>+ Add Category</button>
        </div>
      </div>

      <div className="page-content">
        {loading ? (
          <div className="page-loading"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : (
          <>
            {/* Summary */}
            <div className="flex gap-16 mb-20">
              {[
                { label: 'Total Categories', value: categories.length,                                        color: 'var(--blue)' },
                { label: 'Total Products',   value: categories.reduce((s, c) => s + (c.product_count || 0), 0), color: 'var(--accent)' },
                { label: 'Empty Categories', value: categories.filter(c => (c.product_count || 0) === 0).length, color: 'var(--orange)' },
              ].map(s => (
                <div key={s.label} className="card" style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Category cards with hero images */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {categories.map((cat) => (
                <div key={cat.id} className="card" style={{ padding: 0, overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>

                  {/* Hero image banner */}
                  <div style={{ position: 'relative', height: 110, overflow: 'hidden', background: 'var(--surface2)' }}>
                    <img
                      src={getCategoryImage(cat.name)}
                      alt={cat.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s ease' }}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.06)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                    {/* gradient overlay */}
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(to top, rgba(13,15,20,0.85) 0%, rgba(13,15,20,0.2) 60%, transparent 100%)',
                    }} />
                    {/* Actions overlay */}
                    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-icon btn-sm"
                        style={{ background: 'rgba(22,25,32,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)' }}
                        onClick={() => { setSelected(cat); setModal(true); }} title="Edit">✏️</button>
                      <button className="btn btn-danger btn-icon btn-sm"
                        style={{ background: 'rgba(22,25,32,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(248,113,113,0.2)' }}
                        onClick={() => handleDelete(cat)} title="Delete">🗑️</button>
                    </div>
                    {/* Product count badge */}
                    <div style={{ position: 'absolute', bottom: 8, left: 12 }}>
                      <span className="badge badge-green" style={{ fontSize: 11 }}>
                        {cat.active_product_count || cat.product_count || 0} products
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: '12px 14px' }}>
                    <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 4 }}>{cat.name}</div>
                    {cat.description && (
                      <div style={{ fontSize: 12, color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cat.description}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Add new card */}
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 10, minHeight: 180, cursor: 'pointer',
                border: '1.5px dashed var(--border)', borderRadius: 'var(--radius-lg)',
                color: 'var(--text3)', fontSize: 14, fontWeight: 600,
                transition: 'all 0.15s'
              }}
                onClick={() => { setSelected(null); setModal(true); }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-dim2)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.color = 'var(--text3)';  e.currentTarget.style.background = 'transparent'; }}>
                <div style={{ fontSize: 32 }}>+</div>
                <div>New Category</div>
              </div>
            </div>

            {categories.length === 0 && (
              <div className="empty-state">
                <div className="illustration"><img src={getCategoryImage('Fruits & Vegetables')} alt="" /></div>
                <p>No categories yet. Add your first one!</p>
              </div>
            )}
          </>
        )}
      </div>

      {modal && (
        <CategoryModal category={selected}
          onSave={() => { setModal(false); fetchData(); }}
          onClose={() => setModal(false)} />
      )}
    </>
  );
}
