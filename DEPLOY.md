# Deployment Guide

How Income Academy CRM is deployed. Matches the live production setup.

## Stack

| Layer | Provider | URL |
|---|---|---|
| Frontend | Vercel (Hobby / free) | `https://dashboard.incomeacademy.biz` (custom) + `https://income-academy-crm.vercel.app` (raw) |
| Backend API | Render (Free web service) | `https://income-academy-crm.onrender.com` |
| Database | Neon (Free Postgres) | Serverless Postgres, US West region |
| DNS | Namecheap | `incomeacademy.biz` registrar |

## Prerequisites

- GitHub repo: `WyattMcevoy/income-academy-crm`
- Accounts on: **Neon**, **Render**, **Vercel** (all free tier works)
- Access to Namecheap for DNS
- Local: Node 20+, `gh` CLI optional

---

## Step 1 — Database (Neon)

1. Sign up / log in at https://neon.tech (via GitHub works).
2. Create a new project:
   - **Name**: `income-academy-crm`
   - **Postgres version**: latest
   - **Region**: match wherever the backend will live (currently **US West**).
3. **Skip Neon Auth** — we use our own JWT auth in the backend; Neon Auth is not needed.
4. From the dashboard, go to **Connect** → **Connect your app manually** → **Connection string** → **Copy snippet**. It looks like:
   ```
   postgresql://neondb_owner:XXXXX@ep-xxx.us-west-2.aws.neon.tech/neondb?sslmode=require
   ```
5. Apply the schema from your local machine (one-time, or whenever schema changes):
   ```bash
   cd server
   cp .env.example .env
   # Edit .env, paste the connection string as DATABASE_URL.
   # JWT_SECRET is pre-filled by the copy; leave as-is for local dev.
   npm install
   npm run db:init
   ```
   Expected output: `Database initialized.`

**DO NOT** run `npx neonctl@latest init` — it installs Neon's MCP server + IDE tooling we don't need.

---

## Step 2 — Backend (Render)

1. https://render.com → sign in with GitHub → **New +** → **Web Service**.
2. Select **"Build and deploy from a Git repository"** → connect `income-academy-crm` repo.
3. Configure:

   | Setting | Value |
   |---|---|
   | **Name** | `income-academy-crm` |
   | **Region** | Match Neon region (Oregon / US West) |
   | **Branch** | `main` |
   | **Root Directory** | `server` |
   | **Language** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance Type** | Free |
   | **Health Check Path** | `/health` |
   | **Auto-Deploy** | On Commit |

4. **Environment Variables** (add each):

   | Name | Value | Source |
   |---|---|---|
   | `DATABASE_URL` | Neon connection string from Step 1 | Copy-paste from Neon |
   | `JWT_SECRET` | Cryptographically random | Click Render's **Generate** button |
   | `NODE_ENV` | `production` | — |
   | `PORT` | `4000` | — |

   **Never** reuse your local dev `JWT_SECRET` in production. Fresh value, different from local.

5. Click **Create Web Service**. First deploy takes 2–4 min. Success log ends with:
   ```
   API listening on :4000
   ==> Your service is live 🎉
   ==> Available at your primary URL https://income-academy-crm.onrender.com
   ```

6. Verify: visit `https://<render-url>/health` → should return `{"ok":true}`. First request after ~15 min idle takes 50+ seconds (free tier cold start) — that's normal.

---

## Step 3 — Frontend (Vercel)

1. https://vercel.com → sign in with GitHub → **Add New** → **Project**.
2. Import `WyattMcevoy/income-academy-crm`.
3. Configure:

   | Setting | Value |
   |---|---|
   | **Framework Preset** | Vite (auto-detected) |
   | **Root Directory** | `client` |
   | **Build / Install / Output** | defaults |

4. **Environment Variables**:

   | Name | Value |
   |---|---|
   | `VITE_API_URL` | `https://income-academy-crm.onrender.com` |

5. **Deploy**. ~30–60 sec. You'll get a `*.vercel.app` URL.

**Ignore** the "Install Coding Agent Plugin" prompt — unapproved scope.

---

## Step 4 — Custom domain (DNS via Namecheap)

### 4a. Add domain in Vercel

1. Vercel project → **Settings** → **Domains** → **Add Existing** → `dashboard.incomeacademy.biz` → **Save**.
2. Connect to environment: **Production**. Redirect: **No redirect**.
3. Vercel displays a DNS record to add (CNAME). Copy the **Value** — it's unique per project, e.g. `37a0707c76eae8fa.vercel-dns-017.com`.

### 4b. Add CNAME at Namecheap

1. https://www.namecheap.com → **Domain List** → `incomeacademy.biz` → **Manage**.
2. **Advanced DNS** tab → **Add New Record**:

   | Field | Value |
   |---|---|
   | **Type** | `CNAME Record` |
   | **Host** | `dashboard` |
   | **Value** | The Value from Vercel (e.g. `37a0707c76eae8fa.vercel-dns-017.com`) |
   | **TTL** | Automatic |

3. Click the green ✓ checkmark to save the row (critical — Namecheap doesn't save without it).

### 4c. Wait for propagation

5–60 min typical. In Vercel's Domains page, click **Refresh** next to the domain. When it flips from ⚠️ "Invalid Configuration" → ✅ "Valid Configuration", you're done.

Test: `https://dashboard.incomeacademy.biz` should serve the app with a valid HTTPS cert.

---

## Step 5 — Lock down CORS

Production CORS is hardcoded in `server/src/index.js` to `https://dashboard.incomeacademy.biz`. During initial deploy, an optional `EXTRA_ORIGIN` env var (set on Render) lets an extra origin through — used temporarily for the raw `*.vercel.app` URL.

**After the custom domain is verified working:**

1. Render → **Environment** tab → find `EXTRA_ORIGIN` → **delete** it → **Save Changes**.
2. Render auto-redeploys. CORS is now locked to `dashboard.incomeacademy.biz` only.
3. Verify: `https://dashboard.incomeacademy.biz` login still works. `https://income-academy-crm.vercel.app` loads the UI but API calls fail with CORS — that's expected.

---

## Operational notes

### Auto-deploy

Both Render (backend) and Vercel (frontend) are wired to GitHub. Every push to `main` triggers both to rebuild and redeploy automatically. Typical end-to-end time: ~3–5 min.

### Render free-tier cold starts

The backend spins down after ~15 min of inactivity. First request after that takes 50+ seconds while it wakes up. For personal use this is fine. To eliminate it, upgrade to Render's $7/mo Starter tier.

### Schema changes

Schema changes require a deliberate re-run of `npm run db:init` against your Neon `DATABASE_URL` from **your local machine** (never from Render). Current `schema.sql` uses `CREATE TABLE IF NOT EXISTS`, so re-running is idempotent — it won't drop existing data.

For destructive changes (dropping columns, renaming tables), follow proper migration practice — don't let the AI auto-apply.

### Secrets

- `DATABASE_URL`, `JWT_SECRET` live only in: local `.env` (gitignored) + Render env vars.
- **Never** paste either into chat, commit them, or share them.
- Rotate `JWT_SECRET` on Render if you ever suspect compromise — existing JWTs become invalid (users re-login).

---

## Disaster recovery quick reference

| Problem | Fix |
|---|---|
| Backend won't start on Render | Check **Logs** tab — most likely env var missing or wrong case. Env var names are case-sensitive: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `PORT`. |
| `Not Found` plain text from Render URL | Cold start — wait 60 sec and retry. |
| Custom domain shows "Invalid Configuration" | Namecheap CNAME not saved (forgot the ✓ checkmark) or still propagating. Recheck record in Namecheap, wait longer. |
| Login works locally but fails on prod with CORS error | The origin you're on isn't in `allowedOrigins` (index.js) and isn't set as `EXTRA_ORIGIN`. Either add to `EXTRA_ORIGIN` temporarily or update the hardcoded list. |
| Lost prod JWT_SECRET | Regenerate on Render (click Generate on the var) → save → everyone re-logs in. No recovery of old tokens. |
| DB accidentally wiped | Neon → **Branches** / point-in-time restore. (Hobby plan retains recent snapshots.) |

---

## What NOT to do

- **Don't** run `npx neonctl init` — unneeded, installs tooling we don't use.
- **Don't** install the Vercel "Coding Agent Plugin" — unapproved scope.
- **Don't** use `git add .` blindly when committing (could catch `.env`). Stage specific files.
- **Don't** commit `.env` files — they're in `.gitignore` but double-check before pushing.
- **Don't** run migrations from Render/Vercel build hooks. Schema work is deliberate from local.
- **Don't** share the `*.vercel.app` or `*.onrender.com` URLs publicly — use `dashboard.incomeacademy.biz`.
