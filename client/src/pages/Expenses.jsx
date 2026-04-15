import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../auth.jsx';

const STATUSES = ['Pending', 'Submitted', 'Reimbursed', 'Denied'];

const fmtMoney = (cents) => `$${(cents / 100).toFixed(2)}`;

export default function Expenses() {
  const { auth } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ description: '', amount: '', category: '', incurred_on: '', reimbursement_status: 'Pending', notes: '' });
  const [err, setErr] = useState('');

  const load = async () => {
    try { setItems(await api('/api/expenses', { token: auth.token })); }
    catch (e) { setErr(e.message); }
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    const cents = Math.round(parseFloat(form.amount) * 100);
    if (isNaN(cents)) return setErr('Invalid amount');
    try {
      await api('/api/expenses', {
        method: 'POST', token: auth.token,
        body: {
          description: form.description,
          amount_cents: cents,
          category: form.category || null,
          incurred_on: form.incurred_on,
          reimbursement_status: form.reimbursement_status,
          notes: form.notes || null,
        },
      });
      setForm({ description: '', amount: '', category: '', incurred_on: '', reimbursement_status: 'Pending', notes: '' });
      load();
    } catch (e) { setErr(e.message); }
  };

  const setStatus = async (item, status) => {
    await api(`/api/expenses/${item.id}`, { method: 'PATCH', token: auth.token, body: { reimbursement_status: status } });
    load();
  };

  const del = async (id) => {
    if (!confirm('Delete this expense?')) return;
    await api(`/api/expenses/${id}`, { method: 'DELETE', token: auth.token });
    load();
  };

  const totals = items.reduce((acc, e) => {
    acc.total += e.amount_cents;
    acc[e.reimbursement_status] = (acc[e.reimbursement_status] || 0) + e.amount_cents;
    return acc;
  }, { total: 0 });

  return (
    <div>
      <h1>Expenses</h1>
      {err && <p className="error">{err}</p>}

      <div className="totals">
        <div><strong>Total:</strong> {fmtMoney(totals.total)}</div>
        {STATUSES.map((s) => <div key={s}>{s}: {fmtMoney(totals[s] || 0)}</div>)}
      </div>

      <form className="inline-form" onSubmit={create}>
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input placeholder="Amount" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
        <input type="date" value={form.incurred_on} onChange={(e) => setForm({ ...form, incurred_on: e.target.value })} required />
        <select value={form.reimbursement_status} onChange={(e) => setForm({ ...form, reimbursement_status: e.target.value })}>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button type="submit">Add expense</button>
      </form>

      <table className="table">
        <thead>
          <tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th><th>Status</th><th></th></tr>
        </thead>
        <tbody>
          {items.map((e) => (
            <tr key={e.id}>
              <td>{e.incurred_on.slice(0, 10)}</td>
              <td>{e.description}</td>
              <td>{e.category || '—'}</td>
              <td>{fmtMoney(e.amount_cents)}</td>
              <td>
                <select value={e.reimbursement_status} onChange={(ev) => setStatus(e, ev.target.value)}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td><button className="danger" onClick={() => del(e.id)}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
