import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

const STAGES = ['New Lead', 'Contacted', 'Call Booked', 'Closed', 'Lost'];

export default function Pipeline() {
  const { auth } = useAuth();
  const [leads, setLeads] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', source: '', follow_up_date: '' });
  const [err, setErr] = useState('');

  const load = async () => {
    try { setLeads(await api('/api/leads', { token: auth.token })); }
    catch (e) { setErr(e.message); }
  };
  useEffect(() => { load(); }, []);

  const createLead = async (e) => {
    e.preventDefault();
    try {
      await api('/api/leads', { method: 'POST', token: auth.token, body: { ...form, follow_up_date: form.follow_up_date || null } });
      setForm({ name: '', email: '', phone: '', source: '', follow_up_date: '' });
      setShowNew(false);
      load();
    } catch (e) { setErr(e.message); }
  };

  const moveStage = async (lead, stage) => {
    await api(`/api/leads/${lead.id}`, { method: 'PATCH', token: auth.token, body: { stage } });
    load();
  };

  return (
    <div>
      <div className="toolbar">
        <h1>Pipeline</h1>
        <button onClick={() => setShowNew(!showNew)}>{showNew ? 'Cancel' : '+ New lead'}</button>
      </div>
      {err && <p className="error">{err}</p>}
      {showNew && (
        <form className="inline-form" onSubmit={createLead}>
          <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Source (e.g. Instagram, Referral)" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
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
                  <Link to={`/leads/${lead.id}`} className="card-title">{lead.name}</Link>
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
