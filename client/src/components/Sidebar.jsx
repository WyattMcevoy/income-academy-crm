import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: '🏠', enabled: true },
  { label: 'Leads', path: '/leads', icon: '👤', enabled: true },
  { label: 'Clients', path: '/clients', icon: '👥', enabled: true },
  { label: 'Contracts', path: '/contracts', icon: '📄', enabled: false, note: 'Phase 5' },
  { label: 'Invoices', path: '/invoices', icon: '💵', enabled: false, note: 'Phase 6' },
  { label: 'Campaigns', path: '/campaigns', icon: '📧', enabled: false, note: 'Phase 12' },
  { label: 'Credit Builder', path: '/credit-builder', icon: '📊', enabled: true },
  { label: 'Expenses', path: '/expenses', icon: '💰', enabled: true },
  { label: 'Admin', path: '/admin', icon: '🛡️', enabled: true, adminOnly: true },
  { label: 'Settings', path: '/settings', icon: '⚙️', enabled: false, note: 'Later' },
];

const COLLAPSED_STORAGE_KEY = 'ia_sidebar_collapsed';

export default function Sidebar() {
  const { auth, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false); // mobile drawer
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSED_STORAGE_KEY) === '1'; } catch { return false; }
  });

  // Persist + reflect on <body> so .app-main can pad correctly
  useEffect(() => {
    try { localStorage.setItem(COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0'); } catch {}
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    return () => document.body.classList.remove('sidebar-collapsed');
  }, [collapsed]);

  if (!auth) return null;

  const onLogout = () => {
    logout();
    nav('/login');
  };

  const closeMobile = () => setOpen(false);
  const toggleCollapsed = () => setCollapsed(v => !v);

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

      <aside className={`sidebar ${open ? 'sidebar-open' : ''} ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-mark">💼</span>
          <span className="brand-text">Income Academy</span>
          <button
            className="sidebar-collapse-btn"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '›' : '‹'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.filter(item => !item.adminOnly || auth.user?.is_admin).map((item) =>
            item.enabled ? (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={closeMobile}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                }
              >
                <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </NavLink>
            ) : (
              <div
                key={item.path}
                className="sidebar-link sidebar-link-disabled"
                title={collapsed ? `${item.label} — coming soon (${item.note})` : `Coming soon (${item.note})`}
              >
                <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
                <span className="sidebar-badge">soon</span>
              </div>
            )
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" title={auth.user.email}>
            {collapsed ? (auth.user.email?.[0]?.toUpperCase() || '·') : auth.user.email}
          </div>
          <button className="sidebar-logout" onClick={onLogout} title={collapsed ? 'Log out' : undefined}>
            <span className="sidebar-logout-icon" aria-hidden="true">⎋</span>
            <span className="sidebar-logout-label">Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
