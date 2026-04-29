# Handoff — April 29, 2026 EOD

**For**: any Claude agent picking up the Income Academy Foundation Pass demo work
**From**: Claude session that ran `/Users/wyattsmac/Documents/Income Academy CRM` from ~10:00 AM to ~17:40 UTC on Apr 29, 2026
**Why this exists**: the user is tired and wants to hand the rest off without re-explaining context. Read this end-to-end before doing anything.

---

## TL;DR for the agent

The Foundation Pass site, members dashboard, and all 4 GHL courses are LIVE. HeyGen Video 1 is rendered + downloaded. **The only thing left is 5 manual UI uploads to GHL** (4 thumbnails + 1 video) — and those are blocked behind a single OS permission toggle the user has to flip.

Once Wyatt grants **Accessibility permission to Terminal** (System Settings → Privacy & Security → Accessibility → toggle Terminal ON), you can run `server/src/tools/macos-file-picker.sh` to drive the macOS file picker via AppleScript and complete all 5 uploads automatically.

Everything else is done. Smoke test 14/14 green.

---

## What we did this session

### 1. Refactored `/members` dashboard to data-driven URL config

- Created `marketing/members/ghl-config.js` — single source of truth for portal + course URLs
- Replaced inline `GHL_COURSE_URL_*` placeholders in `marketing/members/index.html` with `data-ghl="..."` attributes that resolve at runtime from the config
- Added graceful fallback: if URLs aren't populated yet (still starting `GHL_`), CTAs alert "lessons portal is being set up" instead of breaking
- Bumped E2E smoke test from 12 to 14 checks (added: dashboard loads ghl-config script + ghl-config.js is reachable)

### 2. Built 5 new automation tools in `server/src/tools/`

| File | Purpose |
|------|---------|
| `fetch-ghl-config.js` | Auto-populate ghl-config.js from GHL REST API. Currently dead-end (see "Blockers"). |
| `svg-to-png-playwright.js` | Convert course thumbs SVG → 1280×720 PNG. Works ✓ (used Playwright since puppeteer wasn't installed). |
| `upload-ghl-thumbnails.js` | API-first thumbnail upload + UI fallback guide. API path dead-ends (GHL doesn't expose this). |
| `heygen-fetch-video.js` | Poll a HeyGen video by ID, download MP4 when ready. Worked ✓ — Video 1 downloaded successfully. |
| `wire-demo.js` | One-shot orchestrator running all of the above in sequence. |
| `macos-file-picker.sh` | AppleScript helper to drive NSOpenPanel via Cmd+Shift+G. Needs Accessibility permission. |

### 3. Generated all 4 course-thumbnail PNGs (1280×720)

Run output:
```
✓ affiliate-marketing-thumb.svg → marketing/brand/png-exports/course-thumbs/affiliate-marketing-thumb.png
✓ ai-side-income-thumb.svg     → marketing/brand/png-exports/course-thumbs/ai-side-income-thumb.png
✓ bookkeeping-thumb.svg        → marketing/brand/png-exports/course-thumbs/bookkeeping-thumb.png
✓ estate-sale-sourcing-thumb.svg → marketing/brand/png-exports/course-thumbs/estate-sale-sourcing-thumb.png
```

Sizes: ~430-480 KB each. PNGs are gitignored (regenerate via the script anytime).

### 4. Downloaded HeyGen Video 1

- Video ID: `be490f1bcc8e4f9cbd0f17d16dd2f561`
- Title: "AI Side Income - Linda Welcome (Saffron)"
- Path: `marketing/videos/heygen/be490f1bcc8e4f9cbd0f17d16dd2f561.mp4`
- Size: 7.6 MB
- Duration: ~42s
- Avatar: Saffron (sitting at table look_id `7f2bb6c600f34e3699e58d3e8f4a2905`), default voice (warm older female)
- Quality: 720p, 25fps, MP4, HeyGen watermark on

**Wyatt's reaction is still pending.** Don't generate the other 35 module videos until Wyatt approves Linda's pacing/tone/look.

### 5. Harvested 4 GHL course product IDs from the UI

Used Personal Chrome MCP (deviceId `c22c2bf3-5596-4365-9692-4379d3537f56`) to navigate to `https://app.gohighlevel.com/v2/location/c3HSS74ILjGye3pvGsHg/memberships/courses/products-v2` and click each course tile. The URL after the click contains `?product_id=<uuid>`:

| Course | Product ID |
|--------|-----------|
| AI Side Income Starter Kit | `d4c2b0c2-dee8-4ccf-8d5b-cd37e1eef075` |
| Honest Affiliate Marketing Starter | `4883bfbe-c2d7-4d08-b8b9-4fe130942e07` |
| Estate Sale and Garage Sale Sourcing Academy | `bdaf7829-7472-443c-af7e-6b60b131c406` |
| Bookkeeping From Home for Over-55s | `f328cbc0-e1db-4c24-90d4-83469a5252a8` |

### 6. Found the GHL client portal base URL

From Memberships → Client Portal dashboard:
```
https://c3hss74iljgye3pvgshg.app.clientclub.net/
```

This is the default GHL clientclub subdomain — works without `portal.incomeacademy.biz` DNS being set up. Customer-facing course URL pattern: `<base>/products/<product_id>`. Verified by visiting → redirects unauthenticated users to `/login` (correct behavior).

### 7. Wired live URLs into ghl-config.js + pushed to prod

```js
window.IA_GHL_CONFIG = {
  portalBase: 'https://c3hss74iljgye3pvgshg.app.clientclub.net/',
  courses: {
    ai:           '<base>/products/d4c2b0c2-dee8-4ccf-8d5b-cd37e1eef075',
    affiliate:    '<base>/products/4883bfbe-c2d7-4d08-b8b9-4fe130942e07',
    estate:       '<base>/products/bdaf7829-7472-443c-af7e-6b60b131c406',
    bookkeeping:  '<base>/products/f328cbc0-e1db-4c24-90d4-83469a5252a8',
  },
};
```

Vercel auto-deployed in ~90s. Smoke test 14/14 green at 17:36 UTC.

### 8. Updated `.gitignore`

Added:
- `marketing/brand/png-exports/` (build artifact, regenerable)
- `.claude/worktrees/`
- `.claude/settings.local.json`

### 9. Set up env vars in `server/.env` (gitignored)

```
HEYGEN_API_KEY=sk_V2_hgu_kAxjkctL2iZ_JcY7DiKOWu5LYyUSYmv3sX1slRHmYy0n
GHL_API_KEY=pit-41a48252-9f36-4f8f-955a-1ef6a7014fd5
GHL_LOCATION_ID=c3HSS74ILjGye3pvGsHg
```

⚠️ **Security note**: both keys were pasted in chat (transcript exposure). Wyatt should rotate both:
- HeyGen: app.heygen.com → Settings → API → regenerate
- GHL: app.gohighlevel.com → Settings → Private Integrations → delete + regenerate with same scopes (`courses.readonly` + `products.readonly` + `products.write`)

### 10. Committed + pushed three times (all auto-merged to main, auto-deployed via Vercel)

```
16f4f84 Wire members dashboard to data-driven GHL config + demo tooling
97c12d6 Add demo-readiness doc explaining wire-demo runner + flow
b52fef0 Wire live GHL course URLs into members dashboard
```

---

## Blockers we hit (so you don't waste time re-discovering)

### Blocker 1: GHL public API v2 does not expose Memberships courses

Tried every plausible endpoint with full `courses.readonly` + `products.readonly` + `products.write` scopes:

```
GET /courses/?locationId=...&limit=100               → 404
GET /products/?locationId=...&limit=100              → 200, but {"products":[],"total":[]}
GET /products/{known_id}?locationId=...              → 404 "Product not found"
GET /memberships/courses/?locationId=...             → 404 (or empty)
GET /products/list?locationId=...                    → 404
GET /products/?altId=...&altType=location            → 422
GET /products/inventory?locationId=...               → 401 "scope not authorized"
```

GHL keeps Memberships > Courses on a separate internal API. **Don't try more endpoints. They're not there.**

### Blocker 2: Chrome MCP `file_upload` blocked on app.gohighlevel.com

```
mcp__Claude_in_Chrome__file_upload(ref=ref_167, paths=[<png>], tabId=...)
→ Failed to upload file(s): {"code":-32000,"message":"Not allowed"}
```

Origin-level restriction on the Chrome extension. Can't be worked around from agent side.

### Blocker 3: AppleScript keystroke injection needs Accessibility permission

```
osascript -e 'tell application "System Events" to keystroke "x"'
→ System Events got an error: osascript is not allowed to send keystrokes. (1002)
```

This is the gating issue. **Wyatt needs to flip ONE toggle**: System Settings → Privacy & Security → Accessibility → enable Terminal (and iTerm2 if applicable). Once flipped, `server/src/tools/macos-file-picker.sh` works for all 5 remaining uploads.

### Blocker 4: HeyGen workspace look_id still not captured

Saffron's public-library look IDs (listed in the skill doc) don't work via HeyGen API — they're in HeyGen's library namespace, not the user's workspace. To batch-generate the other 35 module videos via API, we still need the workspace look_id.

The only way to capture it: open HeyGen UI → DevTools → Network → create any video manually → look for the `look_id` in the request payload. **One-time task. ~2 min.**

---

## What the agent should do, in order

1. **Pick up the conversation with Wyatt** — "Hi, I'm continuing the Foundation Pass demo wiring from the handoff doc. Quick question: did you grant Terminal Accessibility permission yet?"

2. **If Accessibility is granted**: drive the 5 uploads via `macos-file-picker.sh`. See `~/.openclaw/workspace/skills/foundation-pass-demo/SKILL.md` for step-by-step.

3. **If not granted**: walk Wyatt through System Settings → Privacy & Security → Accessibility → toggle Terminal ON. Tell him to type "done" when finished.

4. **After all 5 uploads complete**: run smoke test, verify 14/14, ping Wyatt via OpenClaw approval bridge so he can do the final demo walkthrough.

5. **Wait for Wyatt's reaction to Linda Video 1** before generating the other 35. If he wants script/pacing adjustments, edit `/tmp/linda_video1_script.txt`, regenerate Video 1, ask again. Only proceed to batch generation after explicit approval.

6. **Workspace look_id capture** (parallel track): when Wyatt has 2 free min, ask him to open HeyGen UI in DevTools, create a quick video, copy the `look_id` from the network panel, paste it back. Then build `server/src/tools/generate-all-heygen-videos.js` to batch-generate all 36 module videos.

---

## Don't do these (out of scope or already covered)

- Don't refactor the dashboard further — it's already data-driven and clean
- Don't keep probing GHL course endpoints — confirmed dead end
- Don't try `puppeteer`-based scripts — Playwright is already installed and the Playwright variants exist (`svg-to-png-playwright.js`)
- Don't auto-flip Stripe sandbox→live — gates: Utah LLC + EIN + Mercury/Relay bank + iPostal1 (all Wyatt-side, not done yet)
- Don't touch `notebridge` (separate project, off-limits per Wyatt's pinned rules)
- Don't commit `.claude/worktrees/` or `.env` files (gitignored)
- Don't reproduce the leaked API keys anywhere committed

---

## Files added/modified this session

```
A  marketing/members/ghl-config.js           (16 lines, runtime URL config)
M  marketing/members/index.html              (45 line refactor, data-ghl attributes)
A  server/src/tools/fetch-ghl-config.js      (~150 lines, API auto-populate)
A  server/src/tools/svg-to-png-playwright.js (~50 lines)
A  server/src/tools/upload-ghl-thumbnails.js (~120 lines)
A  server/src/tools/heygen-fetch-video.js    (~80 lines)
A  server/src/tools/wire-demo.js             (~70 lines, orchestrator)
A  server/src/tools/macos-file-picker.sh     (~25 lines, AppleScript helper)
M  server/src/tools/e2e-smoke-test.js        (added 2 checks)
M  .gitignore                                 (added png-exports, .claude/worktrees)
A  docs/demo-readiness.md                    (~60 lines, runbook)
A  ~/.openclaw/workspace/skills/foundation-pass-demo/SKILL.md (this skill)
A  ~/.openclaw/workspace/HANDOFF-2026-04-29.md                 (this file)
```

Three commits pushed to main. All deployed.

---

## Critical references — paste-ready

**Repo root:** `/Users/wyattsmac/Documents/Income Academy CRM/`
**Repo:** `https://github.com/WyattMcevoy/income-academy-crm`

**Sites:**
- Marketing: `https://incomeacademy.biz` (Vercel, marketing/)
- AI sub: `https://ai.incomeacademy.biz` (password-gated)
- Affiliate sub: `https://affiliate.incomeacademy.biz` (password-gated)
- CRM: `https://dashboard.incomeacademy.biz` (Vercel, client/)
- API: `https://income-academy-crm.onrender.com` (Render, server/)
- Member portal: `https://c3hss74iljgye3pvgshg.app.clientclub.net/` (current default GHL portal)

**GHL location:** `c3HSS74ILjGye3pvGsHg`
**Foundation Pass offer ID:** `6136a3b5-c5f1-4e4c-bf75-d3b95c64e94e`
**HeyGen Video 1 ID:** `be490f1bcc8e4f9cbd0f17d16dd2f561`

**Smoke test command:**
```bash
node "/Users/wyattsmac/Documents/Income Academy CRM/server/src/tools/e2e-smoke-test.js"
```

**Wire-demo runner (one-shot):**
```bash
cd "/Users/wyattsmac/Documents/Income Academy CRM"
set -a; source server/.env; set +a
HEYGEN_VIDEO_ID=be490f1bcc8e4f9cbd0f17d16dd2f561 node server/src/tools/wire-demo.js
```

---

## Final note

Wyatt is exhausted and wants to step away from this task. Be efficient. Don't ask him to repeat context that's already in this doc. Use the OpenClaw approval bridge (Telegram) for any actual blockers — but most of the remaining work is unblocked once Accessibility is granted.

The single most important sentence in this doc: **after Wyatt flips one OS toggle, the 5 remaining uploads can finish in <5 min via `macos-file-picker.sh`**.
