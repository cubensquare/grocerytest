import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { DEFAULT_VISUAL_IMAGE, getStatImage, getProductImage } from '../utils/visuals';

const formatCurrency = (v) => `₹${Number(v).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{
        background: 'var(--surface2)', border: '1px solid var(--border)',
        borderRadius: 8, padding: '10px 14px', fontSize: 13
      }}>
        <p style={{ color: 'var(--text3)', marginBottom: 4 }}>{label}</p>
        <p style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatCurrency(payload[0].value)}</p>
        <p style={{ color: 'var(--text2)' }}>{payload[1]?.value} orders</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page-loading">
      <div className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  const { today, monthly, topProducts, lowStock, recentOrders, weeklyData } = stats || {};
  const fallbackImage = (event) => {
    event.currentTarget.onerror = null;
    event.currentTarget.src = DEFAULT_VISUAL_IMAGE;
  };

  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening today.</p>
      </div>

      <div className="page-content">
        {/* Stats */}
        <div className="grid-4 mb-20">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--accent-dim)' }}>
              <img src={getStatImage('revenue')} alt="" aria-hidden="true" onError={fallbackImage} />
              </div>
            <div>
              <div className="stat-label">Today's Revenue</div>
              <div className="stat-value">{formatCurrency(today?.revenue || 0)}</div>
              <div className="stat-sub">{today?.order_count || 0} transactions</div>
            </div>
          </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--blue-dim)' }}>
              <img src={getStatImage('chart')} alt="" aria-hidden="true" onError={fallbackImage} />
              </div>
            <div>
              <div className="stat-label">Monthly Revenue</div>
              <div className="stat-value">{formatCurrency(monthly?.revenue || 0)}</div>
              <div className="stat-sub">{monthly?.order_count || 0} orders this month</div>
            </div>
          </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--orange-dim)' }}>
              <img src={getStatImage('stock')} alt="" aria-hidden="true" onError={fallbackImage} />
              </div>
            <div>
              <div className="stat-label">Low Stock Items</div>
              <div className="stat-value" style={{ color: lowStock?.length > 0 ? 'var(--orange)' : 'var(--accent)' }}>
                {lowStock?.length || 0}
              </div>
              <div className="stat-sub">Items need restocking</div>
            </div>
          </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'var(--purple-dim)' }}>
              <img src={getStatImage('store')} alt="" aria-hidden="true" onError={fallbackImage} />
              </div>
            <div>
              <div className="stat-label">Avg. Order Value</div>
              <div className="stat-value">
                {today?.order_count > 0 ? formatCurrency(today.revenue / today.order_count) : '₹0'}
              </div>
              <div className="stat-sub">Per transaction today</div>
            </div>
          </div>
        </div>

        {/* Chart + Top Products */}
        <div className="grid-2 mb-20">
          {/* Weekly chart */}
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 20 }}>Weekly Revenue</h3>
            {weeklyData?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={weeklyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={v => new Date(v).toLocaleDateString('en-IN', { weekday: 'short' })}
                    tick={{ fill: 'var(--text3)', fontSize: 11 }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`}
                    tick={{ fill: 'var(--text3)', fontSize: 11 }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--surface2)' }} />
                  <Bar dataKey="revenue" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="orders" fill="var(--blue-dim)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state">
                <div className="illustration">
                  <img src={getStatImage('chart')} alt="" aria-hidden="true" onError={fallbackImage} />
                </div>
                <p>No sales data yet</p>
              </div>
            )}
          </div>

          {/* Top products */}
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Top Selling Products</h3>
            {topProducts?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-12">
                    <div className="thumb-image" style={{ width: 34, height: 34 }}>
                      <img src={getProductImage(p)} alt="" aria-hidden="true" onError={fallbackImage} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.product_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.total_qty} units sold</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', fontFamily: 'Inter' }}>{formatCurrency(p.revenue)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="illustration">
                  <img src={getProductImage({ name: 'Products', category_name: 'household' })} alt="" aria-hidden="true" onError={fallbackImage} />
                </div>
                <p>No sales yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock + Recent Orders */}
        <div className="grid-2">
          {/* Low stock */}
          <div className="card">
            <div className="flex items-center justify-between mb-16">
              <h3 style={{ fontSize: 16 }}>⚠️ Low Stock Alert</h3>
              <span className="badge badge-orange">{lowStock?.length || 0} items</span>
            </div>
            {lowStock?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {lowStock.map(p => (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: p.stock === 0 ? 'var(--red-dim)' : 'var(--surface2)',
                    border: `1px solid ${p.stock === 0 ? 'rgba(248,113,113,0.2)' : 'var(--border)'}`,
                    borderRadius: 8
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.unit}</div>
                    </div>
                    <span className={`badge ${p.stock === 0 ? 'badge-red' : 'badge-orange'}`}>
                      {p.stock === 0 ? 'Out of stock' : `${p.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="illustration">
                  <img src={getStatImage('store')} alt="" aria-hidden="true" onError={fallbackImage} />
                </div>
                <p>All items well stocked</p>
              </div>
            )}
          </div>

          {/* Recent orders */}
          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Recent Orders</h3>
            {recentOrders?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentOrders.map(o => (
                  <div key={o.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'var(--surface2)',
                    border: '1px solid var(--border)',
                    borderRadius: 8
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{o.order_number}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                        {new Date(o.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} · {o.cashier_name}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', fontFamily: 'Inter' }}>{formatCurrency(o.total)}</div>
                      <span className={`badge badge-${o.payment_method === 'cash' ? 'green' : 'blue'}`} style={{ fontSize: 10 }}>
                        {o.payment_method}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="illustration">
                  <img src={getStatImage('revenue')} alt="" aria-hidden="true" onError={fallbackImage} />
                </div>
                <p>No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
