#!/usr/bin/env node
/**
 * One-shot demo readiness runner.
 *
 * Runs every step needed to wire the Foundation Pass demo:
 *   1. Convert SVG thumbs → PNG (1280×720)
 *   2. Fetch GHL course URLs + portal base → write ghl-config.js
 *   3. Upload thumbnails to GHL (API + UI fallback)
 *   4. Poll + download Video 1 from HeyGen if HEYGEN_VIDEO_ID set
 *   5. Run e2e smoke test
 *
 * Each step skips gracefully if its required env var is missing —
 * so partial runs are useful too.
 *
 * Usage:
 *   GHL_API_KEY=pit-xxx \
 *   HEYGEN_API_KEY=hg-xxx \
 *   HEYGEN_VIDEO_ID=be490f1bcc8e4f9cbd0f17d16dd2f561 \
 *     node server/src/tools/wire-demo.js
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../');

function run(label, scriptRel, { required = [], optional = false } = {}) {
  return new Promise((resolve) => {
    const missing = required.filter((k) => !process.env[k]);
    if (missing.length) {
      console.log(`\n— ${label} — SKIP (missing env: ${missing.join(', ')})`);
      return resolve({ ok: false, skipped: true });
    }
    console.log(`\n— ${label} —`);
    const scriptPath = path.join(REPO_ROOT, scriptRel);
    const child = spawn(process.execPath, [scriptPath], { stdio: 'inherit', env: process.env });
    child.on('exit', (code) => {
      const ok = code === 0;
      if (!ok && !optional) console.log(`  ✗ ${label} failed (exit ${code})`);
      resolve({ ok, code });
    });
  });
}

(async () => {
  console.log('═══ Income Academy — Demo wiring ═══');

  await run('1. SVG → PNG (course thumbnails)',
    'server/src/tools/svg-to-png-playwright.js');

  await run('2. Fetch GHL config (course URLs + portal base)',
    'server/src/tools/fetch-ghl-config.js',
    { required: ['GHL_API_KEY'] });

  await run('3. Upload course thumbnails to GHL',
    'server/src/tools/upload-ghl-thumbnails.js',
    { required: ['GHL_API_KEY'], optional: true });

  if (process.env.HEYGEN_VIDEO_ID) {
    await new Promise((resolve) => {
      console.log(`\n— 4. Poll + download HeyGen video ${process.env.HEYGEN_VIDEO_ID} —`);
      const child = spawn(process.execPath, [
        path.join(REPO_ROOT, 'server/src/tools/heygen-fetch-video.js'),
        process.env.HEYGEN_VIDEO_ID,
      ], { stdio: 'inherit', env: process.env });
      child.on('exit', () => resolve());
    });
  } else {
    console.log('\n— 4. HeyGen video — SKIP (HEYGEN_VIDEO_ID not set)');
  }

  await run('5. E2E smoke test',
    'server/src/tools/e2e-smoke-test.js');

  console.log('\n═══ Done ═══');
})();
