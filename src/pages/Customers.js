import React, { useState, useEffect } from 'react';
import { getCustomers, createCustomer } from '../services/api';
import toast from 'react-hot-toast';

function CustomerModal({ onSave, onClose }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createCustomer(form);
      toast.success('Customer added!');
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h3>➕ New Customer</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input className="form-input" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Customer name" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile number" />
            </div>
            <div className="form-group">
              <label className="form-label">Email (Optional)</label>
              <input className="form-input" type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} placeholder="customer@email.com" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={loading}>
              {loading ? <span className="spinner" /> : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  const fetchData = (q = '') => {
    setLoading(true);
    getCustomers({ search: q })
      .then(r => setCustomers(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search)) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const initials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const AVATAR_COLORS = [
    'var(--accent-dim)', 'var(--blue-dim)', 'var(--orange-dim)',
    'var(--purple-dim)', 'var(--red-dim)',
  ];
  const TEXT_COLORS = [
    'var(--accent)', 'var(--blue)', 'var(--orange)', 'var(--purple)', 'var(--red)',
  ];

  return (
    <>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>Customers</h1>
            <p>Manage customer profiles and loyalty points</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModal(true)}>
            + Add Customer
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Stats */}
        <div className="grid-3 mb-16">
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Inter', fontSize: 28, fontWeight: 800, color: 'var(--blue)' }}>{customers.length}</div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Total Customers</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Inter', fontSize: 28, fontWeight: 800, color: 'var(--accent)' }}>
              {customers.reduce((s, c) => s + (c.loyalty_points || 0), 0).toLocaleString()}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Total Loyalty Points</div>
          </div>
          <div className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Inter', fontSize: 28, fontWeight: 800, color: 'var(--purple)' }}>
              {customers.filter(c => c.loyalty_points >= 100).length}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>Loyalty Members (100+ pts)</div>
          </div>
        </div>

        {/* Search */}
        <div className="search-bar mb-16">
          <span className="search-icon">🔍</span>
          <input className="form-input" placeholder="Search by name, phone, or email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Loyalty Points</th>
                  <th>Member Since</th>
                  <th>Tier</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => {
                  const tier = c.loyalty_points >= 500 ? { label: '🥇 Gold', badge: 'badge-orange' }
                    : c.loyalty_points >= 200 ? { label: '🥈 Silver', badge: 'badge-gray' }
                    : c.loyalty_points >= 50 ? { label: '🥉 Bronze', badge: 'badge-blue' }
                    : { label: 'New', badge: 'badge-gray' };
                  return (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-12">
                          <div style={{
                            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                            background: AVATAR_COLORS[i % AVATAR_COLORS.length],
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 13, fontWeight: 800, color: TEXT_COLORS[i % TEXT_COLORS.length],
                            fontFamily: 'Inter'
                          }}>
                            {initials(c.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text)' }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text3)' }}>ID #{c.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text2)' }}>{c.phone || '—'}</td>
                      <td style={{ color: 'var(--text2)', fontSize: 13 }}>{c.email || '—'}</td>
                      <td>
                        <div className="flex items-center gap-8">
                          <span style={{ fontFamily: 'Inter', fontWeight: 700, color: 'var(--accent)' }}>
                            {c.loyalty_points?.toLocaleString() || 0}
                          </span>
                          <span style={{ fontSize: 11, color: 'var(--text3)' }}>pts</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text3)', fontSize: 12 }}>
                        {new Date(c.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td>
                        <span className={`badge ${tier.badge}`}>{tier.label}</span>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6}>
                    <div className="empty-state">
                      <span className="icon">👥</span>
                      <p>No customers found</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <CustomerModal
          onSave={() => { setModal(false); fetchData(); }}
          onClose={() => setModal(false)} />
      )}
    </>
  );
}
