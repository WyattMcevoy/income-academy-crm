import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

const STAGES = ['New Lead', 'Contacted', 'Call Booked', 'Closed', 'Lost'];
const PAGE_SIZES = [25, 50, 100];
const VIEW_STORAGE = 'ia_leads_view';

const emptyForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  source: '',
  follow_up_date: '',
};

const displayName = (lead) => {
  const parts = [lead.first_name, lead.last_name].filter(Boolean);
  return parts.length ? parts.join(' ') : lead.name;
};

export default function Pipeline() {
  const { auth } = useAuth();

  const [view, setView] = useState(() => {
    try { return localStorage.getItem(VIEW_STORAGE) || 'list'; }
    catch { return 'list'; }
  });
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [q, setQ] = useState('');
  const [stage, setStage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [err, setErr] = useState('');

  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) params.set('q', q);
  if (stage) params.set('stage', stage);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api(`/api/leads?${params.toString()}`, { token: auth.token });
      setLeads(res.leads || []);
      setTotal(res.total || 0);
      setPages(res.pages || 1);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }, [auth.token, page, limit, q, stage]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    try { localStorage.setItem(VIEW_STORAGE, view); } catch {}
  }, [view]);

  // Reset to page 1 when filters change.
  useEffect(() => { setPage(1); }, [q, stage, limit]);

  const createLead = async (e) => {
    e.preventDefault();
    setErr('');
    try {
      await api('/api/leads', {
        method: 'POST', token: auth.token,
        body: {
          first_name: form.first_name || null,
          last_name: form.last_name || null,
          email: form.email || null,
          phone: form.phone || null,
          source: form.source || null,
          follow_up_date: form.follow_up_date || null,
        },
      });
      setForm(emptyForm);
      setShowNew(false);
      load();
    } catch (e) { setErr(e.message); }
  };

  const moveStage = async (lead, nextStage) => {
    try {
      await api(`/api/leads/${lead.id}`, {
        method: 'PATCH', token: auth.token, body: { stage: nextStage },
      });
      load();
    } catch (e) { setErr(e.message); }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Leads</h1>
        <p className="page-subtitle">
          {total.toLocaleString()} active leads · {view === 'list' ? 'List view' : 'Board view'}
        </p>
      </div>

      {/* Top toolbar */}
      <div className="leads-toolbar">
        <input
          className="search-input"
          type="search"
          placeholder="Search by name, email, phone…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">All stages</option>
          {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="view-toggle">
          <button
            className={view === 'list' ? 'active' : ''}
            onClick={() => setView('list')}
          >List</button>
          <button
            className={view === 'board' ? 'active' : ''}
            onClick={() => setView('board')}
          >Board</button>
        </div>
        <button onClick={() => setShowNew(!showNew)}>
          {showNew ? 'Cancel' : '+ New lead'}
        </button>
      </div>

      {err && <p className="error">{err}</p>}

      {showNew && (
        <form className="inline-form" onSubmit={createLead}>
          <input placeholder="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
          <input placeholder="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          <input type="date" value={form.follow_up_date} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} />
          <button type="submit">Add</button>
        </form>
      )}

      {loading && <p style={{ color: '#6b7280', fontSize: 14 }}>Loading…</p>}

      {view === 'list' && !loading && (
        <ListView
          leads={leads}
          page={page}
          pages={pages}
          total={total}
          limit={limit}
          setPage={setPage}
          setLimit={setLimit}
        />
      )}

      {view === 'board' && !loading && (
        <BoardView leads={leads} onMoveStage={moveStage} total={total} />
      )}
    </div>
  );
}

function ListView({ leads, page, pages, total, limit, setPage, setLimit }) {
  if (total === 0) {
    return (
      <div className="empty-state">
        <p>No leads match your search.</p>
      </div>
    );
  }
  return (
    <>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Source</th>
            <th>Stage</th>
            <th>Follow-up</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((l) => (
            <tr key={l.id}>
              <td><Link to={`/leads/${l.id}`}>{displayName(l)}</Link></td>
              <td>{l.email || '—'}</td>
              <td>{l.phone || '—'}</td>
              <td>{l.source || '—'}</td>
              <td><span className="badge badge-gray">{l.stage}</span></td>
              <td>{l.follow_up_date ? String(l.follow_up_date).slice(0, 10) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <div className="pagination-info">
          Page {page} of {pages} ({total.toLocaleString()} total)
        </div>
        <div className="pagination-controls">
          <label style={{ fontSize: 13, color: '#6b7280' }}>
            Per page
            <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} style={{ marginLeft: 8 }}>
              {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <button disabled={page <= 1} onClick={() => setPage(1)}>« First</button>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>‹ Prev</button>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next ›</button>
          <button disabled={page >= pages} onClick={() => setPage(pages)}>Last »</button>
        </div>
      </div>
    </>
  );
}

function BoardView({ leads, onMoveStage, total }) {
  return (
    <>
      {total > leads.length && (
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
          Showing {leads.length} of {total.toLocaleString()} leads — use search/filter or switch to List view to see all.
        </p>
      )}
      <div className="board">
        {STAGES.map((s) => {
          const stageLeads = leads.filter((l) => l.stage === s);
          return (
            <div className="column" key={s}>
              <h3>{s} <span className="count">{stageLeads.length}</span></h3>
              {stageLeads.map((lead) => (
                <div className="card" key={lead.id}>
                  <Link to={`/leads/${lead.id}`} className="card-title">{displayName(lead)}</Link>
                  {lead.source && <div className="meta">Source: {lead.source}</div>}
                  {lead.follow_up_date && (
                    <div className="meta">Follow up: {String(lead.follow_up_date).slice(0, 10)}</div>
                  )}
                  <select value={lead.stage} onChange={(e) => onMoveStage(lead, e.target.value)}>
                    {STAGES.map((x) => <option key={x} value={x}>{x}</option>)}
                  </select>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
