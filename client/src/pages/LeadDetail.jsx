import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

const STAGES = ['New Lead', 'Contacted', 'Call Booked', 'Closed', 'Lost'];
const PREFERRED_CONTACTS = ['Email', 'Phone', 'SMS'];
const CLIENT_TYPES = ['Individual', 'Business'];

export default function LeadDetail() {
  const { id } = useParams();
  const { auth } = useAuth();
  const nav = useNavigate();
  const [lead, setLead] = useState(null);
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');
  const [converting, setConverting] = useState(false);

  const load = async () => {
    try { setLead(await api(`/api/leads/${id}`, { token: auth.token })); }
    catch (e) { setErr(e.message); }
  };
  useEffect(() => { load(); }, [id]);

  const update = async (patch) => {
    try {
      await api(`/api/leads/${id}`, { method: 'PATCH', token: auth.token, body: patch });
      load();
    } catch (e) { setErr(e.message); }
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

  const convert = async () => {
    const name = displayName;
    if (!confirm(`Convert ${name} to a client? They'll move from Leads to Clients.`)) return;
    setConverting(true);
    try {
      await api(`/api/leads/${id}/convert`, { method: 'POST', token: auth.token });
      nav('/clients');
    } catch (e) { setErr(e.message); }
    finally { setConverting(false); }
  };

  const unconvert = async () => {
    if (!confirm('Move this client back to Leads? They\'ll need to be reconverted to appear as a client again.')) return;
    setConverting(true);
    try {
      await api(`/api/leads/${id}/unconvert`, { method: 'POST', token: auth.token });
      nav('/leads');
    } catch (e) { setErr(e.message); }
    finally { setConverting(false); }
  };

  if (err && !lead) return <p className="error">{err}</p>;
  if (!lead) return <p>Loading…</p>;

  const displayName = [lead.first_name, lead.last_name].filter(Boolean).join(' ') || lead.name;
  const isBusiness = lead.client_type === 'Business';
  const isClient = lead.is_client;

  return (
    <div className="lead-detail">
      <Link to={isClient ? '/clients' : '/leads'}>
        ← {isClient ? 'Clients' : 'Pipeline'}
      </Link>
      <div className="page-header toolbar">
        <h1>
          {displayName}
          {isClient && <span className="badge badge-green header-badge">Client</span>}
        </h1>
        <div className="button-row">
          {isClient ? (
            <button onClick={unconvert} disabled={converting}>
              {converting ? 'Reverting…' : 'Revert to Lead'}
            </button>
          ) : (
            <button className="primary" onClick={convert} disabled={converting}>
              {converting ? 'Converting…' : 'Convert to Client'}
            </button>
          )}
          <button className="danger" onClick={del}>Delete</button>
        </div>
      </div>
      {err && <p className="error">{err}</p>}

      <section className="form-section">
        <h3>Contact Info</h3>
        <div className="grid">
          <label>First name
            <input defaultValue={lead.first_name || ''} key={`fn-${lead.id}`}
              onBlur={(e) => update({ first_name: e.target.value || null })} />
          </label>
          <label>Middle name
            <input defaultValue={lead.middle_initial || ''} key={`mi-${lead.id}`} maxLength={100}
              onBlur={(e) => update({ middle_initial: e.target.value || null })} />
          </label>
          <label>Last name
            <input defaultValue={lead.last_name || ''} key={`ln-${lead.id}`}
              onBlur={(e) => update({ last_name: e.target.value || null })} />
          </label>
          <label>Email
            <input type="email" defaultValue={lead.email || ''} key={`em-${lead.id}`}
              onBlur={(e) => update({ email: e.target.value || null })} />
          </label>
          <label>Primary phone (cell)
            <input type="tel" defaultValue={lead.phone || ''} key={`ph-${lead.id}`}
              onBlur={(e) => update({ phone: e.target.value || null })} />
          </label>
          <label>Home phone
            <input type="tel" defaultValue={lead.phone_home || ''} key={`phh-${lead.id}`}
              onBlur={(e) => update({ phone_home: e.target.value || null })} />
          </label>
          <label>Work phone
            <input type="tel" defaultValue={lead.phone_work || ''} key={`phw-${lead.id}`}
              onBlur={(e) => update({ phone_work: e.target.value || null })} />
          </label>
          <label>Preferred contact
            <select value={lead.preferred_contact || ''}
              onChange={(e) => update({ preferred_contact: e.target.value || null })}>
              <option value="">—</option>
              {PREFERRED_CONTACTS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>
      </section>

      <section className="form-section">
        <h3>Demographics</h3>
        <div className="grid">
          <label>Date of birth
            <input type="date" defaultValue={lead.dob ? lead.dob.slice(0, 10) : ''} key={`dob-${lead.id}`}
              onBlur={(e) => update({ dob: e.target.value || null })} />
          </label>
          <label className="checkbox-row">
            <input type="checkbox" checked={!!lead.is_us_citizen}
              onChange={(e) => update({ is_us_citizen: e.target.checked })} />
            <span>US citizen</span>
          </label>
        </div>
      </section>

      <section className="form-section">
        <h3>Pipeline</h3>
        <div className="grid">
          <label>Stage
            <select value={lead.stage} onChange={(e) => update({ stage: e.target.value })}>
              {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label>Source
            <input defaultValue={lead.source || ''} key={`src-${lead.id}`}
              onBlur={(e) => update({ source: e.target.value || null })} />
          </label>
          <label>Follow-up date
            <input type="date" defaultValue={lead.follow_up_date ? lead.follow_up_date.slice(0, 10) : ''} key={`fud-${lead.id}`}
              onBlur={(e) => update({ follow_up_date: e.target.value || null })} />
          </label>
        </div>
      </section>

      <section className="form-section">
        <h3>Client Info</h3>
        <div className="grid">
          <label>Type
            <select value={lead.client_type || 'Individual'}
              onChange={(e) => update({ client_type: e.target.value })}>
              {CLIENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          {isBusiness && (
            <>
              <label>Company name
                <input defaultValue={lead.company_name || ''} key={`cn-${lead.id}`}
                  onBlur={(e) => update({ company_name: e.target.value || null })} />
              </label>
              <label>Company website
                <input defaultValue={lead.company_website || ''} key={`cw-${lead.id}`}
                  onBlur={(e) => update({ company_website: e.target.value || null })} />
              </label>
            </>
          )}
          <label className="checkbox-row">
            <input type="checkbox" checked={lead.is_active}
              onChange={(e) => update({ is_active: e.target.checked })} />
            <span>Active</span>
          </label>
          {lead.became_client_at && (
            <div className="meta-inline">
              Became client: {new Date(lead.became_client_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </section>

      <section className="form-section">
        <h3>Notes</h3>
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
      </section>
    </div>
  );
}
