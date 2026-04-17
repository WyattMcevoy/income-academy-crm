// Simple input validators / sanitizers used across routes.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isEmail(v) {
  return typeof v === 'string' && v.length <= 254 && EMAIL_RE.test(v);
}

export function cleanString(v, { max = 500, required = false } = {}) {
  if (v == null || v === '') return required ? null : null;
  if (typeof v !== 'string') return null;
  // Strip control chars; trim.
  const cleaned = v.replace(/[\u0000-\u001F\u007F]/g, '').trim();
  if (!cleaned) return required ? null : null;
  if (cleaned.length > max) return null;
  return cleaned;
}

export function isIsoDate(v) {
  // YYYY-MM-DD
  return typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v));
}

export function isInt(v, { min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = {}) {
  return Number.isInteger(v) && v >= min && v <= max;
}

export function oneOf(v, allowed) {
  return allowed.includes(v);
}

export function isStrongPassword(v) {
  return typeof v === 'string' && v.length >= 8 && v.length <= 200;
}

export function isBoolean(v) {
  return typeof v === 'boolean';
}

export const ENUMS = {
  STAGE: ['New Lead', 'Contacted', 'Call Booked', 'Closed', 'Lost'],
  PREFERRED_CONTACT: ['Email', 'Phone', 'SMS'],
  CLIENT_TYPE: ['Individual', 'Business'],
  CONTRACT_STATUS: ['Not sent', 'Sent', 'Signed', 'Declined'],
  REIMBURSEMENT: ['Pending', 'Submitted', 'Reimbursed', 'Denied'],
};

// Compute the legacy display `name` from split name fields.
// Returns null if no name components provided.
export function computeName({ first_name, middle_initial, last_name }) {
  const parts = [
    first_name,
    middle_initial ? `${middle_initial.replace(/\.$/, '')}.` : null,
    last_name,
  ].filter(Boolean);
  return parts.length ? parts.join(' ') : null;
}
