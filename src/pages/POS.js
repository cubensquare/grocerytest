import React, { useState, useEffect, useRef } from 'react';
import { getProducts, getCategories, getCustomers, createOrder } from '../services/api';
import toast from 'react-hot-toast';
import { getCategoryImage, getProductImage, getStatImage } from '../utils/visuals';

const formatCurrency = (v) => `₹${Number(v).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const PaymentModal = ({ cart, subtotal, onConfirm, onClose }) => {
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [cashGiven, setCashGiven] = useState('');

  const total = Math.max(0, subtotal - Number(discount) + Number(tax));
  const change = Number(cashGiven) - total;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <h3>💳 Payment</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        {/* Cart summary */}
        <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: 12, marginBottom: 16, maxHeight: 160, overflowY: 'auto' }}>
          {cart.map(item => (
            <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
              <span style={{ color: 'var(--text2)' }}>{item.name} × {item.quantity}</span>
              <span style={{ color: 'var(--text)', fontWeight: 600 }}>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="form-group">
              <label className="form-label">Discount (₹)</label>
              <input className="form-input" type="number" min="0" value={discount}
                onChange={e => setDiscount(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Tax (₹)</label>
              <input className="form-input" type="number" min="0" value={tax}
                onChange={e => setTax(e.target.value)} />
            </div>
          </div>

          <div style={{ background: 'var(--surface2)', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, color: 'var(--text2)' }}>
              <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
            </div>
            {Number(discount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, color: 'var(--red)' }}>
                <span>Discount</span><span>−{formatCurrency(discount)}</span>
              </div>
            )}
            {Number(tax) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, color: 'var(--text2)' }}>
                <span>Tax</span><span>+{formatCurrency(tax)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter', fontSize: 22, fontWeight: 800, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <span>Total</span>
              <span style={{ color: 'var(--accent)' }}>{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="form-group">
            <label className="form-label">Payment Method</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {['cash', 'card', 'upi', 'wallet'].map(m => (
                <button key={m}
                  onClick={() => setPaymentMethod(m)}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 8,
                    border: `1px solid ${paymentMethod === m ? 'var(--accent)' : 'var(--border)'}`,
                    background: paymentMethod === m ? 'var(--accent-dim)' : 'var(--surface2)',
                    color: paymentMethod === m ? 'var(--accent)' : 'var(--text2)',
                    cursor: 'pointer', fontWeight: 600, fontSize: 12,
                    fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: '0.04em'
                  }}>
                  {m === 'cash' ? '💵' : m === 'card' ? '💳' : m === 'upi' ? '📱' : '👛'} {m}
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === 'cash' && (
            <div className="form-group">
              <label className="form-label">Cash Given (₹)</label>
              <input className="form-input" type="number" min={total}
                value={cashGiven} onChange={e => setCashGiven(e.target.value)}
                placeholder={formatCurrency(total)} />
              {Number(cashGiven) >= total && (
                <div style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
                  Change: {formatCurrency(Math.max(0, change))}
                </div>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" style={{ flex: 2 }}
              onClick={() => onConfirm({ discount: Number(discount), tax: Number(tax), payment_method: paymentMethod, total })}>
              ✓ Complete Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReceiptModal = ({ receipt, onClose }) => (
  <div className="modal-overlay">
    <div className="modal" style={{ maxWidth: 380 }}>
      <div className="modal-header">
        <h3>🧾 Receipt</h3>
        <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
      </div>
      <div className="receipt">
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontFamily: 'Inter', fontSize: 18, fontWeight: 800 }}>GroceryPOS</div>
          <div style={{ color: 'var(--text3)', fontSize: 12 }}>Supermarket</div>
          <div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 4 }}>{new Date().toLocaleString('en-IN')}</div>
        </div>
        <hr className="receipt-divider" />
        <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>
          Invoice: {receipt.order_number}
        </div>
        {receipt.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
            <div>
              <div style={{ color: 'var(--text)' }}>{item.name}</div>
              <div style={{ color: 'var(--text3)', fontSize: 11 }}>{item.quantity} × ₹{item.price}</div>
            </div>
            <div style={{ fontWeight: 600, color: 'var(--text)' }}>₹{(item.quantity * item.price).toFixed(2)}</div>
          </div>
        ))}
        <hr className="receipt-divider" />
        {receipt.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--red)', marginBottom: 4 }}>
            <span>Discount</span><span>−₹{receipt.discount.toFixed(2)}</span>
          </div>
        )}
        {receipt.tax > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>
            <span>Tax</span><span>+₹{receipt.tax.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter', fontSize: 18, fontWeight: 800, marginTop: 8 }}>
          <span>TOTAL</span>
          <span style={{ color: 'var(--accent)' }}>₹{receipt.total.toFixed(2)}</span>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16, color: 'var(--text3)', fontSize: 12 }}>
          Payment: <span style={{ color: 'var(--text2)', fontWeight: 600, textTransform: 'uppercase' }}>{receipt.payment_method}</span>
        </div>
        <hr className="receipt-divider" />
        <div style={{ textAlign: 'center', color: 'var(--text3)', fontSize: 12 }}>Thank you for shopping with us! 🛍️</div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => window.print()}>🖨️ Print</button>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={onClose}>New Bill</button>
      </div>
    </div>
  </div>
);

export default function POS() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef(null);

  useEffect(() => {
    Promise.all([
      getProducts({ active: 'true' }),
      getCategories(),
      getCustomers()
    ]).then(([p, c, cust]) => {
      setProducts(p.data);
      setCategories(c.data);
      setCustomers(cust.data);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search));
    const matchCat = selectedCategory === 'all' || p.category_id === parseInt(selectedCategory);
    return matchSearch && matchCat;
  });

  const addToCart = (product) => {
    if (product.stock <= 0) { toast.error('Out of stock!'); return; }
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) { toast.error('Insufficient stock!'); return prev; }
        return prev.map(i => i.product_id === product.id
          ? { ...i, quantity: i.quantity + 1 }
          : i);
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: 1, stock: product.stock }];
    });
  };

  const updateQty = (productId, delta) => {
    setCart(prev => prev
      .map(i => i.product_id === productId ? { ...i, quantity: i.quantity + delta } : i)
      .filter(i => i.quantity > 0)
    );
  };

  const removeFromCart = (productId) => setCart(prev => prev.filter(i => i.product_id !== productId));

  const clearCart = () => { setCart([]); setSelectedCustomer(''); };

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleConfirmPayment = async ({ discount, tax, payment_method, total }) => {
    try {
      const res = await createOrder({
        customer_id: selectedCustomer || null,
        items: cart.map(i => ({ product_id: i.product_id, name: i.name, price: i.price, quantity: i.quantity })),
        discount, tax, payment_method
      });
      setShowPayment(false);
      setReceipt({ order_number: res.data.order_number, items: cart, discount, tax, total, payment_method });
      setCart([]);
      setSelectedCustomer('');
      toast.success(`Order ${res.data.order_number} completed!`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create order');
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div className="pos-layout">
      {/* Left: Products */}
      <div className="pos-products">
        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <span className="search-icon">🔍</span>
            <input className="form-input" ref={searchRef}
              placeholder="Search products or scan barcode..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {/* Category tabs */}
        <div className="cat-tabs">
          <button className={`cat-tab ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}>All</button>
          {categories.map(c => (
            <button key={c.id}
              className={`cat-tab ${selectedCategory === c.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(selectedCategory === c.id ? 'all' : c.id)}>
              <img
                src={getCategoryImage(c.name)}
                alt=""
                aria-hidden="true"
                style={{ width: 16, height: 16, borderRadius: 4, objectFit: 'cover' }}
              />
              {c.name}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="pos-product-grid">
          {filtered.map(p => (
            <div key={p.id} className="pos-product-card" onClick={() => addToCart(p)}
              style={{ opacity: p.stock <= 0 ? 0.5 : 1, cursor: p.stock <= 0 ? 'not-allowed' : 'pointer' }}>
              <div className="pos-product-media">
                <img src={getProductImage(p)} alt="" aria-hidden="true" />
              </div>
              <div className="pos-product-name">{p.name}</div>
              <div className="pos-product-price">{formatCurrency(p.price)}</div>
              <div className="pos-product-stock" style={{ color: p.stock <= 5 ? 'var(--orange)' : 'var(--text3)' }}>
                {p.stock <= 0 ? '❌ Out of stock' : p.stock <= 5 ? `⚠️ ${p.stock} left` : `✓ ${p.stock} ${p.unit}`}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1' }}>
              <div className="empty-state">
                <div className="illustration">
                  <img src={getStatImage('chart')} alt="" aria-hidden="true" />
                </div>
                <p>No products found</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart */}
      <div className="pos-cart">
        <div className="cart-header">
          <div>
            <h3>🛒 Cart</h3>
            <span style={{ fontSize: 12, color: 'var(--text3)' }}>{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
          </div>
          {cart.length > 0 && (
            <button className="btn btn-danger btn-sm" onClick={clearCart}>Clear</button>
          )}
        </div>

        {/* Customer select */}
        <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
          <select className="form-select" value={selectedCustomer} onChange={e => setSelectedCustomer(e.target.value)}>
            <option value="">👤 Walk-in Customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name} {c.phone ? `(${c.phone})` : ''}</option>
            ))}
          </select>
        </div>

        {/* Cart items */}
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-state">
              <div className="illustration">
                <img src={getStatImage('store')} alt="" aria-hidden="true" />
              </div>
              <p>Cart is empty</p>
              <p style={{ fontSize: 12 }}>Click a product to add it</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product_id} className="cart-item">
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">{formatCurrency(item.price)} / unit</div>
                </div>
                <div className="cart-item-qty">
                  <button className="qty-btn" onClick={() => updateQty(item.product_id, -1)}>−</button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQty(item.product_id, 1)}
                    disabled={item.quantity >= item.stock}>+</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <div className="cart-item-subtotal">{formatCurrency(item.price * item.quantity)}</div>
                  <button style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 14 }}
                    onClick={() => removeFromCart(item.product_id)}>✕</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="cart-footer">
          <div className="cart-summary-row">
            <span>Subtotal</span>
            <span style={{ color: 'var(--text)', fontWeight: 600 }}>{formatCurrency(subtotal)}</span>
          </div>
          <div className="cart-total-row">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <button className="btn btn-primary btn-lg btn-block"
            disabled={cart.length === 0}
            onClick={() => setShowPayment(true)}>
            💳 Charge {formatCurrency(subtotal)}
          </button>
        </div>
      </div>

      {showPayment && (
        <PaymentModal cart={cart} subtotal={subtotal}
          onConfirm={handleConfirmPayment}
          onClose={() => setShowPayment(false)} />
      )}
      {receipt && (
        <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />
      )}
    </div>
  );
}
