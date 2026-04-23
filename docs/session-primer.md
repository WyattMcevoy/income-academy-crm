# Income Academy — Session Primer

**Purpose**: paste at the start of a fresh Claude Code session so the new chat has full context on this project without needing to re-read prior conversation history.

**Last updated**: April 22, 2026

---

## What this project is

**Income Academy** — a US-based online business education company owned by Wyatt Mcevoy. Target audience: US adults 45-75, semi-retired or near-retirement, non-technical, want extra income from home. Skeptical of hype.

**Product stack** (current + planned):
- Front-end tripwire: $47 starter workshop (A/B testing continuity model soon)
- Continuity (planned): $19/month membership, 7-day free trial baked in
- High-ticket back-end: $2-5k done-with-you programs sold by phone team
- Primary existing product: "Ebay Program" (warehouse-backed reselling, phone-sales close)
- Next products (built but not yet launched): AI Side Income Starter + Honest Affiliate Marketing Starter
- Potential future: partner's trading software (separate brand/funnel)

---

## Operating protocol — IMPORTANT

User operates under **LVL V1 Engineering Protocol (lightweight variant)**. Saved to `~/.claude/projects/-Users-wyattsmac-Documents-Income-Academy-CRM/memory/feedback_lvl_engineering_protocol.md`.

**10 global constraints always on**:
1. LOCAL-ONLY EXECUTION — I never touch prod (no live DB writes, no deploys I trigger, no hosted-service operations)
2. No silent schema drift — schema changes require explicit K-loop proposal + approval
3. Surgical changes (MMIS)
4. No new dependencies without approval
5. Proposal before diffs for risky changes
6. Single-scope tasks
7. Deterministic verification steps required
8. Rollback path for every change
9. Logging discipline
10. **NO SECRET EXPOSURE** — never output, request, or store credentials. If user pastes a secret, treat as burned and rotate.

**Kernel protocol (K0-K8 loop)** applies only to risky changes (schema, auth, deps, prod config, money, money-in-money-out flows). Routine UI/config work uses lightweight "brief plan → edit → verify."

**Other pinned rules**:
- Never touch anything named "notebridge" (user flagged as hands-off)
- GitHub username: **WyattMcevoy**
- Working directory: `/Users/wyattsmac/Documents/Income Academy CRM`
- `gh` CLI installed at `~/.local/bin/gh`

---

## Tech stack

**Repo**: https://github.com/WyattMcevoy/income-academy-crm (private)

**Deployed**:
| Component | URL | Provider |
|---|---|---|
| Marketing site | https://incomeacademy.biz | Vercel (via `marketing/` folder) |
| CRM app | https://dashboard.incomeacademy.biz | Vercel (via `client/` folder) |
| API | https://income-academy-crm.onrender.com | Render (via `server/` folder) |
| Database | Postgres | Neon (US West) |
| Email sender (campaigns) | `incomeacademymail.com` | MailerLite |
| GHL sub-account | Income Academy | GoHighLevel (location `c3HSS74ILjGye3pvGsHg`) |
| Stripe | Personal sandbox + live later | Stripe |

**Domains at Namecheap**:
- `incomeacademy.biz` — main + `dashboard.` (CRM) + `go.` (GHL dedicated email)
- `incomeacademymail.com` — MailerLite sending (`send.` subdomain configured)

---

## What's been built (phases completed)

1. ✅ DKIM on `incomeacademymail.com`
2. ✅ Sidebar + Dashboard shell
3. ✅ Schema expansion (Lead + Client fields)
3b. ✅ Backend + frontend wired to new fields
4. ✅ Clients page + Convert-to-Client button
5. ✅ Marketing site + legal pages (incomeacademy.biz)
6. ✅ Stripe Checkout + webhook (Sandbox mode, ~5 test payments verified)
7. ✅ MailerLite welcome automation (group "Starter Program Buyers")
8. ✅ GHL member portal + auto-provisioning via workflow
8d. ✅ GHL dedicated sending domain (go.incomeacademy.biz)
9. ✅ Public `/api/intake` endpoint for Meta/Zapier/external leads (token auth)
10. ✅ 43k leads imported from Google Sheet
10b. ✅ Paginated Leads page + List/Board view toggle
13A. ✅ Claude Code slash commands: `/lead-source` and `/cold-lead`

**Course asset libraries fully built** (in `docs/courses/`):
- AI Side Income Starter Kit — 8-module curriculum, 100+ prompts, 9 templates, landing copy, 5 ad variants, sales team script, Claude Project config
- Honest Affiliate Marketing Starter — same depth
- `docs/research/product-expansion-strategy-2026-04-22.md` — research agent output (estate sale sourcing = top recommendation)

---

## What's queued (next phases)

- **Phase 11**: A/B split ($47 one-time vs $47+$19/mo continuity) — landing page logic + 2nd Stripe Payment Link. PAUSED pending offer definition.
- **Phase 6b**: PayPal backup processor (PayPal Business account already created).
- **Phase 12** (proposed): Subdomain landing pages (`ai.incomeacademy.biz`, `affiliate.incomeacademy.biz`) for per-product sales.
- **Phase 15+** (far): Plaid integration for bank transaction import + AI expense categorizer ("mini QuickBooks").

---

## Pending actions on user's side

- [ ] File Utah LLC ("Income Academy LLC"). Update sender info + legal pages once filed.
- [ ] Get EIN from IRS.gov after LLC filing.
- [ ] Open business bank account (Mercury/Relay recommended).
- [ ] Set up virtual mailbox (iPostal1 recommended, Utah address).
- [ ] Toggle MailerLite domain alignment for `send.incomeacademymail.com` (do it in MailerLite UI)
- [ ] Switch Stripe from Sandbox to Live when ready to accept real payments
- [ ] SignWell account signup (Phase 5 contract flow — not wired yet)
- [ ] Complete GHL course content upload (currently has placeholder course — real videos needed)
- [ ] Legal review by attorney before running ads (FTC Biz Opp Rule applies if warehouse+earnings claims)

---

## Credentials & IDs (non-secret references)

**In Neon `users` table**:
- User `id=3`, email `whbm08@yahoo.com` — Wyatt's active CRM account
- User `id=1` was deleted (abandoned account with forgotten password)

**GHL**:
- Location ID: `c3HSS74ILjGye3pvGsHg`
- Product ID: `c02c3923-c9f1-404f-a76f-e48f97b91206`

**Render env vars set** (secrets NOT shown):
- `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `PORT`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `MAILERLITE_API_KEY`, `MAILERLITE_BUYER_GROUP_ID` (185313701944886793)
- `GHL_API_KEY`, `GHL_LOCATION_ID`
- `OWNER_USER_ID=3`, `INTAKE_TOKEN`

**Local `~/intake-token.txt`** holds the INTAKE_TOKEN for testing. Read via `$(cat ~/intake-token.txt)`.

---

## Recent decisions locked

- **Signing provider**: SignWell (not DocuSign) — cheapest with equivalent legal coverage
- **Refund policy**: 7-day money-back guarantee (not "no refunds")
- **Continuity structure**: $19/mo starts after 7-day free trial (aligned with refund window)
- **Entity**: Utah LLC, single-member
- **Brand**: Keep "Income Academy" umbrella; product names like "Click & Earn Workshop" or "AI Side Income Starter"
- **Stripe**: Personal now, migrate to LLC after formation (same account via entity change)
- **Payment processors**: Stripe primary + PayPal backup. Plan to add high-risk-friendly processor later (user has done this before).
- **Research recommendation**: Estate Sale Sourcing Academy is #1 product expansion pick. AI Side Income and Affiliate Marketing courses are fully content-ready.
- **Continuity content plan**: all course workshops auto-unlock into $19/mo membership. Monthly content cadence: hot-category report, live Q&A, member spotlight, tool/tactic drop.

---

## Known issues / watchouts

- Context window of prior session was at 92% when this primer was written — that's why we're starting fresh.
- GHL workflow dedup: same name + phone = merged contact. For real buyers with unique info this isn't a problem; only showed up in testing.
- GHL's default course welcome email has been disabled — we use the custom workflow email via dedicated domain.
- Render free tier: API spins down after 15min idle. First request post-sleep takes ~50 seconds.
- MailerLite automation doesn't re-fire for existing group members.

---

## If I'm the new Claude

Please:
1. Confirm you've read this primer before making suggestions
2. Keep LVL V1 lightweight protocol in mind — propose before diffs for risky changes
3. Never output or request secrets. If you need a value the user has, direct them to set it locally (e.g., in `~/.env` or Render env vars).
4. Check the repo for existing patterns before suggesting new ones. Most architectural decisions are already made.
5. If the user says "let's keep going," ask what they're prioritizing: revenue path (launch a course), tech path (Phase 11 continuity, PayPal, subdomains), or content path (edit/refine existing courses).

---

## Starter prompts for the new session

After pasting this primer, good opening asks:

- "Read the primer. What state are we in, and what would you recommend tackling next?"
- "I want to launch [X]. Walk me through the steps given everything that's already built."
- "I'd like to review the [Y] course content before launch. Where should I start?"
- "Help me set up the subdomains (ai. and affiliate.) as private preview sites."
