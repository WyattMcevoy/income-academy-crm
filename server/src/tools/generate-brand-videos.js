#!/usr/bin/env node
// Generate hero videos for Income Academy landing pages using OpenAI Sora
//
// Usage:
//   1. Set your OpenAI API key:
//        export OPENAI_API_KEY=sk-...
//      (or add OPENAI_API_KEY=sk-... to server/.env)
//   2. Run:
//        node server/src/tools/generate-brand-videos.js
//   3. Check output in marketing/ai/video/ and marketing/affiliate/video/
//
// Cost: ~$0.15-0.25 per second of video at standard quality
// Each video: 10s @ 480p = ~$1.50-2.50 per video
//
// Generated videos:
//   marketing/ai/video/hero.mp4          (AI Side Income — woman at kitchen table, 10s)
//   marketing/affiliate/video/hero.mp4   (Affiliate Marketing — man at writing desk, 10s)
//
// These fill the <video controls> founder/intro sections on the landing pages.
// If Wyatt records himself later, replace these files.

import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '..', '..', '..');

// Auto-load from server/.env if OPENAI_API_KEY not already in environment
(function loadDotEnv() {
  if (process.env.OPENAI_API_KEY) return;
  const envPath = join(REPO_ROOT, 'server', '.env');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
  if (process.env.OPENAI_API_KEY) {
    console.log('✓ Loaded OPENAI_API_KEY from server/.env');
  }
})();

const DRY_RUN = process.argv.includes('--dry-run');
const ONLY = process.argv.find(a => a.startsWith('--only='))?.split('=')[1];
const POLL_INTERVAL_MS = 5000; // check job status every 5s
const MAX_WAIT_MS = 10 * 60 * 1000; // 10 min timeout per video

const API_KEY = process.env.OPENAI_API_KEY;

// ============================================================
// Video definitions
// ============================================================

const VIDEOS = [
  {
    id: 'ai-hero',
    label: 'AI Side Income — Hero video (woman at kitchen table)',
    outputPaths: [
      'marketing/ai/video/hero.mp4',
    ],
    model: 'sora',
    duration: 10,
    resolution: '1280x720',
    prompt: `Cinematic lifestyle video of a 62-year-old woman with warm grey-silver hair and a genuine smile, sitting at a clean light-wood kitchen table with a laptop open. Morning sunlight streams through a window to her left. A white ceramic coffee mug rests beside the laptop. She glances from the screen to the window with a quiet, satisfied expression — the look of someone who has just figured something out. She picks up her mug and takes a slow sip, then turns back to the laptop with slight intrigue. The kitchen is lived-in but tidy: a bowl of fruit softly blurred in the background. Warm color palette: cream, natural wood, soft morning gold. Shallow depth of field. No spoken words. No text overlays. Calm, unhurried pace. 16:9 horizontal. Photorealistic, not animated.`,
  },
  {
    id: 'affiliate-hero',
    label: 'Affiliate Marketing — Hero video (man at writing desk)',
    outputPaths: [
      'marketing/affiliate/video/hero.mp4',
    ],
    model: 'sora',
    duration: 10,
    resolution: '1280x720',
    prompt: `Cinematic lifestyle video of a 58-year-old man with salt-and-pepper hair, a trimmed beard, and reading glasses, sitting at a mid-century wooden writing desk in a home study. Afternoon light filters through a large window to his right. A closed leather notebook and fountain pen sit beside his laptop. He reads something on screen, then leans back slightly with a thoughtful half-smile — the look of someone who understands something others don't. He picks up the fountain pen, taps it lightly on the notebook, then sets it down and returns to the keyboard. Well-used bookshelf in background, warm reading lamp glowing softly. Color palette: warm navy, cream, aged wood, soft gold. Shallow depth of field. No spoken words. No text overlays. Measured, confident pace. 16:9 horizontal. Photorealistic, not animated.`,
  },
];

// ============================================================
// OpenAI Sora video generation (async job pattern)
// ============================================================

async function createVideoJob(video) {
  const response = await fetch('https://api.openai.com/v1/video/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: video.model,
      prompt: video.prompt,
      n: 1,
      duration: video.duration,
      resolution: video.resolution,
      response_format: 'url',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error (${response.status}): ${error.error?.message || JSON.stringify(error)}`);
  }

  const data = await response.json();
  // Sora returns a job/generation object; may be immediate or async
  return data;
}

async function pollForCompletion(jobId) {
  const deadline = Date.now() + MAX_WAIT_MS;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));

    const response = await fetch(`https://api.openai.com/v1/video/generations/${jobId}`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`Poll error (${response.status}): ${err.error?.message || JSON.stringify(err)}`);
    }

    const data = await response.json();
    const status = data.status;

    process.stdout.write(`\r   Status: ${status}...   `);

    if (status === 'succeeded' || status === 'completed') {
      process.stdout.write('\n');
      return data;
    }
    if (status === 'failed' || status === 'cancelled') {
      throw new Error(`Job ${status}: ${data.error?.message || 'no details'}`);
    }
  }
  throw new Error('Timed out waiting for video generation (10 min)');
}

async function downloadVideo(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

async function generateVideo(video) {
  console.log(`\n🎬 Generating: ${video.label}`);
  console.log(`   Model: ${video.model}, Duration: ${video.duration}s, Resolution: ${video.resolution}`);

  const jobData = await createVideoJob(video);

  let finalData = jobData;

  // If the API returned an async job ID, poll until done
  if (jobData.id && jobData.status && jobData.status !== 'succeeded' && jobData.status !== 'completed') {
    console.log(`   Job ID: ${jobData.id} — polling for completion...`);
    finalData = await pollForCompletion(jobData.id);
  }

  // Extract video URL — handle both direct and polled response shapes
  const videoUrl =
    finalData.data?.[0]?.url ||
    finalData.generations?.[0]?.url ||
    finalData.url;

  if (!videoUrl) {
    throw new Error(`No video URL in response: ${JSON.stringify(finalData).slice(0, 300)}`);
  }

  console.log(`   ✓ Rendered. Downloading...`);
  const buffer = await downloadVideo(videoUrl);

  for (const relPath of video.outputPaths) {
    const fullPath = join(REPO_ROOT, relPath);
    const dir = dirname(fullPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(fullPath, buffer);
    const mb = (buffer.length / 1024 / 1024).toFixed(1);
    console.log(`   ✓ Saved: ${relPath} (${mb} MB)`);
  }

  return { id: video.id, paths: video.outputPaths, size: buffer.length };
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('\n🎬 Income Academy — Sora Video Generator');
  console.log(`   Mode: ${DRY_RUN ? '🟡 DRY-RUN' : '🟢 LIVE'}`);
  console.log(`   Model: sora`);
  console.log(`   Estimated cost: ~$1.50-2.50 per 10s video\n`);

  if (!API_KEY && !DRY_RUN) {
    console.error('✗ OPENAI_API_KEY not set.');
    console.error('  Run: export OPENAI_API_KEY=sk-...');
    console.error('  Or add OPENAI_API_KEY=sk-... to server/.env');
    console.error('  Then retry.');
    process.exit(1);
  }

  const toGenerate = ONLY
    ? VIDEOS.filter(v => v.id.includes(ONLY))
    : VIDEOS;

  if (toGenerate.length === 0) {
    console.error(`No videos match --only=${ONLY}`);
    process.exit(1);
  }

  const results = [];

  for (const video of toGenerate) {
    if (DRY_RUN) {
      console.log(`\n[DRY-RUN] Would generate: ${video.label}`);
      console.log(`   Prompt: ${video.prompt.slice(0, 120)}...`);
      console.log(`   → ${video.outputPaths.join(', ')}`);
      continue;
    }

    try {
      const result = await generateVideo(video);
      results.push({ ...result, status: 'ok' });
      if (toGenerate.indexOf(video) < toGenerate.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (err) {
      console.error(`\n✗ Failed: ${video.label}`);
      console.error(`  ${err.message}`);
      results.push({ id: video.id, status: 'error', error: err.message });
    }
  }

  console.log('\n' + '━'.repeat(50));
  if (DRY_RUN) {
    console.log(`Would generate ${toGenerate.length} videos. Run without --dry-run to execute.`);
    console.log('\nOutputs:');
    toGenerate.forEach(v => console.log(`  → ${v.outputPaths[0]}`));
  } else {
    const ok = results.filter(r => r.status === 'ok');
    const failed = results.filter(r => r.status === 'error');
    console.log(`Generated: ${ok.length} videos  Failed: ${failed.length}`);
    if (ok.length > 0) {
      console.log('\n✅ Videos saved. Next steps:');
      console.log('   1. Open them in QuickTime to review');
      console.log('   2. If good: git add marketing/*/video/ && git commit -m "Add Sora hero videos"');
      console.log('   3. git push → Vercel auto-deploys → videos appear on landing pages');
    }
    if (failed.length > 0) {
      console.log('\nFailed videos:');
      failed.forEach(f => console.log(`  ✗ ${f.id}: ${f.error}`));
    }
  }
}

main().catch(err => {
  console.error('\n✗ Script failed:', err.message);
  process.exit(1);
});
