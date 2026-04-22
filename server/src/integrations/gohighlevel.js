// GoHighLevel (GHL) REST API integration.
// Uses plain fetch (Node 18+) — no SDK dependency.
// Private Integration tokens only (pit-...), scoped to a single Location.
// Docs: https://highlevel.stoplight.io/docs/integrations

const API_BASE = 'https://services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';

/**
 * Create or update a contact in GHL and tag them.
 * The tag drives a workflow that enrolls them in the course and sends
 * the branded portal-access email (workflow is configured in GHL's UI).
 *
 * Returns the contact object on success, throws on network / API error.
 *
 * @param {object} opts
 * @param {string} opts.apiKey       GHL private integration token (pit-...).
 * @param {string} opts.locationId   GHL sub-account (Location) id.
 * @param {string} opts.email        Contact email.
 * @param {string} [opts.firstName]  First name.
 * @param {string} [opts.lastName]   Last name.
 * @param {string} [opts.phone]      Phone number.
 * @param {string[]} [opts.tags]     Tags to apply (drives GHL workflows).
 * @param {string} [opts.source]     Tracking source label.
 */
export async function upsertContact({
  apiKey,
  locationId,
  email,
  firstName,
  lastName,
  phone,
  tags,
  source,
}) {
  if (!apiKey) throw new Error('GHL API key missing');
  if (!locationId) throw new Error('GHL locationId missing');
  if (!email) throw new Error('email required');

  const body = {
    locationId,
    email,
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
    ...(phone ? { phone } : {}),
    ...(tags && tags.length ? { tags } : {}),
    ...(source ? { source } : {}),
  };

  const res = await fetch(`${API_BASE}/contacts/upsert`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: API_VERSION,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`ghl ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}
