import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

/**
 * Landing page for SSO redirects from a partner CRM.
 *
 * URL shape: /credit-builder/sso?token=<JWT>
 *
 * Flow:
 *  1. Pull the token from the query string
 *  2. POST it to /api/auth/sso
 *  3. On success, store the resulting session and replace the URL (so the
 *     token never appears in browser history / referer logs)
 *  4. Redirect to /credit-builder
 *  5. On failure, show a friendly error
 */
export default function SsoLanding() {
  const [searchParams] = useSearchParams();
  const { ssoConsume } = useAuth();
  const nav = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying | error
  const [err, setErr] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setErr('No token in URL.');
      return;
    }

    // Strip the token from the URL immediately so it can't leak via
    // referer or browser history.
    window.history.replaceState({}, '', '/credit-builder/sso');

    let cancelled = false;
    (async () => {
      try {
        await ssoConsume(token);
        if (cancelled) return;
        nav('/credit-builder', { replace: true });
      } catch (e) {
        if (cancelled) return;
        setStatus('error');
        setErr(e?.message || 'Could not complete sign-in.');
      }
    })();
    return () => { cancelled = true; };
  }, [searchParams, ssoConsume, nav]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f6f8',
      padding: 24,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    }}>
      <div style={{
        maxWidth: 420,
        background: '#fff',
        padding: '40px 32px',
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        textAlign: 'center',
      }}>
        {status === 'verifying' && (
          <>
            <div style={{ fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#6b7280', marginBottom: 10 }}>
              Signing you in
            </div>
            <h1 style={{ margin: '0 0 12px', fontSize: 22, color: '#0b3954', fontWeight: 600 }}>
              One moment…
            </h1>
            <p style={{ margin: 0, color: '#6b7280', fontSize: 14 }}>
              Verifying your Kick Start session and opening your Credit Builder.
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: 13, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#dc3545', marginBottom: 10 }}>
              Sign-in failed
            </div>
            <h1 style={{ margin: '0 0 12px', fontSize: 22, color: '#0b3954', fontWeight: 600 }}>
              We couldn't open your Credit Builder.
            </h1>
            <p style={{ margin: '0 0 20px', color: '#6b7280', fontSize: 14, lineHeight: 1.5 }}>
              {err} Try clicking the link again from your Kick Start dashboard. If this keeps happening, contact support.
            </p>
            <a
              href="https://dashboard.kickstartcompanies.com/portal"
              style={{
                display: 'inline-block',
                padding: '10px 22px',
                background: '#0fa888',
                color: '#fff',
                borderRadius: 100,
                fontWeight: 600,
                fontSize: 14,
                textDecoration: 'none',
              }}
            >
              Back to Kick Start
            </a>
          </>
        )}
      </div>
    </div>
  );
}
