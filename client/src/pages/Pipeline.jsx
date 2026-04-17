import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

const STAGES = ['New Lead', 'Contacted', 'Call Booked', 'Closed', 'Lost'];

const emptyForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  source: '',
  follow_up_date: '',
};

export default function Pipeline() {
  const { auth } = useAuth();
  const [leads, setLeads] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [err, setErr] = useState('');

  const load = async () => {
    try { setLeads(await api('/api/leads', { token: auth.token })); }
    catch (e) { setErr(e.message); }
  };
  useEffect(() => { load(); }, []);

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

  const moveStage = async (lead, stage) => {
    try {
      await api(`/api/leads/${lead.id}`, { method: 'PATCH', token: auth.token, body: { stage } });
      load();
    } catch (e) { setErr(e.message); }
  };

  const displayName = (lead) => {
    const parts = [lead.first_name, lead.last_name].filter(Boolean);
    return parts.length ? parts.join(' ') : lead.name;
  };

  return (
    <div>
      <div className="page-header">
        <h1>Leads</h1>
        <p className="page-subtitle">Active leads across all pipeline stages.</p>
      </div>
      <div className="toolbar">
        <span />
        <button onClick={() => setShowNew(!showNew)}>{showNew ? 'Cancel' : '+ New lead'}</button>
      </div>
      {err && <p className="error">{err}</p>}
      {showNew && (
        <form className="inline-form" onSubmit={createLead}>
          <input placeholder="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} required />
          <input placeholder="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Source (e.g. Meta Ad, Referral)" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
          <input type="date" value={form.follow_up_date} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} />
          <button type="submit">Add</button>
        </form>
      )}

      <div className="board">
        {STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage);
          return (
            <div className="column" key={stage}>
              <h3>{stage} <span className="count">{stageLeads.length}</span></h3>
              {stageLeads.map((lead) => (
                <div className="card" key={lead.id}>
                  <Link to={`/leads/${lead.id}`} className="card-title">{displayName(lead)}</Link>
                  {lead.source && <div className="meta">Source: {lead.source}</div>}
                  {lead.follow_up_date && <div className="meta">Follow up: {lead.follow_up_date.slice(0, 10)}</div>}
                  <select value={lead.stage} onChange={(e) => moveStage(lead, e.target.value)}>
                    {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
