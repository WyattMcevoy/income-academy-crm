# portal.incomeacademy.biz — Custom Domain Setup

Connects `portal.incomeacademy.biz` to the GoHighLevel member portal, replacing the default `c3hss74iljgye3pvgshg.app.clientclub.net` URL.

**Time required**: ~10 minutes in two portals (GHL + Namecheap). Propagation takes 1-48 hours.

---

## Step 1 — Add custom domain in GoHighLevel (5 min)

1. Log into `app.gohighlevel.com`, switch to **Income Academy** sub-account
2. Left sidebar → **Memberships** → **Settings** (gear icon in top right of the Memberships section)
   - Or: **Settings** → **Memberships** → **Domains**
3. Click **Add Domain** (or **Custom Domain**)
4. Enter: `portal.incomeacademy.biz`
5. GHL will show you the CNAME record to create — looks like:
   ```
   CNAME  portal  →  c3hss74iljgye3pvgshg.app.clientclub.net
   ```
   *(Note the exact target — copy it, it may differ slightly from the above)*
6. Leave GHL open — you'll come back to verify

---

## Step 2 — Add CNAME in Namecheap (3 min)

1. Log into `namecheap.com` → **Domain List** → click **Manage** next to `incomeacademy.biz`
2. Click **Advanced DNS** tab
3. Click **Add New Record** → choose **CNAME Record**
4. Fill in:
   | Type | Host | Value | TTL |
   |------|------|-------|-----|
   | CNAME | `portal` | `c3hss74iljgye3pvgshg.app.clientclub.net` | Automatic |
5. Click the green checkmark to save
6. Namecheap may say "changes saved" — that's it

---

## Step 3 — Verify in GHL

1. Go back to GHL → Memberships → Settings → Domains
2. Click **Verify** next to `portal.incomeacademy.biz`
3. If it says "verified": you're done. SSL auto-provisions in ~15 min.
4. If it says "not verified yet": DNS is still propagating. Check back in 30-60 min.
   - You can also test from Terminal: `nslookup portal.incomeacademy.biz` — should return the GHL target

---

## Step 4 — Update the members dashboard link

Once the domain is live, update one line in `marketing/members/ghl-config.js`:

```js
// Change:
portalBase: 'https://c3hss74iljgye3pvgshg.app.clientclub.net/',

// To:
portalBase: 'https://portal.incomeacademy.biz/',
```

Then update the course URL prefix in the same file:
```js
courses: {
  ai:           'https://portal.incomeacademy.biz/products/d4c2b0c2-dee8-4ccf-8d5b-cd37e1eef075',
  affiliate:    'https://portal.incomeacademy.biz/products/4883bfbe-c2d7-4d08-b8b9-4fe130942e07',
  estate:       'https://portal.incomeacademy.biz/products/bdaf7829-7472-443c-af7e-6b60b131c406',
  bookkeeping:  'https://portal.incomeacademy.biz/products/f328cbc0-e1db-4c24-90d4-83469a5252a8',
},
```

Commit + push → Vercel deploys in ~60 seconds → members dashboard now links to the branded domain.

---

## Troubleshooting

**"CNAME already exists" error in Namecheap**: delete the existing `portal` record first, then re-add.

**"SSL not provisioning" in GHL**: wait 30 more minutes. GHL uses Let's Encrypt — it takes up to an hour after DNS propagates.

**Page not found after DNS propagates**: double-check the GHL custom domain matches exactly (`portal.incomeacademy.biz`, no trailing slash).

**Members see the old URL**: clear browser cache, or wait for Vercel's CDN to update (usually within 60 seconds of commit).

---

## What this unlocks

- Branded URL: `portal.incomeacademy.biz` (looks professional vs the GHL default subdomain)
- Members see `incomeacademy.biz` branding in their browser bar throughout the portal
- Links in email sequences to `portal.incomeacademy.biz/courses` stay branded
