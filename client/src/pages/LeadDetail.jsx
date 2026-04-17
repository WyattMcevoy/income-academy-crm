import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

const STAGES = ['New Lead', 'Contacted', 'Call Booked', 'Closed', 'Lost'];

export default function LeadDetail() {
  const { id } = useParams();
  const { auth } = useAuth();
  const nav = useNavigate();
  const [lead, setLead] = useState(null);
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');

  const load = async () => {
    try { setLead(await api(`/api/leads/${id}`, { token: auth.token })); }
    catch (e) { setErr(e.message); }
  };
  useEffect(() => { load(); }, [id]);

  const update = async (patch) => {
    await api(`/api/leads/${id}`, { method: 'PATCH', token: auth.token, body: patch });
    load();
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    await api(`/api/leads/${id}/notes`, { method: 'POST', token: auth.token, body: { body: note } });
    setNote('');
    load();
  };

  const del = async () => {
    if (!confirm('Delete this lead?')) return;
    await api(`/api/leads/${id}`, { method: 'DELETE', token: auth.token });
    nav('/leads');
  };

  if (err) return <p className="error">{err}</p>;
  if (!lead) return <p>Loading…</p>;

  return (
    <div className="lead-detail">
      <Link to="/leads">← Pipeline</Link>
      <div className="toolbar">
        <h1>{lead.name}</h1>
        <button className="danger" onClick={del}>Delete</button>
      </div>

      <div className="grid">
        <label>Stage
          <select value={lead.stage} onChange={(e) => update({ stage: e.target.value })}>
            {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label>Email<input defaultValue={lead.email || ''} onBlur={(e) => update({ email: e.target.value })} /></label>
        <label>Phone<input defaultValue={lead.phone || ''} onBlur={(e) => update({ phone: e.target.value })} /></label>
        <label>Source<input defaultValue={lead.source || ''} onBlur={(e) => update({ source: e.target.value })} /></label>
        <label>Follow-up date
          <input type="date" defaultValue={lead.follow_up_date ? lead.follow_up_date.slice(0, 10) : ''}
            onBlur={(e) => update({ follow_up_date: e.target.value || null })} />
        </label>
      </div>

      <h2>Notes</h2>
      <form className="inline-form" onSubmit={addNote}>
        <textarea placeholder="Add a note…" value={note} onChange={(e) => setNote(e.target.value)} />
        <button type="submit">Add note</button>
      </form>
      <ul className="notes">
        {lead.notes?.map((n) => (
          <li key={n.id}>
            <div className="meta">{new Date(n.created_at).toLocaleString()}</div>
            <div>{n.body}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
