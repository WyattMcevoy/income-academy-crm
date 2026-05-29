# Automation Scripts

Everything in `server/src/tools/` — the scripts that offload work from manual clicking.

## Available scripts

### `build-ghl-upload-helpers.js`
Converts `docs/courses/<slug>/curriculum.md` into paste-ready HTML for GHL course uploads. Output in `tools/ghl-upload-helpers/`. One-click copy buttons next to each module.

**Run**: `node server/src/tools/build-ghl-upload-helpers.js`
**When**: after editing any curriculum.md
**Time saved**: ~4-6 hours per course upload

### `build-claude-project-bundle.js`
Packages all 4 course folders into a flat upload-ready bundle for Claude Projects. Writes system prompt + all content to `tools/claude-project-bundle/`.

**Run**: `node server/src/tools/build-claude-project-bundle.js`
**When**: before creating/updating the Income Academy AI Assistant Claude Project
**Time saved**: ~30 min per setup + reduces version-drift risk

### `rebuild-all.js`
Single-command runner that regenerates ALL derived content in the right order. Good for post-curriculum-edit housekeeping.

**Run**: `node server/src/tools/rebuild-all.js`
**When**: after any course content change
**Time saved**: remembering to run multiple individual scripts

### `svg-to-png.js`
Batch-converts every SVG in `marketing/brand/` to PNG at recommended sizes (favicon sizes, logo sizes, email banner sizes). Uses Puppeteer for pixel-perfect rendering.

**Run**: `cd server && npm install --save-dev puppeteer` (one-time) → `node src/tools/svg-to-png.js`
**When**: before uploading to GHL (which often requires PNG) or before platforms that reject SVG
**Time saved**: ~30 min of manual cloudconvert uploads per batch

### `setup-stripe-bundle.js`
Creates the Foundation Pass product + Prices ($47 one-time + $19/mo with 7-day trial) + Payment Link in Stripe via API. **Dry-run by default** — no API calls unless you pass `--live`.

**Run (dry-run, safe)**: `STRIPE_SECRET_KEY=sk_test_xxx node server/src/tools/setup-stripe-bundle.js`
**Run (live)**: `STRIPE_SECRET_KEY=sk_test_xxx node server/src/tools/setup-stripe-bundle.js --live`
**When**: after LLC is filed + Stripe Live mode flipped
**Time saved**: ~15 min of manual dashboard clicking + eliminates configuration errors

### `e2e-smoke-test.js`
End-to-end smoke test that verifies every critical URL responds correctly. Catches deployment regressions, middleware breaks, DNS/SSL issues, content drift.

**Run**: `node server/src/tools/e2e-smoke-test.js`
**When**: after any merge to main, or scheduled (cron, CI)
**Time saved**: catches broken deploys before members do
**Exit codes**: 0 = all pass, 1 = at least one failure

### `generate-all-heygen-videos.js` ⭐
Generates all 36 Linda/Saffron module intro videos (4 courses × 9 modules) via HeyGen API. All scripts embedded — no external files needed.

**Run (preview)**: `node server/src/tools/generate-all-heygen-videos.js --dry-run`
**Run (one course)**: `node server/src/tools/generate-all-heygen-videos.js --course=ai`
**Run (all 36)**: `node server/src/tools/generate-all-heygen-videos.js`
**Run (single module)**: `node server/src/tools/generate-all-heygen-videos.js --module=estate-3`
**When**: after Wyatt approves Video 1 (Linda look + style approval)
**Gate**: `marketing/videos/heygen/be490f1bcc8e4f9cbd0f17d16dd2f561.mp4` — Video 1 must be approved first
**Cost**: ~$0.05-0.10/video, ~$1.80-3.60 for full set
**Avatar**: Saffron sitting-at-table (avatar_id `7f2bb6c600f34e3699e58d3e8f4a2905`)
**Voice**: Saffron (voice_id `0258bbc2cd8648cfa357adfb833f6d7b`)

### `download-all-heygen-videos.js`
Polls the render manifest and downloads any completed HeyGen videos to `marketing/videos/heygen/`.

**Run**: `node server/src/tools/download-all-heygen-videos.js`
**Run (force re-download)**: `node server/src/tools/download-all-heygen-videos.js --force`
**When**: after `generate-all-heygen-videos.js` queues videos — HeyGen renders async (3-8 min each)

### `wire-ghl-placeholders.js`
Wires all GHL-specific IDs across all marketing pages in one command. Handles chat widget (8 pages), eBay apply form, and quiz email capture form.

**Run**: `node server/src/tools/wire-ghl-placeholders.js --chat-widget-id=X --ebay-form-id=Y --quiz-form-id=Z`
**Dry-run**: add `--dry-run` flag to preview without writing
**When**: once Wyatt gets the IDs from GHL → Sites → Chat Widget + Forms
**Time saved**: 10 pages of manual find/replace

### `heygen-fetch-video.js`
Polls a specific HeyGen video ID and downloads it when ready.

**Run**: `HEYGEN_API_KEY=xxx node server/src/tools/heygen-fetch-video.js <videoId>`
**When**: to download a single specific video by ID

### `generate-brand-images.js`
Generates AI hero images for landing pages using OpenAI DALL-E 3.

**Run**: `node server/src/tools/generate-brand-images.js --dry-run`
**Run (live)**: `OPENAI_API_KEY=sk-xxx node server/src/tools/generate-brand-images.js`
**Cost**: ~$0.04-0.12/image, ~$0.25-0.50 for full set

### `upload-ghl-thumbnails.js`
Attempts to upload course thumbnails to GHL via API (or falls back to UI instructions).

**Run**: `node server/src/tools/upload-ghl-thumbnails.js`

### `overnight-runner.js`
Runs the full autonomous GHL build queue. Sends Telegram updates via OpenClaw. Logs to `overnight-build.log`.

**Run**: `node server/src/tools/overnight-runner.js`
**When**: for multi-step overnight builds via OpenClaw

### `approval-bridge.js`
Writes to `/tmp/claude_needs_approval.txt`, sends Telegram notification, polls for APPROVE/SKIP/STOP response. Used by `overnight-runner.js` for gated steps.

### `keep-warm.js`
Pings the Render API server every 10 min to prevent 15-min idle cold-start spin-down (~50s delay on first request).

**Run**: `node server/src/tools/keep-warm.js` (runs in background)

### `admin-cli.js`
Direct database access without JWT. Run admin queries against the Neon database.

**Run**: `node server/src/tools/admin-cli.js`

### `import-leads.js` (pre-existing)
Imports leads from a CSV file into the Neon database.

**Run**: `npm run import-leads` (from `server/`)

## Recommended workflow when adding/editing a course

1. Edit `docs/courses/<slug>/curriculum.md` (or add a new course folder)
2. Run `node server/src/tools/rebuild-all.js` — regenerates GHL helpers + Claude bundle
3. Open `tools/ghl-upload-helpers/index.html` in browser → paste into GHL
4. Upload `tools/claude-project-bundle/` to Claude Projects (replaces existing knowledge)
5. If brand assets changed: run `node server/src/tools/svg-to-png.js` → upload PNGs to platforms that need them
6. Commit the updated source (curriculum.md) AND the regenerated output

## What's NOT automated (and why)

- **Stripe Payment Link creation**: could script this but you said skip until LLC is filed. Will build when unblocked.
- **GHL course uploads**: GHL's public API doesn't support creating lessons programmatically (top-voted feature request still unbuilt). The helper script is the best we can do.
- **AI hero photography/video**: no raster image-gen tool in this environment. You run prompts from `docs/asset-generation-prompts.md` through ChatGPT image / Sora.
- **LLC filing, EIN, bank, etc.**: identity verification required — genuinely yours.
- **Vercel/Namecheap/Render dashboard clicks**: no MCP integration for those (yet). Could be added with credentials via MCP server setup.

## How to add a new automation script

1. Create `server/src/tools/<your-script>.js`
2. Use ESM imports (the project is `"type": "module"`)
3. Default to dry-run for anything that writes outside the repo or calls external APIs
4. Add an entry to this doc + to `rebuild-all.js` if it should run as part of the standard rebuild
5. Log every action with clear emoji + timestamps
6. Exit with non-zero on errors
