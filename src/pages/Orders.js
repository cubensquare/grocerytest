import React, { useState, useEffect, useCallback } from 'react';
import { getOrders, getOrder } from '../services/api';

const formatCurrency = (v) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

function OrderDetailModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(orderId)
      .then(r => setOrder(r.data))
      .finally(() => setLoading(false));
  }, [orderId]);

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h3>🧾 Order Details</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : order ? (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { label: 'Invoice #', value: order.order_number },
                { label: 'Date', value: new Date(order.created_at).toLocaleString('en-IN') },
                { label: 'Cashier', value: order.cashier_name || '—' },
                { label: 'Customer', value: order.customer_name || 'Walk-in' },
                { label: 'Payment', value: order.payment_method?.toUpperCase() },
                { label: 'Status', value: order.payment_status },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: 12, marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Items</div>
              {order.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{item.product_name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{item.quantity} × {formatCurrency(item.product_price)}</div>
                  </div>
                  <div style={{ fontFamily: 'Inter', fontWeight: 700, color: 'var(--text)' }}>{formatCurrency(item.subtotal)}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text2)' }}>
                <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--red)' }}>
                  <span>Discount</span><span>−{formatCurrency(order.discount)}</span>
                </div>
              )}
              {Number(order.tax) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text2)' }}>
                  <span>Tax</span><span>+{formatCurrency(order.tax)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter', fontSize: 20, fontWeight: 800, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <span>Total</span>
                <span style={{ color: 'var(--accent)' }}>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        ) : <p style={{ color: 'var(--text3)' }}>Order not found.</p>}
      </div>
    </div>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const today = new Date().toISOString().split('T')[0];

  const fetchOrders = useCallback(() => {
    setLoading(true);
    getOrders({ from: dateFrom, to: dateTo, limit: 100 })
      .then(r => setOrders(r.data))
      .finally(() => setLoading(false));
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const filtered = orders.filter(o =>
    o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
    o.cashier_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = filtered.reduce((sum, o) => sum + Number(o.total), 0);
  const avgOrder = filtered.length ? totalRevenue / filtered.length : 0;

  const paymentBadge = (method) => {
    const map = { cash: 'badge-green', card: 'badge-blue', upi: 'badge-purple', wallet: 'badge-orange' };
    return map[method] || 'badge-gray';
  };

  return (
    <>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1>Orders</h1>
            <p>Complete transaction history and receipts</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Summary cards */}
        <div className="grid-4 mb-16">
          {[
            { label: 'Total Orders', value: filtered.length, color: 'var(--blue)' },
            { label: 'Total Revenue', value: `₹${Math.round(totalRevenue).toLocaleString('en-IN')}`, color: 'var(--accent)' },
            { label: 'Avg Order Value', value: `₹${Math.round(avgOrder).toLocaleString('en-IN')}`, color: 'var(--purple)' },
            { label: 'Cash Orders', value: filtered.filter(o => o.payment_method === 'cash').length, color: 'var(--orange)' },
          ].map(s => (
            <div key={s.label} className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Inter', fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-12 mb-16">
          <div className="search-bar" style={{ flex: 1 }}>
            <span className="search-icon">🔍</span>
            <input className="form-input" placeholder="Search by invoice, cashier, or customer..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-8 items-center">
            <label style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap' }}>From</label>
            <input className="form-input" type="date" value={dateFrom} max={today}
              onChange={e => setDateFrom(e.target.value)} style={{ width: 160 }} />
          </div>
          <div className="flex gap-8 items-center">
            <label style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap' }}>To</label>
            <input className="form-input" type="date" value={dateTo} max={today}
              onChange={e => setDateTo(e.target.value)} style={{ width: 160 }} />
          </div>
          <button className="btn btn-ghost" onClick={() => { setDateFrom(''); setDateTo(''); setSearch(''); }}>
            Clear
          </button>
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice #</th>
                  <th>Date & Time</th>
                  <th>Cashier</th>
                  <th>Customer</th>
                  <th>Payment</th>
                  <th>Subtotal</th>
                  <th>Discount</th>
                  <th>Total</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(order => (
                  <tr key={order.id} style={{ cursor: 'pointer' }}>
                    <td>
                      <span style={{ fontFamily: 'Inter', fontWeight: 700, color: 'var(--accent)', fontSize: 12 }}>
                        {order.order_number}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text2)', fontSize: 12 }}>
                      <div>{new Date(order.created_at).toLocaleDateString('en-IN')}</div>
                      <div style={{ color: 'var(--text3)' }}>{new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td style={{ color: 'var(--text2)' }}>{order.cashier_name || '—'}</td>
                    <td style={{ color: 'var(--text2)' }}>{order.customer_name || 'Walk-in'}</td>
                    <td>
                      <span className={`badge ${paymentBadge(order.payment_method)}`}>
                        {order.payment_method}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text2)' }}>{formatCurrency(order.subtotal)}</td>
                    <td style={{ color: Number(order.discount) > 0 ? 'var(--red)' : 'var(--text3)' }}>
                      {Number(order.discount) > 0 ? `−${formatCurrency(order.discount)}` : '—'}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'Inter', fontWeight: 700, color: 'var(--accent)' }}>
                        {formatCurrency(order.total)}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setSelectedOrderId(order.id)}>
                        🧾 View
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9}>
                      <div className="empty-state">
                        <span className="icon">🧾</span>
                        <p>No orders found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrderId && (
        <OrderDetailModal orderId={selectedOrderId} onClose={() => setSelectedOrderId(null)} />
      )}
    </>
  );
}
