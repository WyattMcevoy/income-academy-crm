// MailerLite REST API integration.
// Uses plain fetch (built into Node 18+) — no SDK dependency.
// https://developers.mailerlite.com/docs/subscribers.html

const API_BASE = 'https://connect.mailerlite.com/api';

/**
 * Add (or update) a subscriber and place them in a group.
 * Returns the subscriber object on success, throws on network / API error.
 *
 * @param {object} opts
 * @param {string} opts.apiKey         MailerLite API key (Bearer token).
 * @param {string} opts.email          Subscriber email.
 * @param {string} [opts.firstName]    First name (stored in MailerLite "name" field).
 * @param {string} [opts.lastName]     Last name (stored in MailerLite "last_name" field).
 * @param {string} [opts.phone]        Phone number (optional).
 * @param {string} [opts.groupId]      If set, adds to this group.
 */
export async function upsertSubscriber({
  apiKey,
  email,
  firstName,
  lastName,
  phone,
  groupId,
}) {
  if (!apiKey) throw new Error('MailerLite API key missing');
  if (!email) throw new Error('email required');

  const fields = {};
  if (firstName) fields.name = firstName;
  if (lastName) fields.last_name = lastName;
  if (phone) fields.phone = phone;

  const body = {
    email,
    status: 'active',
    ...(Object.keys(fields).length ? { fields } : {}),
    ...(groupId ? { groups: [String(groupId)] } : {}),
  };

  const res = await fetch(`${API_BASE}/subscribers`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // Consume body so we don't leak connection; truncate for safe logging.
    const text = await res.text().catch(() => '');
    throw new Error(`mailerlite ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}
