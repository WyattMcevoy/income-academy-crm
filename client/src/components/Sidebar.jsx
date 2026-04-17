import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: '🏠', enabled: true },
  { label: 'Leads', path: '/leads', icon: '👤', enabled: true },
  { label: 'Clients', path: '/clients', icon: '👥', enabled: true },
  { label: 'Contracts', path: '/contracts', icon: '📄', enabled: false, note: 'Phase 5' },
  { label: 'Invoices', path: '/invoices', icon: '💵', enabled: false, note: 'Phase 6' },
  { label: 'Campaigns', path: '/campaigns', icon: '📧', enabled: false, note: 'Phase 12' },
  { label: 'Expenses', path: '/expenses', icon: '💰', enabled: true },
  { label: 'Settings', path: '/settings', icon: '⚙️', enabled: false, note: 'Later' },
];

export default function Sidebar() {
  const { auth, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  if (!auth) return null;

  const onLogout = () => {
    logout();
    nav('/login');
  };

  const closeMobile = () => setOpen(false);

  return (
    <>
      <button
        className="hamburger"
        aria-label="Open menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? '✕' : '☰'}
      </button>

      {open && <div className="sidebar-backdrop" onClick={closeMobile} />}

      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">💼</span>
          <span className="brand-text">Income Academy</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) =>
            item.enabled ? (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                }
              >
                <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ) : (
              <div
                key={item.path}
                className="sidebar-link sidebar-link-disabled"
                title={`Coming soon (${item.note})`}
              >
                <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
                <span className="sidebar-badge">soon</span>
              </div>
            )
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" title={auth.user.email}>
            {auth.user.email}
          </div>
          <button className="sidebar-logout" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
