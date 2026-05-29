#!/usr/bin/env node
/**
 * Downloads any queued HeyGen videos from the manifest that haven't been
 * downloaded yet. Run this after generate-all-heygen-videos.js to pull
 * completed renders.
 *
 * Usage:
 *   node server/src/tools/download-all-heygen-videos.js
 *   node server/src/tools/download-all-heygen-videos.js --force  # re-download even if exists
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../');
const OUT_DIR = path.join(REPO_ROOT, 'marketing/videos/heygen');
const MANIFEST = path.join(OUT_DIR, 'manifest.json');

// Auto-load .env
(function loadDotEnv() {
  if (process.env.HEYGEN_API_KEY) return;
  const envPath = path.join(REPO_ROOT, 'server', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    const v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[k]) process.env[k] = v;
  }
})();

const API_KEY = process.env.HEYGEN_API_KEY;
const FORCE = process.argv.includes('--force');

if (!API_KEY) {
  console.error('✗ HEYGEN_API_KEY not set.');
  process.exit(1);
}

if (!fs.existsSync(MANIFEST)) {
  console.error(`✗ No manifest found at ${MANIFEST}`);
  console.error('  Run generate-all-heygen-videos.js first.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));

async function checkStatus(videoId) {
  const r = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
    headers: { 'X-Api-Key': API_KEY },
  });
  return await r.json();
}

async function download(url, outPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed: ${res.status}`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outPath, buf);
  return buf.length;
}

async function main() {
  console.log('\n⬇️  HeyGen Video Downloader\n');

  const entries = Object.entries(manifest);
  const pending = entries.filter(([, v]) => {
    if (!v.videoId) return false;
    if (v.status === 'completed' && !FORCE && v.localPath && fs.existsSync(v.localPath)) return false;
    return true;
  });

  if (pending.length === 0) {
    console.log('Nothing to download. All videos already completed or no manifest entries found.');
    return;
  }

  console.log(`Checking ${pending.length} videos...\n`);
  let downloaded = 0, still_rendering = 0, failed = 0;

  for (const [moduleId, entry] of pending) {
    const { videoId, title, localPath } = entry;
    process.stdout.write(`[${moduleId}] ${title || videoId}...`);

    try {
      const data = await checkStatus(videoId);
      const d = data.data || data;
      const status = (d.status || '').toLowerCase();

      if (status === 'completed') {
        const outPath = localPath || path.join(OUT_DIR, `${videoId}.mp4`);
        if (!FORCE && fs.existsSync(outPath)) {
          console.log(` already exists — skipping`);
          manifest[moduleId].status = 'completed';
        } else {
          const size = await download(d.video_url, outPath);
          manifest[moduleId].status = 'completed';
          manifest[moduleId].downloadedAt = new Date().toISOString();
          manifest[moduleId].sizeBytes = size;
          manifest[moduleId].localPath = outPath;
          console.log(` ✓ downloaded (${(size / 1024 / 1024).toFixed(1)} MB)`);
          downloaded++;
        }
      } else if (status === 'processing' || status === 'pending' || status === 'waiting') {
        console.log(` ⏳ still rendering (${status})`);
        still_rendering++;
      } else if (status === 'failed') {
        console.log(` ✗ failed: ${d.error || 'unknown'}`);
        manifest[moduleId].status = 'failed';
        failed++;
      } else {
        console.log(` ? unknown status: ${status}`);
        still_rendering++;
      }
    } catch (err) {
      console.log(` ✗ error: ${err.message}`);
      failed++;
    }

    // Save manifest after each video
    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

    await new Promise(r => setTimeout(r, 500)); // gentle rate limiting
  }

  console.log('\n' + '━'.repeat(60));
  console.log(`Downloaded: ${downloaded}  Still rendering: ${still_rendering}  Failed: ${failed}`);
  if (still_rendering > 0) {
    console.log('\nSome videos are still rendering. Run this script again in a few minutes.');
  }
  if (downloaded > 0) {
    console.log(`\nDownloaded to: marketing/videos/heygen/`);
    console.log('Next step: upload to GHL course modules via the GHL portal UI.');
  }
}

main().catch(err => {
  console.error('✗ Crashed:', err.message);
  process.exit(1);
});
