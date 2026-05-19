import { useState, useEffect, useCallback } from 'react';
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
const HIDDEN_STORAGE_KEY = 'ia_sidebar_hidden';

// ---------- Fullscreen helpers (cross-browser) ----------
function isFullscreen() {
  return !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
}

function requestFullscreen(el = document.documentElement) {
  if (el.requestFullscreen) return el.requestFullscreen();
  if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
  if (el.msRequestFullscreen) return el.msRequestFullscreen();
  return Promise.resolve();
}

function exitFullscreenSafe() {
  if (document.exitFullscreen) return document.exitFullscreen();
  if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
  if (document.msExitFullscreen) return document.msExitFullscreen();
  return Promise.resolve();
}

export default function Sidebar() {
  const { auth, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false); // mobile drawer
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem(COLLAPSED_STORAGE_KEY) === '1'; } catch { return false; }
  });
  const [hidden, setHidden] = useState(() => {
    try { return localStorage.getItem(HIDDEN_STORAGE_KEY) === '1'; } catch { return false; }
  });
  const [showHint, setShowHint] = useState(false);

  // Persist + reflect collapse state on <body>
  useEffect(() => {
    try { localStorage.setItem(COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0'); } catch {}
    document.body.classList.toggle('sidebar-collapsed', collapsed);
    return () => document.body.classList.remove('sidebar-collapsed');
  }, [collapsed]);

  // Persist + reflect hidden state on <body>
  useEffect(() => {
    try { localStorage.setItem(HIDDEN_STORAGE_KEY, hidden ? '1' : '0'); } catch {}
    document.body.classList.toggle('sidebar-hidden', hidden);
    return () => document.body.classList.remove('sidebar-hidden');
  }, [hidden]);

  // Sync sidebar hidden state with browser fullscreen (so Esc exits cleanly)
  useEffect(() => {
    const onFsChange = () => {
      if (!isFullscreen() && hidden) {
        setHidden(false);
        setShowHint(false);
      }
    };
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, [hidden]);

  // Combined toggle: sidebar hide + browser fullscreen, all in one
  const togglePresentation = useCallback(async () => {
    if (isFullscreen()) {
      try { await exitFullscreenSafe(); } catch {}
      setHidden(false);
      setShowHint(false);
    } else {
      try { await requestFullscreen(); } catch (e) {
        // Fullscreen denied (rare, but possible on some embeds).
        // Still hide the sidebar so they at least get a cleaner demo.
        console.warn('Fullscreen request denied:', e?.message);
      }
      setHidden(true);
      setShowHint(true);
      // Auto-dismiss the hint after 5 seconds
      setTimeout(() => setShowHint(false), 5000);
    }
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + Shift + P toggles full presentation mode
  // ("P" for Presentation. Avoids macOS-reserved combos like Cmd+. )
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        togglePresentation();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePresentation]);

  if (!auth) return null;

  const onLogout = () => {
    logout();
    nav('/login');
  };

  const closeMobile = () => setOpen(false);
  const toggleCollapsed = () => setCollapsed(v => !v);
  const showSidebar = () => {
    if (isFullscreen()) exitFullscreenSafe().catch(() => {});
    setHidden(false);
  };

  return (
    <>
      {/* Floating "show sidebar" button — visible only when sidebar is hidden */}
      <button
        className="sidebar-restore"
        onClick={showSidebar}
        title="Exit presentation (⌘⇧P or Esc)"
        aria-label="Show sidebar"
      >
        ☰
      </button>

      {/* Toast hint that briefly appears when entering presentation mode */}
      {showHint && (
        <div className="sidebar-hint" role="status">
          Presentation mode — press <kbd>Esc</kbd> or <kbd>⌘⇧P</kbd> to exit
        </div>
      )}

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
          <button
            className="sidebar-hide-btn"
            onClick={togglePresentation}
            title="Hide sidebar + go fullscreen (⌘⇧P)"
          >
            Presentation mode
          </button>
        </div>
      </aside>
    </>
  );
}
