import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth.jsx';
import { api } from '../api.js';

const EVENT_LABELS = {
  login: 'Logged in',
  register: 'Registered',
  cb_select: 'Credit Builder — selected option',
  cb_complete: 'Credit Builder — completed item',
  cb_vendor: 'Credit Builder — vendor action',
};

function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

function StatusDot({ ok }) {
  return (
    <span style={{
      display: 'inline-block',
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: ok ? '#059669' : '#dc3545',
      marginRight: 8,
    }} />
  );
}

export default function Admin() {
  const { auth } = useAuth();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [linkHealth, setLinkHealth] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingLinks, setCheckingLinks] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [s, a, u, lh] = await Promise.all([
        api('/api/admin/stats', { token: auth.token }),
        api('/api/admin/activity?limit=50', { token: auth.token }),
        api('/api/admin/users', { token: auth.token }),
        api('/api/admin/link-health', { token: auth.token }),
      ]);
      setStats(s);
      setActivity(a);
      setUsers(u);
      setLinkHealth(lh);
    } catch (e) {
      console.error('Admin fetch failed:', e);
    } finally {
      setLoading(false);
    }
  }, [auth.token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const runLinkCheck = async () => {
    setCheckingLinks(true);
    try {
      const result = await api('/api/admin/link-health/run', { method: 'POST', token: auth.token });
      setLinkHealth(result.results.map(r => ({
        url: r.url,
        resource_name: r.name,
        sub_item: r.sub_item,
        status_code: r.status_code,
        ok: r.ok,
        error_message: r.error_message,
        checked_at: new Date().toISOString(),
      })));
    } catch (e) {
      console.error('Link check failed:', e);
    } finally {
      setCheckingLinks(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 40, color: '#6b7280' }}>Loading admin dashboard...</div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p className="page-subtitle">User activity, credit builder engagement, and system health.</p>
      </div>

      <div className="admin-tabs">
        {['overview', 'users', 'activity', 'links'].map(t => (
          <button
            key={t}
            className={`admin-tab ${tab === t ? 'admin-tab-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'overview' ? 'Overview' : t === 'users' ? 'Users' : t === 'activity' ? 'Activity Log' : 'Link Health'}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div className="admin-section">
          <div className="admin-kpi-grid">
            <div className="admin-kpi">
              <div className="admin-kpi-value">{stats.total_users}</div>
              <div className="admin-kpi-label">Total Users</div>
            </div>
            <div className="admin-kpi">
              <div className="admin-kpi-value">{stats.active_users_7d}</div>
              <div className="admin-kpi-label">Active (7 days)</div>
            </div>
            <div className="admin-kpi">
              <div className="admin-kpi-value">{stats.cb_active_users}</div>
              <div className="admin-kpi-label">Credit Builder Users</div>
            </div>
            <div className="admin-kpi">
              <div className="admin-kpi-value">{stats.vendors_reporting}</div>
              <div className="admin-kpi-label">Vendors Reporting</div>
            </div>
          </div>

          <h3 className="admin-section-title">Recent Activity</h3>
          <div className="admin-activity-list">
            {activity.slice(0, 10).map(a => (
              <div key={a.id} className="admin-activity-row">
                <span className="admin-activity-user">{a.name || a.email}</span>
                <span className="admin-activity-event">{EVENT_LABELS[a.event_type] || a.event_type}</span>
                {a.metadata?.sub_item && (
                  <span className="admin-activity-detail">{a.metadata.sub_item}</span>
                )}
                <span className="admin-activity-time">{formatTime(a.created_at)}</span>
              </div>
            ))}
            {activity.length === 0 && <p style={{ color: '#9ca3af', padding: '12px 0' }}>No activity yet. Events appear here after users log in or use the Credit Builder.</p>}
          </div>

          <h3 className="admin-section-title">Link Health</h3>
          {linkHealth.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>No link checks run yet. Check the Links tab to run one.</p>
          ) : (
            <div className="admin-link-summary">
              <StatusDot ok={linkHealth.every(l => l.ok)} />
              <span>{linkHealth.filter(l => l.ok).length}/{linkHealth.length} links healthy</span>
              {linkHealth.some(l => !l.ok) && (
                <span style={{ color: '#dc3545', marginLeft: 12, fontWeight: 600 }}>
                  {linkHealth.filter(l => !l.ok).length} broken
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="admin-section">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Last Login</th>
                  <th>CB Items Done</th>
                  <th>Vendors</th>
                  <th>Events</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600 }}>{u.name || '—'}</td>
                    <td>{u.email}</td>
                    <td>{formatTime(u.created_at)}</td>
                    <td>{formatTime(u.last_login)}</td>
                    <td>{u.cb_completed}</td>
                    <td>{u.vendors_reporting}</td>
                    <td>{u.total_events}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div className="admin-section">
          <div className="admin-activity-list admin-activity-full">
            {activity.map(a => (
              <div key={a.id} className="admin-activity-row">
                <span className="admin-activity-time">{formatTime(a.created_at)}</span>
                <span className="admin-activity-user">{a.name || a.email}</span>
                <span className="admin-activity-event">{EVENT_LABELS[a.event_type] || a.event_type}</span>
                {a.metadata && Object.keys(a.metadata).length > 0 && (
                  <span className="admin-activity-detail">
                    {Object.entries(a.metadata).map(([k, v]) => `${k}: ${v}`).join(', ')}
                  </span>
                )}
                {a.ip_address && <span className="admin-activity-ip">{a.ip_address}</span>}
              </div>
            ))}
            {activity.length === 0 && <p style={{ color: '#9ca3af', padding: '12px 0' }}>No activity recorded yet.</p>}
          </div>
        </div>
      )}

      {tab === 'links' && (
        <div className="admin-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <button
              className="cb-btn cb-btn-primary"
              onClick={runLinkCheck}
              disabled={checkingLinks}
            >
              {checkingLinks ? 'Checking...' : 'Run Link Health Check'}
            </button>
            {linkHealth.length > 0 && linkHealth[0].checked_at && (
              <span style={{ color: '#9ca3af', fontSize: 13 }}>
                Last checked: {formatTime(linkHealth[0].checked_at)}
              </span>
            )}
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Resource</th>
                  <th>Sub-item</th>
                  <th>URL</th>
                  <th>HTTP</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {linkHealth.map((l, i) => (
                  <tr key={i} style={{ background: l.ok ? 'transparent' : '#fef2f2' }}>
                    <td><StatusDot ok={l.ok} /> {l.ok ? 'OK' : 'Broken'}</td>
                    <td style={{ fontWeight: 600 }}>{l.resource_name}</td>
                    <td>{l.sub_item}</td>
                    <td>
                      <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: '#196499', fontSize: 12, wordBreak: 'break-all' }}>
                        {l.url.replace('https://', '').substring(0, 50)}
                      </a>
                    </td>
                    <td>{l.status_code || '—'}</td>
                    <td style={{ color: '#dc3545', fontSize: 12 }}>{l.error_message || '—'}</td>
                  </tr>
                ))}
                {linkHealth.length === 0 && (
                  <tr><td colSpan={6} style={{ color: '#9ca3af', textAlign: 'center', padding: 24 }}>Click "Run Link Health Check" to check all resource URLs.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
