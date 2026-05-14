import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth.jsx';
import { api } from '../../api.js';

/**
 * User-logged funding approvals. Replaces the dead "Approved Funding" KPI
 * with real data the user enters as they get approved for credit lines,
 * cards, and vendor accounts.
 */
export default function FundingEvents({ onChange }) {
  const { auth } = useAuth();
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api('/api/credit-builder/funding-events', { token: auth.token });
      setEvents(data.events || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error('funding events load failed', e);
    }
  }, [auth.token]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!label.trim() || !amount) return;
    setSaving(true);
    try {
      await api('/api/credit-builder/funding-events', {
        method: 'POST',
        token: auth.token,
        body: { label: label.trim(), amount: Number(amount), source: source.trim() || null },
      });
      setLabel(''); setAmount(''); setSource('');
      setShowForm(false);
      await load();
      onChange?.();
    } catch (e) {
      console.error('save funding event failed', e);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    try {
      await api(`/api/credit-builder/funding-events/${id}`, { method: 'DELETE', token: auth.token });
      await load();
      onChange?.();
    } catch (e) { console.error('delete funding event failed', e); }
  };

  return (
    <div className="cb-funding">
      <div className="cb-funding-header">
        <div className="cb-funding-total">
          <span className="cb-funding-total-label">Approved funding</span>
          <span className="cb-funding-total-value">${total.toLocaleString()}</span>
        </div>
        <button
          className="cb-funding-add"
          onClick={() => setShowForm(s => !s)}
          aria-label={showForm ? 'Close form' : 'Log a new approval'}
        >
          {showForm ? '×' : '+'}
        </button>
      </div>

      {showForm && (
        <form className="cb-funding-form" onSubmit={submit}>
          <input
            className="cb-funding-input"
            placeholder="e.g. Capital One Spark"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            autoFocus
            maxLength={200}
          />
          <input
            className="cb-funding-input"
            placeholder="$ amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            className="cb-funding-input"
            placeholder="source (optional)"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            maxLength={100}
          />
          <button className="cb-funding-save" type="submit" disabled={saving || !label.trim() || !amount}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      )}

      {events.length > 0 && (
        <ul className="cb-funding-list">
          {events.slice(0, 6).map(ev => (
            <li key={ev.id} className="cb-funding-item">
              <div className="cb-funding-item-main">
                <span className="cb-funding-item-label">{ev.label}</span>
                {ev.source && <span className="cb-funding-item-source">{ev.source}</span>}
              </div>
              <span className="cb-funding-item-amount">${Number(ev.amount).toLocaleString()}</span>
              <button
                className="cb-funding-item-remove"
                onClick={() => remove(ev.id)}
                title="Remove"
                aria-label={`Remove ${ev.label}`}
              >
                ×
              </button>
            </li>
          ))}
          {events.length > 6 && (
            <li className="cb-funding-more">+ {events.length - 6} more</li>
          )}
        </ul>
      )}
    </div>
  );
}
