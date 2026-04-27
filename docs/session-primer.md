# Income Academy — Session Primer

**Purpose**: paste at the start of a fresh Claude Code session so the new chat has full context on this project without needing to re-read prior conversation history.

**Last updated**: April 27, 2026

---

## What this project is

**Income Academy** — a US-based online business education company owned by Wyatt Mcevoy. Target audience: US adults 50-75, semi-retired or near-retirement, non-technical, want extra income from home. Skeptical of hype.

**Product**: the **Foundation Pass** — $47 one-time + $19/month membership (with 7-day free trial on the membership). Grants access to 4 unlocked courses + an optional 5th locked tier.

| # | Course | Status |
|---|---|---|
| 1 | AI Side Income Starter Kit | ✅ Full content |
| 2 | Honest Affiliate Marketing Starter | ✅ Full content |
| 3 | Estate Sale & Garage Sale Sourcing Academy | ✅ Full content |
| 4 | Bookkeeping From Home for Over-55s | ✅ Full content |
| 5 | eBay Reselling — Done With You | 🔒 Graduation tier, $2-5k by phone, by application |

Bundle name: **Income Academy — Foundation Pass**
Tagline: *"Four honest ways to earn money from home — then one real business if you want to go bigger."*

---

## Operating protocol — IMPORTANT

User operates under **LVL V1 Engineering Protocol (lightweight variant)** with a **Maximum Autonomy** mandate added April 24, 2026.

Saved to `~/.claude/projects/-Users-wyattsmac-Documents-Income-Academy-CRM/memory/feedback_lvl_engineering_protocol.md` and `feedback_autonomous_prs.md`.

**10 global constraints always on**:
1. LOCAL-ONLY EXECUTION — never touch prod (no live DB writes, no deploys you trigger, no hosted-service operations)
2. No silent schema drift
3. Surgical changes (MMIS)
4. No new dependencies without approval
5. Proposal before diffs for risky changes
6. Single-scope tasks
7. Deterministic verification steps required
8. Rollback path for every change (documented in commit message + PR body)
9. Logging discipline
10. **NO SECRET EXPOSURE** — never output, request, or store credentials

**Maximum Autonomy mandate** (in effect):
- Run full plan → edit → commit → PR → merge → deploy loop without approval steps for routine work
- Initiate proactive work (don't wait to be asked) for valuable tools/scripts/content
- ALWAYS-FLAG list (propose first, don't auto-execute):
  - Schema migrations (DDL on Neon DB)
  - Stripe sandbox ↔ live mode switches
  - Live production database writes
  - Credential/secret changes
  - Force-pushes to main
  - `git reset --hard`, destructive ops on shared branches
  - New paid SaaS subscriptions >$25/mo
  - New npm dependencies in production code
  - Money-flow changes
  - Major product strategy pivots

**Other pinned rules**:
- Never touch anything named "notebridge" (off-limits)
- GitHub username: **WyattMcevoy**
- Working directory: `/Users/wyattsmac/Documents/Income Academy CRM`
- `gh` CLI installed at `~/.local/bin/gh`
- 23 PRs merged April 22-27, 2026 — site is feature-complete

---

## Tech stack

**Repo**: https://github.com/WyattMcevoy/income-academy-crm (private)

**Deployed**:
| Component | URL | Provider |
|---|---|---|
| Marketing site (Foundation Pass) | https://incomeacademy.biz | Vercel (`marketing/`) |
| AI subdomain landing | https://ai.incomeacademy.biz | Same Vercel project, password-gated |
| Affiliate subdomain landing | https://affiliate.incomeacademy.biz | Same Vercel project, password-gated |
| CRM app | https://dashboard.incomeacademy.biz | Vercel (`client/`) |
| API | https://income-academy-crm.onrender.com | Render (`server/`) |
| Database | Postgres | Neon (US West) |
| Member portal | (configured via portal.incomeacademy.biz pending GHL setup) | GoHighLevel |
| Email sender | `incomeacademymail.com` | MailerLite |
| GHL sub-account | Income Academy | location `c3HSS74ILjGye3pvGsHg` |
| Stripe | Personal sandbox (live pending LLC) | Stripe |

**Domains at Namecheap**:
- `incomeacademy.biz` — main + dashboard. + go. + ai. + affiliate. (subdomains all deployed)
- `incomeacademymail.com` — MailerLite sending

---

## What's built (April 22-27, 2026 — 23 PRs across one heavy build run)

### Site infrastructure (deployed)
- **Main site** at `incomeacademy.biz` — full Foundation Pass landing with tabbed Members Area showcase (4 courses + locked eBay), pricing block, FAQ with JSON-LD, OG meta, sitemap, robots
- **AI subdomain** with FTC anti-scam callout, prompt cards, AI Assistant chat preview
- **Affiliate subdomain** with post-HCU positioning, niche scorecard, 24-month timeline
- **/checkout** with bundle order summary (Stripe + PayPal buttons; Stripe live URL pending LLC)
- **/members** branded dashboard (4 course tiles + locked eBay tile + resources + account row)
- **/apply-ebay** qualifying form for the locked eBay DWY tier (form endpoint pending GHL config)
- **/success** branded confirmation with 3-step next actions
- **/quiz** "Which course is right for you?" 4-question lead-gen
- **/404** branded with helpful links
- All legal pages updated for Foundation Pass terminology (refund.html bundle-aware)
- Subdomain password gate via Vercel Edge Middleware + env var `MARKETING_PREVIEW_PASSWORD`

### Course content (in `docs/courses/`)
Each of 4 courses has:
- README.md
- curriculum.md (8-9 modules)
- copy/landing-page.md
- prompts/ (8 thematic prompt files + README)
- templates/ (5-9 templates + README)
- scripts/sales-team.md (per-course phone team script)
- assistant/claude-project.md (course-specific AI assistant config)

### Brand assets (in `marketing/brand/`)
- 5 SVG logo variants (color, mono dark, mono light, reverse, horizontal lockup)
- 4 SVG course thumbnails (1280×720, distinct accent gradients per course)
- 5 SVG OG images (1200×630: main, AI, affiliate, estate, bookkeeping)
- 2 SVG email graphics (header banner + footer logo)
- README documenting usage + PNG conversion path

### Automation scripts (in `server/src/tools/`)
- `build-ghl-upload-helpers.js` — paste-ready HTML for GHL course uploads (saves ~6hrs)
- `build-claude-project-bundle.js` — packaged knowledge for AI Assistant Claude Project (91 files / 520KB)
- `rebuild-all.js` — one-command regenerate all derived content
- `svg-to-png.js` — Puppeteer-based SVG→PNG batch converter (Puppeteer not yet installed)
- `setup-stripe-bundle.js` — creates bundle product + Payment Link via Stripe API (dry-run by default; ready to run post-LLC)
- `e2e-smoke-test.js` — 12 health checks against live site (currently 12/12 passing)

### Documentation (in `docs/`)
- `ghl-master-playbook.md` — 8-phase end-to-end GHL launch walkthrough
- `ghl-upload-guide.md`, `ghl-portal-customization.md`, `ghl-upload-script.md`
- `chat-widget-setup.md`, `ebay-apply-setup.md`, `paypal-setup.md`
- `asset-generation-prompts.md` — AI prompts for hero photo/video generation
- `automation-scripts.md` — index of all scripts
- `email-sequences/foundation-pass-welcome.md` — 7-email Day 0 to Day 14 sequence
- `ad-copy/foundation-pass-ads.md` — 20 Facebook/Google ad variants in 4 packs
- `sales-team-foundation-pass-script.md` — phone team general script
- `pre-launch-checklist.md` — comprehensive launch gate
- `utm-tracking.md` — UTM naming convention + URL builder
- `research/product-bundle-research-2026-04-24.md` — competitive analysis with live source verification

---

## Pending user-side actions (the actual launch blockers)

These are gated by identity verification or your time — I genuinely can't do them.

### Must-do before any real revenue
- [ ] File Utah LLC (Income Academy LLC)
- [ ] Get EIN from IRS.gov
- [ ] Open business bank account (Mercury or Relay recommended)
- [ ] Set up virtual mailbox (iPostal1 Utah)
- [ ] Replace `[BUSINESS_ADDRESS]` placeholders on legal pages once mailbox is set
- [ ] Switch Stripe Sandbox → Live (gated by LLC + KYC)
- [ ] Run `node server/src/tools/setup-stripe-bundle.js --live` to create the bundle Payment Link
- [ ] Paste live Payment Link into `marketing/checkout.html` (replace test URL)

### GHL portal completion (the largest content lift)
- [ ] Set up `portal.incomeacademy.biz` custom domain in GHL + Namecheap CNAME
- [ ] Upload logo + brand colors to GHL Business Profile
- [ ] Generate course thumbnail PNGs (Canva, ~30 min) + upload to GHL
- [ ] Open `tools/ghl-upload-helpers/index.html` and paste-upload all 4 courses to GHL (~2 hours with the helper script)
- [ ] Set up the Income Academy AI Writing Assistant as a Claude Project at claude.ai (system prompt + course knowledge from `tools/claude-project-bundle/`)
- [ ] Upload course videos as you record them
- [ ] Customize welcome email template with provided content (`docs/email-sequences/foundation-pass-welcome.md`)

### Lead capture wiring
- [ ] Configure GHL chat widget → paste embed snippet into all 4 landing pages (replaces `GHL_CHAT_WIDGET_PLACEHOLDER`)
- [ ] Configure GHL form for eBay apply → paste endpoint URL into `marketing/apply-ebay/index.html` (replaces `FORM_ID_PLACEHOLDER`)
- [ ] Configure GHL form for quiz email capture → paste endpoint into `marketing/quiz/index.html` (replaces `QUIZ_FORM_PLACEHOLDER`)
- [ ] Verify MailerLite welcome automation triggers on Stripe purchase
- [ ] Toggle MailerLite domain alignment (manual UI step)

### Content & creative
- [ ] Generate AI hero images per `docs/asset-generation-prompts.md` (ChatGPT image generator) — drop into `marketing/ai/img/hero.jpg` and `marketing/affiliate/img/hero.jpg`
- [ ] Generate AI hero videos (Sora/Runway/Veo) — drop into `marketing/ai/video/hero.mp4` and `marketing/affiliate/video/hero.mp4`
- [ ] Convert brand SVGs to PNG for GHL/social: `cd server && npm install --save-dev puppeteer && cd .. && node server/src/tools/svg-to-png.js`
- [ ] Replace `[YOUR_NAME]` and `[YOUR_STORY]` placeholders in landing copy with real bio
- [ ] Record course videos when ready (Loom or screen-recording for v1)

### Compliance
- [ ] Attorney review of refund policy + engagement letter template (Bookkeeping course) before public launch
- [ ] Counsel review of FTC Biz Opp Rule applicability for the eBay Done-With-You program
- [ ] Update earnings disclaimer once attorney approves

### Optional polish
- [ ] Set up Meta Pixel / GA4 (placeholder script in HTML head, needs real ID)
- [ ] Submit sitemap to Google Search Console
- [ ] Test full purchase flow end-to-end with real card before announcing
- [ ] Run `node server/src/tools/e2e-smoke-test.js` periodically (cron or manual)

---

## Credentials & IDs (non-secret references)

**Neon `users` table**:
- User `id=3`, email `whbm08@yahoo.com` — Wyatt's active CRM account

**GHL**:
- Location ID: `c3HSS74ILjGye3pvGsHg`
- Product ID: `c02c3923-c9f1-404f-a76f-e48f97b91206`

**Render env vars set** (secrets NOT shown):
- `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `PORT`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `MAILERLITE_API_KEY`, `MAILERLITE_BUYER_GROUP_ID` (185313701944886793)
- `GHL_API_KEY`, `GHL_LOCATION_ID`
- `OWNER_USER_ID=3`, `INTAKE_TOKEN`

**Vercel env vars**:
- `MARKETING_PREVIEW_PASSWORD` (gates ai. + affiliate. subdomains)

**Local `~/intake-token.txt`** holds INTAKE_TOKEN for testing. Read via `$(cat ~/intake-token.txt)`.

---

## Recent decisions locked

- **Bundle name**: Income Academy — Foundation Pass
- **Pricing**: $47 one-time + $19/mo with 7-day free trial
- **4 courses**: AI Side Income, Honest Affiliate Marketing, Estate Sale Sourcing, Bookkeeping for Over-55s
- **5th tier**: eBay Done-With-You program ($2-5k, by phone application)
- **Site architecture (B)**: subdomains stay as focused top-of-funnel for paid ads; main site is the bundle showcase
- **Member portal**: hybrid — branded `/members` dashboard on Vercel, lessons hosted in GHL portal at `portal.incomeacademy.biz`
- **Signing provider**: SignWell (cheapest equivalent legal coverage)
- **Refund policy**: 7-day money-back on $47 + cancel-anytime on $19/mo
- **Continuity content plan**: monthly Q&A, weekly new prompts, member community
- **Voice agent (Phase 1)**: deferred to post-launch; Phase 1 inbound-only, Phase 2 opt-in check-ins, never Phase 3 cold outbound
- **Affiliate / referral program**: deferred until ~20 active Foundation Pass members exist

---

## Known issues / watchouts

- GHL public API doesn't support programmatic course/lesson creation — manual upload via helper script is the best we can do until GHL ships that feature
- GHL workflow dedup: same name + phone = merged contact (only an issue in testing with fake data)
- Render free tier: API spins down after 15 min idle (~50 sec first-request after sleep)
- MailerLite automation doesn't re-fire for existing group members
- Subdomain pages currently noindex; switch to indexed when ready for organic traffic
- All `[YOUR_NAME]` / `[YOUR_STORY]` / `[BUSINESS_ADDRESS]` / GHL_*_PLACEHOLDER strings must be replaced before public launch — see pre-launch-checklist.md

---

## If you're a fresh Claude session

1. **Read this primer first** before suggesting anything
2. **Honor the Maximum Autonomy mandate** — initiate work proactively, run full PR→merge→deploy loop without asking, only flag genuinely risky items
3. **Honor LVL V1** — propose before diffs for risky changes; surgical scope; rollback path required for every commit
4. **Never expose secrets** — direct Wyatt to set sensitive values via Render/Vercel UI
5. **Check for existing patterns** before suggesting new ones — most architectural decisions are made and shipped
6. **First open question**: where is Wyatt in the user-side action list above? Once you know, work the next item with him.

---

## Starter prompts for the new session

- "Read the primer. What's the current state and what's blocking launch?"
- "I just filed the LLC — what's next?"
- "I'm uploading courses to GHL today — walk me through it."
- "I generated AI hero images — paste them where they need to go."
- "Help me write [a thing]. Stay autonomous; ship it when done."
- "I want to add a 5th unlocked course." (significant — would trigger K-loop proposal)
- "Run e2e smoke test and tell me what's broken." (`node server/src/tools/e2e-smoke-test.js`)
