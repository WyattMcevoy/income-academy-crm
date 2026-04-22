const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const AUTH_STORAGE_KEY = 'ia_crm_auth';

// Paths where a 401 is expected (login / register) — don't auto-redirect.
const AUTH_ENDPOINTS = new Set(['/api/auth/login', '/api/auth/register']);

export async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // Expired / invalid JWT → kick user back to login rather than showing
  // a blank "Invalid token" page. Skip for login/register which 401 on bad creds.
  if (res.status === 401 && !AUTH_ENDPOINTS.has(path)) {
    try { localStorage.removeItem(AUTH_STORAGE_KEY); } catch {}
    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('Session expired — please log in again');
  }

  if (!res.ok) {
    const msg = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(msg.error || 'Request failed');
  }
  if (res.status === 204) return null;
  return res.json();
}
