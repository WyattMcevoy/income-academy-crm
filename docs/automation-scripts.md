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
