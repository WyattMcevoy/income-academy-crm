# Kick Start ⇄ Income Academy Credit Builder SSO

This document is for the Kick Start CRM team. It explains how to wire a
"Credit Builder" link into the client portal sidebar so customers go from
`dashboard.kickstartcompanies.com` into their fully-authenticated Credit
Builder without typing a password.

## How it works (one paragraph)

1. Customer clicks **Credit Builder** in the Kick Start sidebar.
2. Your PHP mints a short-lived (15 min) HS256 JWT containing their email,
   internal Kick Start customer ID, and display name.
3. The link redirects them to
   `https://dashboard.incomeacademy.biz/credit-builder/sso?token=<JWT>`.
4. Our server verifies the signature with the shared secret, finds or
   creates a user record tagged `tenant_id = 'kickstart'`, issues a session,
   strips the token from the URL, and lands the customer in the Credit
   Builder with Kick Start branding.

The JWT is one-time-use *in practice* (a 15-minute window) and cannot be
modified by the customer because it's signed with a secret only our two
servers hold.

## Set up the shared secret (one-time)

1. Generate a 64-character secret:
   ```bash
   openssl rand -hex 32
   ```
2. Send the secret to the Income Academy operator (encrypted channel — 1Password share, signal, etc.). They will store it in our backend env as `KICKSTART_SSO_SECRET`.
3. Store the same string in your Kick Start backend env as
   `INCOME_ACADEMY_SSO_SECRET`.

**Do not put this secret in client-side code, email, or git.**

## PHP snippet — generate the link

Drop this into a helper file (e.g. `app/Helpers/CreditBuilderLink.php`). Adjust namespaces for your codebase. Requires the `firebase/php-jwt` package, which is the standard PHP JWT library (`composer require firebase/php-jwt`).

```php
use Firebase\JWT\JWT;

function creditBuilderSsoUrl(array $customer): string
{
    $secret = getenv('INCOME_ACADEMY_SSO_SECRET');
    if (! $secret) {
        throw new RuntimeException('INCOME_ACADEMY_SSO_SECRET is not set');
    }

    $now = time();
    $payload = [
        'iss'   => 'kickstart-crm',                       // must match what we registered
        'aud'   => 'income-academy-credit-builder',       // fixed string
        'sub'   => (string) $customer['id'],              // your customer's internal ID
        'email' => strtolower(trim($customer['email'])),
        'name'  => trim(($customer['first_name'] ?? '') . ' ' . ($customer['last_name'] ?? '')),
        'iat'   => $now,
        'exp'   => $now + 600,                            // 10 minutes
    ];

    $token = JWT::encode($payload, $secret, 'HS256');

    return 'https://dashboard.incomeacademy.biz/credit-builder/sso?token=' . urlencode($token);
}
```

## HTML snippet — sidebar link

In your client portal sidebar template (e.g. `resources/views/portal/partials/sidebar.blade.php`), wherever Dashboard / Documents / Billing live, add:

```html
<a
  href="{{ creditBuilderSsoUrl($currentCustomer) }}"
  target="_blank"
  rel="noopener noreferrer"
  class="sidebar-link"
>
  Credit Builder
</a>
```

`target="_blank"` opens the Credit Builder in a new tab so the customer can flip back to their Kick Start documents without losing context. Drop the attribute if you'd rather replace the tab.

**Important:** mint a fresh token on every page render. Tokens expire in 10
minutes — don't cache the URL across pages.

## JWT payload — full reference

| Claim | Type | Required | Notes |
|---|---|---|---|
| `iss` | string | yes | Must be `"kickstart-crm"` |
| `aud` | string | yes | Must be `"income-academy-credit-builder"` |
| `sub` | string | yes | Your internal customer ID (so we can match the same person across email changes) |
| `email` | string | yes | Lowercased customer email |
| `name` | string | no | Display name (used for the welcome surface) |
| `iat` | number | yes | Unix seconds — must be within the last 5 minutes |
| `exp` | number | yes | Unix seconds — must be ≤ 15 minutes after `iat` |

Algorithm must be **HS256**. Anything else is rejected.

## What we do on our side when the token arrives

- Verify the signature with the shared secret
- Verify `iss`, `aud`, `iat`, `exp` are all correct and within tolerance
- Look up an existing user by `(tenant_id='kickstart', external_id=sub)`. If
  none, fall back to email.
- If still none, create a new user with the email, name, `tenant_id='kickstart'`, `external_id=sub`, and a password hash that cannot be used for normal login.
- Log an `sso_login` or `sso_register` activity event (captures IP and
  user-agent for our chargeback evidence system).
- Issue our standard session JWT and redirect to `/credit-builder`.

The Credit Builder then renders with the Kick Start theme class (currently
shares the existing palette; can be re-themed by changing a single CSS rule).

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| "Unknown issuer" | `iss` claim doesn't match `"kickstart-crm"` |
| "Invalid or expired token" | Signature mismatch (secret out of sync) **or** clock drift between servers > 60 seconds |
| "Token outside acceptable issue window" | `iat` is more than 5 minutes old or in the future |
| "Token exp window too long" | `exp - iat > 900` seconds (15 minutes). Use 10 minutes to be safe. |
| Customer lands on the error screen | Check Income Academy server logs for the specific verify failure |

## Testing

While developing, you can mint a token in PHP and curl our endpoint
directly to test the round-trip without involving the browser:

```bash
curl -X POST https://dashboard.incomeacademy.biz/api/auth/sso \
  -H 'Content-Type: application/json' \
  -d '{"token":"<paste-jwt-here>"}'
```

A successful response looks like:

```json
{
  "token": "<our-session-jwt>",
  "user": {
    "id": 42,
    "email": "customer@example.com",
    "name": "Jennifer L Tucek",
    "is_admin": false,
    "tenant_id": "kickstart"
  }
}
```

## Future: full embed (later, if you want it)

The current integration opens the Credit Builder in a new tab. If you'd
rather embed it inline in the Kick Start portal, we can:
1. Disable `X-Frame-Options` on `/credit-builder/*` for the Kick Start origin
2. Add a `postMessage` handshake so the iframe knows its parent URL
3. Hide our top-level chrome when embedded (use the `?embed=1` query param)

Ping us when you want that — it's an afternoon of work.
