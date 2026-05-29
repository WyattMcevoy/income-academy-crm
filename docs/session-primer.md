# Income Academy — Session Primer

**Purpose**: paste at the start of a fresh Claude Code session so the new chat has full context on this project without needing to re-read prior conversation history.

**Last updated**: May 29, 2026 — batch video generator built (36 scripts), video 1 confirmed complete, smoke tests 14/14

---

## What this project is

**Income Academy** — a US-based online business education company owned by Wyatt Mcevoy. Target audience: US adults 50-75, semi-retired or near-retirement, non-technical, want extra income from home. Skeptical of hype.

**Product**: the **Foundation Pass** — $47 one-time + $19/month membership (7-day free trial on the membership). Grants access to 4 unlocked courses + a locked 5th graduation tier.

| # | Course | Status |
|---|---|---|
| 1 | AI Side Income Starter Kit | ✅ 9 modules + all 9 lessons in GHL |
| 2 | Honest Affiliate Marketing Starter | ✅ 9 modules + all 9 lessons in GHL |
| 3 | Estate Sale & Garage Sale Sourcing Academy | ✅ 9 modules + all 9 lessons in GHL |
| 4 | Bookkeeping From Home for Over-55s | ✅ 9 modules + all 9 lessons in GHL |
| 5 | eBay Reselling — Done With You | 🔒 Graduation tier, $2-5k by phone, by application |

**Bundle name**: Income Academy — Foundation Pass
**Tagline**: "Four honest ways to earn money from home — then one real business if you want to go bigger."

**GHL Foundation Pass Offer**: created and links all 4 courses ✅

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
- Never touch anything named "notebridge" (off-limits — separate project)
- GitHub username: **WyattMcevoy**
- `gh` CLI installed at `~/.local/bin/gh`
- Working directory: `/Users/wyattsmac/Documents/Income Academy CRM`

---

## Tech stack — deployed services

**Repo**: https://github.com/WyattMcevoy/income-academy-crm (private)

| Component | URL | Provider |
|---|---|---|
| Marketing site (Foundation Pass) | https://incomeacademy.biz | Vercel (`marketing/`) |
| AI subdomain landing | https://ai.incomeacademy.biz | Same Vercel project, password-gated |
| Affiliate subdomain landing | https://affiliate.incomeacademy.biz | Same Vercel project, password-gated |
| CRM app | https://dashboard.incomeacademy.biz | Vercel (`client/`) |
| API | https://income-academy-crm.onrender.com | Render (`server/`) |
| Database | Postgres | Neon (US West) |
| Member portal (current) | https://c3hss74iljgye3pvgshg.app.clientclub.net/ | GoHighLevel default subdomain |
| Member portal (custom domain pending) | portal.incomeacademy.biz | GoHighLevel — DNS not yet set up |
| Email sender | `incomeacademymail.com` | MailerLite |
| GHL sub-account | Income Academy | Location `c3HSS74ILjGye3pvGsHg` |
| Stripe | Personal sandbox (live pending Utah LLC) | Stripe |

**Domains at Namecheap**:
- `incomeacademy.biz` — main + dashboard. + go. + ai. + affiliate. (subdomains all deployed)
- `incomeacademymail.com` — MailerLite sending

---

## Recurring SaaS expenses (now/ongoing)

Tracked in CRM at `dashboard.incomeacademy.biz` → Expenses page (server route `/api/expenses`, schema in `server/src/db/schema.sql`).

| Service | Cost | Billing | Notes |
|---|---|---|---|
| GoHighLevel Agency | $103.55/mo | AmEx ····2000, monthly starting May 5, 2026 | Free trial ends May 5; auto-charge unless canceled |
| Google Workspace (incomeacademy.biz) | TBD ($6/user/mo Standard tier likely) | Starts billing May 1, 2026 | Username: Wyatt@incomeacademy.biz |
| Vercel | Free tier (Hobby) | n/a | Marketing + dashboard hosting |
| Render | Free tier | n/a | API server — spins down after 15 min idle (~50s cold-start) |
| Neon | Free tier | n/a | Postgres |
| MailerLite | Free tier (≤1000 subs) | n/a | Email sending |
| HeyGen | $10 prepaid API balance | usage-based | Avatar video generation (Saffron/Linda) |
| Stripe | 2.9% + $0.30/transaction | usage-based | Payment processor |
| Namecheap (incomeacademy.biz) | ~$13/yr | annual | Domain registration |
| Namecheap (incomeacademymail.com) | ~$13/yr | annual | MailerLite sending domain |
| OpenAI / Anthropic API | usage-based | monthly | Image generation, AI Assistant powering |

**Anything new >$25/mo requires explicit approval** before adding.

---

## What's built (April 22-29, 2026 — multi-session build)

### Site infrastructure (deployed)
- **Main site** at `incomeacademy.biz` — full Foundation Pass landing with tabbed Members Area showcase (4 courses + locked eBay), pricing block, FAQ with JSON-LD, OG meta, sitemap, robots
- **AI subdomain** with FTC anti-scam callout, prompt cards, AI Assistant chat preview
- **Affiliate subdomain** with post-HCU positioning, niche scorecard, 24-month timeline
- **/checkout** with bundle order summary (Stripe + PayPal buttons; Stripe live URL pending LLC)
- **/members** branded dashboard (4 course tiles + locked eBay tile + resources + account row) — now data-driven via `marketing/members/ghl-config.js`
- **/apply-ebay** qualifying form for the locked eBay DWY tier (form endpoint pending GHL config)
- **/success** branded confirmation with 3-step next actions
- **/quiz** "Which course is right for you?" 4-question lead-gen
- **/404** branded with helpful links
- All legal pages updated for Foundation Pass terminology (refund.html bundle-aware)
- Subdomain password gate via Vercel Edge Middleware + env var `MARKETING_PREVIEW_PASSWORD`

### GHL — ALL 4 COURSES COMPLETE
- ✅ AI Side Income Starter Kit — 9 modules + 9 lessons
- ✅ Honest Affiliate Marketing Starter — 9 modules + 9 lessons
- ✅ Estate Sale & Garage Sale Sourcing Academy — 9 modules + 9 lessons
- ✅ Bookkeeping From Home for Over-55s — 9 modules + 9 lessons
- ✅ Foundation Pass Offer created (links all 4 courses)
- ✅ Members dashboard wired to live GHL course URLs (Apr 29, 2026)
- ⏳ GHL portal CSS redesign — attempted, may need verification
- ⏳ Course thumbnails upload to GHL (PNGs ready in `marketing/brand/png-exports/course-thumbs/`)
- ⏳ Welcome email customization
- ⏳ Chat widget wiring (`GHL_CHAT_WIDGET_PLACEHOLDER` in landing pages)
- ⏳ eBay Apply form wiring (`FORM_ID_PLACEHOLDER` in apply-ebay/index.html)
- ⏳ portal.incomeacademy.biz custom domain setup

### AI Avatar Videos — IN PROGRESS
- **Saffron (HeyGen)** is the chosen avatar — grey hair, glasses, blazer, sitting at table, 60s-appearing woman
- **Name used in videos**: Linda
- **Video 1 RENDERED + DOWNLOADED** (Apr 29) → `marketing/videos/heygen/be490f1bcc8e4f9cbd0f17d16dd2f561.mp4` (7.9 MB, 34.2s)
- **Batch generator BUILT** (May 29) → `server/src/tools/generate-all-heygen-videos.js`
  - All 36 module scripts embedded (~140-185 words each, targeting 63-84s per video)
  - avatar_id: `7f2bb6c600f34e3699e58d3e8f4a2905` (Saffron sitting-at-table — CONFIRMED API-accessible after UI workaround)
  - voice_id: `0258bbc2cd8648cfa357adfb833f6d7b` (Saffron voice, fetched from /v2/voices)
  - Commands: `--dry-run`, `--test`, `--course=ai|affiliate|estate|bookkeeping`, `--module=ai-0`, `--wait`
  - Download companion: `server/src/tools/download-all-heygen-videos.js`
  - Manifest: `marketing/videos/heygen/manifest.json` (tracks all job IDs + status)
- **GATE**: Wyatt needs to watch Video 1 and approve Linda before batch generation starts

**HeyGen account**: wyatt.mcevoy@gmail.com, $10 added to API balance
**HeyGen API key**: leaked in prior chat — should rotate. Currently in `server/.env` as `HEYGEN_API_KEY`.
**HeyGen free plan**: 3 videos available; API credits charged per video beyond free tier

### Course content (in `docs/courses/`)
Each of 4 courses has:
- `README.md`
- `curriculum.md` (9 modules)
- `copy/landing-page.md`
- `prompts/` (8 thematic prompt files + README)
- `templates/` (5-9 templates + README)
- `scripts/sales-team.md` (per-course phone team script)
- `assistant/claude-project.md` (course-specific AI assistant config)

### Brand assets (in `marketing/brand/`)
- 5 SVG logo variants (color, mono dark, mono light, reverse, horizontal lockup)
- 4 SVG course thumbnails (1280×720, distinct accent gradients per course) → also exported to PNG via `svg-to-png-playwright.js`
- 5 SVG OG images (1200×630: main, AI, affiliate, estate, bookkeeping)
- 2 SVG email graphics (header banner + footer logo)
- README documenting usage + PNG conversion path

### Automation scripts (in `server/src/tools/`)
- `build-ghl-upload-helpers.js` — paste-ready HTML for GHL course uploads (saves ~6hrs)
- `build-claude-project-bundle.js` — packaged knowledge for AI Assistant Claude Project (91 files / 520KB)
- `rebuild-all.js` — one-command regenerate all derived content
- `svg-to-png.js` — Puppeteer-based SVG→PNG batch converter (Puppeteer not installed)
- `svg-to-png-playwright.js` — Playwright-based SVG→PNG (works; produces PNGs at `marketing/brand/png-exports/`)
- `setup-stripe-bundle.js` — creates bundle product + Payment Link via Stripe API (dry-run by default; ready post-LLC)
- `e2e-smoke-test.js` — 14 health checks against live site (currently 14/14 passing)
- `approval-bridge.js` — Telegram notification when Claude needs approval
- `overnight-runner.js` — runs full build queue autonomously
- `fetch-ghl-config.js` — auto-populate ghl-config.js from GHL REST API (currently dead-end, see "Known watchouts")
- `upload-ghl-thumbnails.js` — API thumbnail upload + UI fallback
- `heygen-fetch-video.js` — poll a HeyGen video by ID, download MP4 once ready
- `generate-all-heygen-videos.js` — **batch generate all 36 module intro videos** (all scripts embedded, --dry-run/--course/--module/--wait flags)
- `download-all-heygen-videos.js` — poll manifest + download any completed renders
- `wire-demo.js` — one-shot orchestrator running the demo-wiring sequence
- `macos-file-picker.sh` — AppleScript helper to drive NSOpenPanel (requires Accessibility permission)
- `ghl-create-foundation-pass.js`, `ghl-add-bookkeeping-modules.js`, `ghl-add-estate-sale-modules-5-8.js`, `ghl-portal-css.js` — GHL automation scripts (Playwright-based)

### Documentation (in `docs/`)
- `session-primer.md` — this file
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
- `demo-readiness.md` — runbook for the wire-demo orchestrator
- `openclaw-handoff-2026-04-29.md` — full session handoff for OpenClaw / new agents

### OpenClaw integration
- `JarvisWyatt_bot` on Telegram is connected
- Model: `claude-sonnet-4-6` (5x cheaper than opus, verified working)
- Skills: `claude-control`, `claude-approval`, `ghl-automation`, `foundation-pass-demo` (all in `~/.openclaw/workspace/skills/`)
- Status file: `~/.openclaw/workspace/CLAUDE_STATUS.md` (auto-updated)
- Handoff doc: `~/.openclaw/workspace/HANDOFF-2026-04-29.md`
- Commands: "build status", "restart overnight", "stop overnight", "smoke test", "wire demo", "approve", "skip"

---

## Pending user-side actions (the actual launch blockers)

These are gated by identity verification or Wyatt's time — Claude genuinely can't do them.

### Must-do before any real revenue
- [ ] File Utah LLC (Income Academy LLC)
- [ ] Get EIN from IRS.gov
- [ ] Open business bank account (Mercury or Relay recommended)
- [ ] Set up virtual mailbox (iPostal1 Utah)
- [ ] Replace `[BUSINESS_ADDRESS]` placeholders on legal pages once mailbox is set
- [ ] Switch Stripe Sandbox → Live (gated by LLC + KYC)
- [ ] Run `node server/src/tools/setup-stripe-bundle.js --live` to create the bundle Payment Link
- [ ] Paste live Payment Link into `marketing/checkout.html` (replace test URL)

### Demo-wiring blockers (Apr 29)
- [ ] **Grant Accessibility permission to Terminal** in System Settings → Privacy & Security → Accessibility (gates the 5 remaining UI uploads)
- [ ] Upload 4 course thumbnails to GHL (PNGs at `marketing/brand/png-exports/course-thumbs/`)
- [ ] Upload Video 1 to AI Side Income → Module 0 lesson (file: `marketing/videos/heygen/be490f1bcc8e4f9cbd0f17d16dd2f561.mp4`)
- [ ] **Wyatt watches Video 1 and approves Linda** — this is the gate for batch generation
- [ ] When approved: `node server/src/tools/generate-all-heygen-videos.js --course=ai` (then estate, affiliate, bookkeeping)
- [x] ~~Capture Saffron workspace look_id~~ — look_id `7f2bb6c600f34e3699e58d3e8f4a2905` IS the API avatar_id (confirmed)
- [x] ~~Build batch video generator~~ — done: `server/src/tools/generate-all-heygen-videos.js` with all 36 scripts

### GHL portal completion (the largest content lift)
- [ ] Set up `portal.incomeacademy.biz` custom domain in GHL + Namecheap CNAME
- [ ] Upload logo + brand colors to GHL Business Profile
- [x] ~~Generate course thumbnail PNGs~~ — done via svg-to-png-playwright.js
- [x] ~~Paste-upload all 4 courses to GHL~~ — done via automation
- [ ] Set up the Income Academy AI Writing Assistant as a Claude Project at claude.ai (system prompt + course knowledge from `tools/claude-project-bundle/`)
- [ ] Upload course videos as you record them (OR continue with HeyGen Saffron/Linda)
- [ ] Customize welcome email template with provided content (`docs/email-sequences/foundation-pass-welcome.md`)

### Lead capture wiring
- [ ] Configure GHL chat widget → paste embed snippet into all 4 landing pages (replaces `GHL_CHAT_WIDGET_PLACEHOLDER`)
- [ ] Configure GHL form for eBay apply → paste endpoint URL into `marketing/apply-ebay/index.html` (replaces `FORM_ID_PLACEHOLDER`)
- [ ] Configure GHL form for quiz email capture → paste endpoint into `marketing/quiz/index.html` (replaces `QUIZ_FORM_PLACEHOLDER`)
- [ ] Verify MailerLite welcome automation triggers on Stripe purchase
- [ ] Toggle MailerLite domain alignment (manual UI step)

### Content & creative
- [x] ~~Generate AI hero images~~ — 4 hero images live (ChatGPT GPT-image-1)
- [ ] Generate AI hero videos (Sora/Runway/Veo) — drop into `marketing/ai/video/hero.mp4` and `marketing/affiliate/video/hero.mp4`
- [x] ~~Convert brand SVGs to PNG~~ — done via svg-to-png-playwright.js
- [ ] Replace `[YOUR_NAME]` and `[YOUR_STORY]` placeholders in landing copy with real bio
- [ ] Record course videos when ready (Loom or screen-recording for v1) OR continue with HeyGen Linda

### Compliance
- [ ] Attorney review of refund policy + engagement letter template (Bookkeeping course) before public launch
- [ ] Counsel review of FTC Biz Opp Rule applicability for the eBay Done-With-You program
- [ ] Update earnings disclaimer once attorney approves

### Optional polish
- [ ] Set up Meta Pixel / GA4 (placeholder script in HTML head, needs real ID)
- [ ] Submit sitemap to Google Search Console
- [ ] Test full purchase flow end-to-end with real card before announcing
- [ ] Run `node server/src/tools/e2e-smoke-test.js` periodically (cron or manual)

### Security hygiene
- [ ] Rotate HeyGen API key (was pasted in chat — see `server/.env`)
- [ ] Rotate GHL Private Integration key (was pasted in chat — see `server/.env`)

---

## Credentials & IDs (non-secret references)

**GHL Location**: `c3HSS74ILjGye3pvGsHg`

**GHL course product IDs** (verified Apr 29, 2026):
- AI Side Income Starter Kit: `d4c2b0c2-dee8-4ccf-8d5b-cd37e1eef075`
- Honest Affiliate Marketing Starter: `4883bfbe-c2d7-4d08-b8b9-4fe130942e07`
- Estate Sale and Garage Sale Sourcing Academy: `bdaf7829-7472-443c-af7e-6b60b131c406`
- Bookkeeping From Home for Over-55s: `f328cbc0-e1db-4c24-90d4-83469a5252a8`

**GHL Foundation Pass offer ID**: `6136a3b5-c5f1-4e4c-bf75-d3b95c64e94e`
**GHL Stripe product ID (legacy)**: `c02c3923-c9f1-404f-a76f-e48f97b91206`

**HeyGen Video 1 ID**: `be490f1bcc8e4f9cbd0f17d16dd2f561`

**Neon `users` table**:
- User `id=3`, email `whbm08@yahoo.com` — Wyatt's active CRM account

**Render env vars set** (secrets NOT shown, set via Render dashboard):
- `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`, `PORT`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `MAILERLITE_API_KEY`, `MAILERLITE_BUYER_GROUP_ID` (`185313701944886793`)
- `GHL_API_KEY`, `GHL_LOCATION_ID`
- `OWNER_USER_ID=3`, `INTAKE_TOKEN`

**Vercel env vars**:
- `MARKETING_PREVIEW_PASSWORD` (gates ai. + affiliate. subdomains)

**Local env files** (gitignored):
- `server/.env` — DATABASE_URL, JWT_SECRET, NODE_ENV, PORT, CLIENT_ORIGIN, OWNER_USER_ID, HEYGEN_API_KEY, GHL_API_KEY, GHL_LOCATION_ID
- `client/.env` — Vite frontend vars
- `~/intake-token.txt` — holds INTAKE_TOKEN for testing. Read via `$(cat ~/intake-token.txt)`.

---

## What to do at start of new session

1. **Read this primer** before suggesting anything.
2. **Honor the Maximum Autonomy mandate** — initiate work proactively, run full PR→merge→deploy loop without asking, only flag genuinely risky items.
3. **Honor LVL V1** — propose before diffs for risky changes; surgical scope; rollback path required for every commit.
4. **Never expose secrets** — direct Wyatt to set sensitive values via Render/Vercel UI.
5. **Check for existing patterns** before suggesting new ones — most architectural decisions are made and shipped.
6. **Run smoke test** to know current state: `node server/src/tools/e2e-smoke-test.js` (should be 14/14).
7. **First open question**: where is Wyatt in the user-side action list above? Once you know, work the next item with him.

---

## Recent decisions locked

- **Presenter**: Saffron (HeyGen), presented as "Linda" — grey hair, glasses, blazer, sitting at table, 60s-appearing woman
- **Bundle name**: Income Academy — Foundation Pass
- **Pricing**: $47 one-time + $19/mo with 7-day free trial
- **Monthly model**: $19/mo (not $9/mo)
- **4 courses**: AI Side Income, Honest Affiliate Marketing, Estate Sale Sourcing, Bookkeeping for Over-55s
- **5th tier**: eBay Done-With-You program ($2-5k, by phone application)
- **Site architecture (B)**: subdomains stay as focused top-of-funnel for paid ads; main site is the bundle showcase
- **Member portal**: hybrid — branded `/members` dashboard on Vercel, lessons hosted in GHL portal at `c3hss74iljgye3pvgshg.app.clientclub.net` (custom domain `portal.incomeacademy.biz` pending)
- **Signing provider**: SignWell (cheapest equivalent legal coverage)
- **Refund policy**: 7-day money-back on $47 + cancel-anytime on $19/mo
- **Continuity content plan**: monthly Q&A, weekly new prompts, member community
- **Voice agent (Phase 1)**: deferred to post-launch; Phase 1 inbound-only, Phase 2 opt-in check-ins, never Phase 3 cold outbound
- **Affiliate / referral program**: deferred until ~20 active Foundation Pass members exist
- **Entity**: Utah LLC
- **AI video walkthroughs**: future plan — HeyGen Saffron/Linda for all 36 modules, automation via API once workspace look_id captured

---

## Known issues / watchouts

- **GHL public API does not support programmatic course/lesson creation** — manual upload via helper script is the best we can do until GHL ships that feature
- **GHL public API v2 does NOT expose Memberships > Courses** — confirmed Apr 29 with full `courses.readonly` + `products.readonly` + `products.write` scopes; courses must be managed via UI
- **Chrome MCP `file_upload` blocked on app.gohighlevel.com** — extension-level restriction, can't be worked around. Need AppleScript fallback.
- **AppleScript keystroke injection blocked** unless Accessibility permission is granted to Terminal in System Settings
- **HeyGen Saffron look IDs are in public library space** — need workspace look_id via UI first
- **Chrome extension reliability**: switch_browser before each Chrome task, select Personal Chrome (deviceId `c22c2bf3-5596-4365-9692-4379d3537f56`)
- **GHL workflow dedup**: same name + phone = merged contact (only an issue in testing with fake data)
- **GHL lesson uploads**: slow (3-5 min per module), Chrome must stay awake
- **overnight-runner.js fails if Chrome extension disconnects** — Puppeteer-based version needed
- **Render free tier**: API spins down after 15 min idle (~50 sec cold-start)
- **MailerLite automation doesn't re-fire** for existing group members
- **Subdomain pages currently noindex** — switch to indexed when ready for organic traffic
- All `[YOUR_NAME]` / `[YOUR_STORY]` / `[BUSINESS_ADDRESS]` / `GHL_*_PLACEHOLDER` strings must be replaced before public launch — see pre-launch-checklist.md

---

## Starter prompts for the new session

- "Read the primer. What's the current state and what's blocking launch?"
- "I just filed the LLC — what's next?"
- "I'm uploading courses to GHL today — walk me through it."
- "I generated AI hero images — paste them where they need to go."
- "Help me write [a thing]. Stay autonomous; ship it when done."
- "I want to add a 5th unlocked course." (significant — would trigger K-loop proposal)
- "Run e2e smoke test and tell me what's broken." (`node server/src/tools/e2e-smoke-test.js`)
- "Wire the demo." (`HEYGEN_VIDEO_ID=be490f1bcc8e4f9cbd0f17d16dd2f561 node server/src/tools/wire-demo.js`)
- "Pick up from the OpenClaw handoff." (read `~/.openclaw/workspace/HANDOFF-2026-04-29.md`)
