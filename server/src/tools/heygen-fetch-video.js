#!/usr/bin/env node
/**
 * Polls a HeyGen video by ID and downloads it once it's ready.
 *
 * Usage:
 *   HEYGEN_API_KEY=xxx node server/src/tools/heygen-fetch-video.js <videoId> [--out path/to/file.mp4]
 *   HEYGEN_API_KEY=xxx node server/src/tools/heygen-fetch-video.js be490f1bcc8e4f9cbd0f17d16dd2f561
 *
 * Default output: marketing/videos/heygen/<videoId>.mp4
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pipeline } from 'node:stream/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../');
const DEFAULT_OUT_DIR = path.join(REPO_ROOT, 'marketing/videos/heygen');

const API_KEY = process.env.HEYGEN_API_KEY;
if (!API_KEY) {
  console.error('✗ HEYGEN_API_KEY not set.');
  process.exit(1);
}

const args = process.argv.slice(2);
const videoId = args[0];
if (!videoId) {
  console.error('Usage: heygen-fetch-video.js <videoId> [--out path]');
  process.exit(1);
}
const outIdx = args.indexOf('--out');
const customOut = outIdx >= 0 ? args[outIdx + 1] : null;

const STATUS_URL = `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`;

async function checkStatus() {
  const r = await fetch(STATUS_URL, {
    headers: { 'X-Api-Key': API_KEY, Accept: 'application/json' },
  });
  if (!r.ok) {
    return { ok: false, status: r.status, body: await r.text() };
  }
  return { ok: true, data: await r.json() };
}

async function download(url, outPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const file = fs.createWriteStream(outPath);
  await pipeline(res.body, file);
}

(async () => {
  const outPath = customOut || path.join(DEFAULT_OUT_DIR, `${videoId}.mp4`);
  const POLL_INTERVAL_MS = 15_000;
  const MAX_TRIES = 80; // ~20 min ceiling

  console.log(`→ Polling video ${videoId}`);
  console.log(`  Output: ${path.relative(REPO_ROOT, outPath)}\n`);

  for (let i = 0; i < MAX_TRIES; i++) {
    const { ok, data, status, body } = await checkStatus();
    if (!ok) {
      console.error(`  status check ${i + 1}: HTTP ${status} — ${body.slice(0, 120)}`);
      if (status === 401 || status === 403) process.exit(2);
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      continue;
    }
    const d = data.data || data;
    const s = d.status;
    console.log(`  [${i + 1}] status: ${s}`);
    if (s === 'completed' || s === 'COMPLETED') {
      const url = d.video_url || d.video_url_caption || d.url;
      if (!url) {
        console.error('  ✗ Completed but no video_url returned:', JSON.stringify(d, null, 2));
        process.exit(3);
      }
      console.log(`\n→ Downloading ${url}`);
      await download(url, outPath);
      console.log(`✓ Saved to ${path.relative(REPO_ROOT, outPath)}`);
      process.exit(0);
    }
    if (s === 'failed' || s === 'FAILED') {
      console.error('✗ HeyGen reports failed:', d.error || d.error_message || 'unknown');
      process.exit(4);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  console.error('✗ Timed out after 20 min — try again later or check HeyGen dashboard.');
  process.exit(5);
})();
