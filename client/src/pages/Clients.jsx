import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

const displayName = (c) => {
  const parts = [c.first_name, c.last_name].filter(Boolean);
  return parts.length ? parts.join(' ') : c.name;
};

const fmtDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
};

export default function Clients() {
  const { auth } = useAuth();
  const [clients, setClients] = useState([]);
  const [err, setErr] = useState('');

  useEffect(() => {
    api('/api/clients', { token: auth.token })
      .then(setClients)
      .catch((e) => setErr(e.message));
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1>Clients</h1>
        <p className="page-subtitle">
          Converted leads who are now paying or engaged clients.
        </p>
      </div>

      {err && <p className="error">{err}</p>}

      {clients.length === 0 ? (
        <div className="empty-state">
          <p>No clients yet.</p>
          <p className="empty-state-hint">
            Convert a lead to a client from their detail page.
          </p>
        </div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Became Client</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id}>
                <td>
                  <Link to={`/leads/${c.id}`}>{displayName(c)}</Link>
                </td>
                <td>{c.email || '—'}</td>
                <td>{c.phone || '—'}</td>
                <td>{fmtDate(c.became_client_at)}</td>
                <td>{c.client_type || 'Individual'}</td>
                <td>
                  <span className={c.is_active ? 'badge badge-green' : 'badge badge-gray'}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
