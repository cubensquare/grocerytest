import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_VISUAL_IMAGE } from '../utils/visuals';

const navItems = [
  { icon: '🏠', label: 'Dashboard', path: '/dashboard', section: 'main' },
  { icon: '🛒', label: 'POS / Billing', path: '/pos', section: 'main' },
  { icon: '📦', label: 'Products', path: '/products', section: 'inventory' },
  { icon: '🗂️', label: 'Categories', path: '/categories', section: 'inventory' },
  { icon: '🧾', label: 'Orders', path: '/orders', section: 'sales' },
  { icon: '👥', label: 'Customers', path: '/customers', section: 'sales' },
];

const sections = {
  main: 'Overview',
  inventory: 'Inventory',
  sales: 'Sales',
};

const grouped = navItems.reduce((acc, item) => {
  if (!acc[item.section]) acc[item.section] = [];
  acc[item.section].push(item);
  return acc;
}, {});

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <img src={DEFAULT_VISUAL_IMAGE} alt="" aria-hidden="true" />
        </div>
        <div className="sidebar-logo-text">
          <h2>GroceryPOS</h2>
          <span>Supermarket Admin</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {Object.entries(grouped).map(([section, items]) => (
          <div key={section}>
            <div className="nav-section-label">{sections[section]}</div>
            {items.map(item => (
              <button
                key={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="name">{user?.name}</div>
            <div className="role">{user?.role}</div>
          </div>
        </div>
        <button className="nav-link" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}
