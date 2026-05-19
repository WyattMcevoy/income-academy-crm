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
        {['overview', 'users', 'activity', 'links', 'evidence'].map(t => (
          <button
            key={t}
            className={`admin-tab ${tab === t ? 'admin-tab-active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'overview' ? 'Overview' : t === 'users' ? 'Users' : t === 'activity' ? 'Activity Log' : t === 'links' ? 'Link Health' : 'Evidence'}
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

      {tab === 'evidence' && <EvidenceTab />}
    </div>
  );
}

// ============================================================================
// Evidence tab — chargeback defense report
// ============================================================================

function EvidenceTab() {
  const { auth } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  const lookup = async (e) => {
    e?.preventDefault();
    setErr('');
    setData(null);
    if (!identifier.trim()) return;
    setBusy(true);
    try {
      const result = await api(`/api/admin/evidence/${encodeURIComponent(identifier.trim())}`, { token: auth.token });
      setData(result);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const printReport = () => window.print();

  const fmt = (ts) => ts ? new Date(ts).toLocaleString() : '—';

  // Two plain-text outputs to handle different portal constraints:
  //   buildSummaryText(): ≤ 1500 chars — safe for any portal text field
  //   buildFullText():    ≤ 10000 chars — full activity log, paste where supported
  const fmtCompact = (ts) => ts ? new Date(ts).toISOString().replace('T', ' ').substring(0, 16) + 'Z' : '—';

  const buildSummaryText = (data) => {
    const s = data.summary;
    const lines = [];
    lines.push('PROOF OF DELIVERY — KICK START COMPANIES LLC');
    lines.push(`Customer: ${s.user?.email || s.lead?.email || '—'} (ID ${s.user?.id || '—'})`);
    if (s.lead?.stripe_session_id) lines.push(`Payment ref: ${s.lead.stripe_session_id}`);
    lines.push('');
    lines.push('DELIVERY:');
    lines.push(`  Account registered:      ${fmtCompact(s.registration_at)}`);
    lines.push(`  First login:             ${fmtCompact(s.first_login_at)}`);
    lines.push(`  First product access:    ${fmtCompact(s.first_credit_builder_access_at)}`);
    lines.push('');
    lines.push('USE:');
    lines.push(`  Total logins:            ${s.total_logins}`);
    lines.push(`  Total product actions:   ${s.total_credit_builder_actions}`);
    lines.push(`  Sub-items completed:     ${s.completed_sub_items}`);
    lines.push(`  Vendors applied:         ${s.vendors_applied}`);
    lines.push(`  Vendors reporting:       ${s.vendors_reporting}`);
    lines.push(`  Funding logged:          $${Number(s.funding_total).toLocaleString()} across ${s.funding_events_count} events`);
    lines.push(`  Latest score:      ${s.latest_score} / 890`);
    lines.push('');
    lines.push('The customer was granted access, accessed the product, and used it');
    lines.push('per the activity log above. Server-side timestamps and IPs are');
    lines.push('not user-modifiable. Signed service agreement is on file separately.');
    return lines.join('\n');
  };

  const buildFullText = (data) => {
    const s = data.summary;
    const lines = [];
    lines.push('=== PROOF OF DELIVERY — KICK START COMPANIES LLC ===');
    lines.push(`Generated: ${fmtCompact(new Date().toISOString())}`);
    lines.push('');
    lines.push('--- CUSTOMER ---');
    lines.push(`Name:               ${s.user?.name || s.lead?.name || '—'}`);
    lines.push(`Email:              ${s.user?.email || s.lead?.email || '—'}`);
    lines.push(`Internal user ID:   ${s.user?.id || '—'}`);
    if (s.lead?.stripe_session_id) lines.push(`Payment session ID: ${s.lead.stripe_session_id}`);
    if (s.lead?.stripe_customer_id) lines.push(`Payment customer:   ${s.lead.stripe_customer_id}`);
    if (s.lead?.source) lines.push(`Lead source:        ${s.lead.source}`);
    lines.push('');
    lines.push('--- DELIVERY ---');
    lines.push(`Registered:         ${fmtCompact(s.registration_at)}`);
    lines.push(`First login:        ${fmtCompact(s.first_login_at)}`);
    lines.push(`First access:       ${fmtCompact(s.first_credit_builder_access_at)}`);
    lines.push(`Total logins:       ${s.total_logins}`);
    lines.push(`Total actions:      ${s.total_credit_builder_actions}`);
    lines.push(`Items completed:    ${s.completed_sub_items}`);
    lines.push(`Vendors applied:    ${s.vendors_applied}`);
    lines.push(`Vendors reporting:  ${s.vendors_reporting}`);
    lines.push(`Funding total:      $${Number(s.funding_total).toLocaleString()}`);
    lines.push(`Latest score:       ${s.latest_score} / 890`);
    lines.push('');
    lines.push('--- ACTIVITY LOG (server-recorded, immutable) ---');
    let totalLen = lines.join('\n').length;
    let truncated = 0;
    for (const a of data.activity) {
      const meta = a.metadata && Object.keys(a.metadata).length
        ? ` [${Object.entries(a.metadata).map(([k, v]) => `${k}=${typeof v === 'string' ? v : JSON.stringify(v)}`).join(', ')}]`
        : '';
      const line = `${fmtCompact(a.created_at)} | ${(a.event_type || '').padEnd(18)} | IP ${a.ip_address || '—'}${meta}`;
      if (totalLen + line.length > 9500) { truncated++; continue; }
      lines.push(line);
      totalLen += line.length + 1;
    }
    if (truncated > 0) lines.push(`... (${truncated} earlier events truncated for length)`);
    lines.push('');
    if (s.reporting_vendor_names?.length) {
      lines.push('--- VENDORS REPORTING ---');
      s.reporting_vendor_names.forEach(n => lines.push(`  • ${n}`));
      lines.push('');
    }
    if (data.credit_builder.funding.length) {
      lines.push('--- FUNDING APPROVALS ---');
      data.credit_builder.funding.forEach(f => {
        lines.push(`  ${fmtCompact(f.created_at)} | ${f.label}${f.source ? ' (' + f.source + ')' : ''} | $${Number(f.amount).toLocaleString()}`);
      });
      lines.push('');
    }
    lines.push('Server-side timestamps and IPs are not user-modifiable.');
    lines.push('Signed service agreement on file separately.');
    return lines.join('\n');
  };

  const copyText = async (kind) => {
    if (!data) return;
    const text = kind === 'summary' ? buildSummaryText(data) : buildFullText(data);
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus(`Copied ${text.length} chars. Paste into the portal's response field.`);
      setTimeout(() => setCopyStatus(''), 4500);
    } catch {
      setCopyStatus('Copy failed — your browser blocked clipboard access.');
    }
  };

  // Suggested filename for portal upload — matches the LCD spec from research:
  // ≤45 chars, alphanumeric + underscore + hyphen, no spaces/specials.
  const suggestedFilename = data
    ? `KSC_CB_${(data.summary.user?.id || data.summary.lead?.id || 'x')}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.pdf`
    : null;

  // Set the document title before printing so Save-as-PDF defaults to the
  // portal-safe filename. Restore on cleanup.
  useEffect(() => {
    if (!data) return;
    const original = document.title;
    document.title = suggestedFilename?.replace(/\.pdf$/, '') || original;
    return () => { document.title = original; };
  }, [data, suggestedFilename]);

  const downloadJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `evidence-${data.summary.user?.email || data.summary.user?.id || 'export'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-evidence">
      <div className="evidence-search no-print">
        <p style={{ color: '#6b7280', fontSize: 14, marginTop: 0, lineHeight: 1.55 }}>
          Look up by <strong>email</strong>, <strong>user ID</strong>, or any <strong>payment processor reference</strong>.
          Produces a processor-agnostic proof-of-delivery record. Use <strong>Save as PDF</strong> for portal uploads,
          <strong> Copy as Plain Text</strong> for portal text fields, or <strong>Export JSON</strong> for your records.
        </p>
        <form onSubmit={lookup} style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="customer@example.com or 42"
            style={{ flex: 1, minWidth: 280, padding: '10px 14px', fontSize: 15, border: '1px solid #d1d5db', borderRadius: 6 }}
            autoFocus
          />
          <button type="submit" disabled={busy || !identifier.trim()} style={{ padding: '10px 22px', fontSize: 14 }}>
            {busy ? 'Looking up…' : 'Look up'}
          </button>
          {data && (
            <>
              <button type="button" onClick={printReport} style={{ padding: '10px 22px', fontSize: 14 }} title={`Suggested filename: ${suggestedFilename}`}>
                Save as PDF
              </button>
              <button type="button" onClick={() => copyText('summary')} style={{ padding: '10px 22px', fontSize: 14 }} title="≤1500 chars. Safe for any portal text field.">
                Copy Summary
              </button>
              <button type="button" onClick={() => copyText('full')} style={{ padding: '10px 22px', fontSize: 14 }} title="Up to ~10K chars with full activity log.">
                Copy Full Log
              </button>
              <button type="button" onClick={downloadJson} style={{ padding: '10px 22px', fontSize: 14 }}>
                Export JSON
              </button>
            </>
          )}
        </form>
        {data && suggestedFilename && (
          <p style={{ color: '#6b7280', fontSize: 12, marginTop: 10, fontFamily: 'monospace' }}>
            Suggested filename: <code>{suggestedFilename}</code>
          </p>
        )}
        {err && <p style={{ color: '#dc3545', fontSize: 13, marginTop: 12 }}>— {err}</p>}
        {copyStatus && <p style={{ color: '#059669', fontSize: 13, marginTop: 12 }}>{copyStatus}</p>}
      </div>

      {data && (
        <article className="evidence-doc">
          <header className="evidence-header">
            <div>
              <div className="evidence-brand">Income Academy / Kick Start Companies LLC</div>
              <div className="evidence-meta">Proof of Delivery & Use · Generated {fmt(new Date().toISOString())}</div>
            </div>
            <div className="evidence-ref">
              <span className="evidence-ref-label">Customer</span>
              <span className="evidence-ref-val">{data.summary.user?.email || data.summary.lead?.email || 'unknown'}</span>
            </div>
          </header>

          <section>
            <h3 className="evidence-h2">Summary</h3>
            <div className="evidence-summary-grid">
              <div><dt>Customer name</dt><dd>{data.summary.user?.name || data.summary.lead?.name || '—'}</dd></div>
              <div><dt>Customer email</dt><dd>{data.summary.user?.email || data.summary.lead?.email || '—'}</dd></div>
              <div><dt>User ID</dt><dd>{data.summary.user?.id || '—'}</dd></div>
              <div><dt>Lead source</dt><dd>{data.summary.lead?.source || '—'}</dd></div>
              <div><dt>Payment session ID</dt><dd style={{ fontFamily: 'monospace', fontSize: 12 }}>{data.summary.lead?.stripe_session_id || '—'}</dd></div>
              <div><dt>Payment customer ID</dt><dd style={{ fontFamily: 'monospace', fontSize: 12 }}>{data.summary.lead?.stripe_customer_id || '—'}</dd></div>
              <div><dt>Account registered</dt><dd>{fmt(data.summary.registration_at)}</dd></div>
              <div><dt>First login</dt><dd>{fmt(data.summary.first_login_at)}</dd></div>
              <div><dt>First Credit Builder access</dt><dd>{fmt(data.summary.first_credit_builder_access_at)}</dd></div>
              <div><dt>Total logins</dt><dd>{data.summary.total_logins}</dd></div>
              <div><dt>Credit Builder actions</dt><dd>{data.summary.total_credit_builder_actions}</dd></div>
              <div><dt>Sub-items completed</dt><dd>{data.summary.completed_sub_items}</dd></div>
              <div><dt>Vendors applied</dt><dd>{data.summary.vendors_applied}</dd></div>
              <div><dt>Vendors reporting</dt><dd>{data.summary.vendors_reporting}</dd></div>
              <div><dt>Funding events logged</dt><dd>{data.summary.funding_events_count}</dd></div>
              <div><dt>Total approved funding</dt><dd>${Number(data.summary.funding_total).toLocaleString()}</dd></div>
              <div><dt>Latest Credit Readiness Score</dt><dd>{data.summary.latest_score} / 890</dd></div>
            </div>
          </section>

          <section>
            <h3 className="evidence-h2">Activity Log (chronological)</h3>
            <table className="evidence-table">
              <thead>
                <tr><th>Timestamp</th><th>Event</th><th>Detail</th><th>IP</th></tr>
              </thead>
              <tbody>
                {data.activity.map((a, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{fmt(a.created_at)}</td>
                    <td>{a.event_type}</td>
                    <td style={{ fontSize: 12, color: '#374151' }}>
                      {a.metadata && Object.entries(a.metadata).map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`).join(' · ')}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>{a.ip_address || '—'}</td>
                  </tr>
                ))}
                {data.activity.length === 0 && (
                  <tr><td colSpan={4} style={{ color: '#9ca3af', textAlign: 'center', padding: 16 }}>No activity logged.</td></tr>
                )}
              </tbody>
            </table>
          </section>

          {data.summary.reporting_vendor_names?.length > 0 && (
            <section>
              <h3 className="evidence-h2">Reporting Vendor Accounts (proof of value delivered)</h3>
              <ul style={{ columns: 2, fontSize: 13, color: '#374151' }}>
                {data.summary.reporting_vendor_names.map(n => <li key={n}>{n}</li>)}
              </ul>
            </section>
          )}

          {data.credit_builder.funding.length > 0 && (
            <section>
              <h3 className="evidence-h2">Funding Approvals Logged</h3>
              <table className="evidence-table">
                <thead><tr><th>Date</th><th>Label</th><th>Source</th><th>Amount</th></tr></thead>
                <tbody>
                  {data.credit_builder.funding.map((f, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{fmt(f.created_at)}</td>
                      <td>{f.label}</td>
                      <td style={{ fontSize: 12, color: '#6b7280' }}>{f.source || '—'}</td>
                      <td style={{ fontFamily: 'monospace' }}>${Number(f.amount).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {data.lead_notes.length > 0 && (
            <section>
              <h3 className="evidence-h2">Lead Notes (purchase / agreement references)</h3>
              {data.lead_notes.map((n, i) => (
                <div key={i} style={{ padding: '10px 14px', background: '#f9fafb', borderRadius: 6, marginBottom: 6, fontSize: 12 }}>
                  <div style={{ color: '#6b7280', fontFamily: 'monospace', fontSize: 11, marginBottom: 4 }}>{fmt(n.created_at)}</div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{n.body}</div>
                </div>
              ))}
            </section>
          )}

          <footer className="evidence-footer">
            <p>
              This report is generated from server-side activity logs stored in the Income Academy /
              Kick Start CRM database. Each row represents an authenticated, server-recorded event
              with timestamp and IP address. The data is not modifiable by the end user.
            </p>
          </footer>
        </article>
      )}
    </div>
  );
}
