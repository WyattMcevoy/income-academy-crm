#!/usr/bin/env node
// Generate hero images for Income Academy landing pages using OpenAI GPT-Image-1 / DALL-E 3
//
// Usage:
//   1. Set your OpenAI API key:
//        export OPENAI_API_KEY=sk-...
//   2. Run:
//        node server/src/tools/generate-brand-images.js
//   3. Check output in marketing/ai/img/ and marketing/affiliate/img/
//
// Cost: ~$0.04-0.12 per image at standard quality. Full set (~4 images) ≈ $0.25-0.50
//
// Generated images:
//   marketing/ai/img/hero.jpg          (AI Side Income hero — 62yo woman at kitchen table)
//   marketing/affiliate/img/hero.jpg   (Affiliate Marketing hero — 58yo man at writing desk)
//   marketing/brand/hero/ai-hero.jpg   (master copy)
//   marketing/brand/hero/affiliate-hero.jpg (master copy)

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

const API_KEY = process.env.OPENAI_API_KEY;

// ============================================================
// Image definitions
// ============================================================

const IMAGES = [
  {
    id: 'ai-hero',
    label: 'AI Side Income — Hero (woman at kitchen table)',
    outputPaths: [
      'marketing/ai/img/hero.jpg',
      'marketing/brand/hero/ai-hero.jpg',
    ],
    size: '1792x1024',
    quality: 'hd',
    prompt: `Photorealistic lifestyle portrait of a 62-year-old woman with a warm genuine smile, sitting at a clean light-wood kitchen table with a MacBook or laptop open in front of her. Morning sunlight pours in from a window at her left, casting soft warm shadows. A white ceramic coffee mug rests beside the laptop. She is curious and engaged, looking slightly down at the screen, not posed. Cream-colored shirt, no visible branding. Kitchen is uncluttered but lived-in — a bowl of fruit in soft focus background. She has natural grey-silver hair, slight laugh lines, honest eyes. Shot at 35mm, shallow depth of field. Warm color palette: soft whites, natural wood tones, a hint of warm navy from her shirt trim. Composition: horizontal 16:9, subject slightly left of center, negative space to the right. No text overlays. No watermarks. Photorealistic, not illustrated.`,
  },
  {
    id: 'affiliate-hero',
    label: 'Affiliate Marketing — Hero (man at writing desk)',
    outputPaths: [
      'marketing/affiliate/img/hero.jpg',
      'marketing/brand/hero/affiliate-hero.jpg',
    ],
    size: '1792x1024',
    quality: 'hd',
    prompt: `Photorealistic lifestyle portrait of a 58-year-old man with reading glasses, sitting at a mid-century wooden writing desk in a home study. Large window to his right with afternoon light filtering through. A closed leather notebook and a fountain pen sit beside his laptop. He wears a casual navy button-up shirt. His expression: thoughtful, mid-thought while reading something on the screen. Behind him, a well-used bookshelf with vintage books, a reading lamp with warm bulb. Salt-and-pepper hair, trimmed beard, glasses slightly slipped down his nose. Wooden textures dominate: the desk, the bookshelf, parquet floor suggestion. Color palette: warm navies, cream, soft golds from the lamp. Composition: horizontal 16:9, subject slightly right of center, negative space to the left where the window is. Shot at 50mm, shallow depth of field. No text overlays. Photorealistic, not illustrated.`,
  },
  {
    id: 'estate-sale-hero',
    label: 'Estate Sale Sourcing — Hero (person at estate sale)',
    outputPaths: [
      'marketing/brand/hero/estate-sale-hero.jpg',
    ],
    size: '1792x1024',
    quality: 'standard',
    prompt: `Photorealistic lifestyle photo of a 60-year-old person browsing items at a well-organized estate sale in a suburban home. Morning light through large windows. Tables covered with vintage items — dishes, tools, collectibles. The person is examining a vintage item with interest and a slight smile, wearing casual weekend clothes. Natural, unhurried mood. Warm morning light. No text overlays. Horizontal 16:9 composition. Photorealistic.`,
  },
  {
    id: 'bookkeeping-hero',
    label: 'Bookkeeping — Hero (person reviewing reports)',
    outputPaths: [
      'marketing/brand/hero/bookkeeping-hero.jpg',
    ],
    size: '1792x1024',
    quality: 'standard',
    prompt: `Photorealistic lifestyle portrait of a 58-year-old woman in a tidy home office, reviewing financial reports on a laptop screen and a printed document beside it. Reading glasses on, expression calm and confident. A cup of tea nearby. Clean desk with a small plant. Natural window light from the side. Professional but relaxed — this is someone working part-time from home, not in a corporate office. Color palette: warm neutrals, soft light. Horizontal 16:9 composition. No text overlays. Photorealistic.`,
  },
];

// ============================================================
// OpenAI image generation
// ============================================================

async function generateImage(image) {
  console.log(`\n🎨 Generating: ${image.label}`);
  console.log(`   Model: dall-e-3, Size: ${image.size}, Quality: ${image.quality}`);

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: image.prompt,
      n: 1,
      size: image.size,
      quality: image.quality,
      response_format: 'url',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || JSON.stringify(error)}`);
  }

  const data = await response.json();
  const imageUrl = data.data[0].url;
  const revisedPrompt = data.data[0].revised_prompt;

  console.log(`   ✓ Generated. Downloading...`);
  if (revisedPrompt && revisedPrompt !== image.prompt) {
    console.log(`   Note: OpenAI revised prompt slightly (normal).`);
  }

  // Download the image
  const imgResponse = await fetch(imageUrl);
  if (!imgResponse.ok) throw new Error(`Failed to download image: ${imgResponse.status}`);
  const buffer = Buffer.from(await imgResponse.arrayBuffer());

  // Save to all output paths
  for (const relPath of image.outputPaths) {
    const fullPath = join(REPO_ROOT, relPath);
    const dir = dirname(fullPath);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    writeFileSync(fullPath, buffer);
    console.log(`   ✓ Saved: ${relPath}`);
  }

  return { id: image.id, paths: image.outputPaths, size: buffer.length };
}

// ============================================================
// Main
// ============================================================

async function main() {
  console.log('\n🖼  Income Academy — AI Image Generator');
  console.log(`   Mode: ${DRY_RUN ? '🟡 DRY-RUN' : '🟢 LIVE'}`);
  console.log(`   Model: dall-e-3`);
  console.log(`   Estimated cost: ~$0.25-0.50 for full set\n`);

  if (!API_KEY && !DRY_RUN) {
    console.error('✗ OPENAI_API_KEY not set.');
    console.error('  Run: export OPENAI_API_KEY=sk-...');
    console.error('  Then retry.');
    process.exit(1);
  }

  const toGenerate = ONLY
    ? IMAGES.filter(img => img.id.includes(ONLY))
    : IMAGES;

  if (toGenerate.length === 0) {
    console.error(`No images match --only=${ONLY}`);
    process.exit(1);
  }

  const results = [];

  for (const image of toGenerate) {
    if (DRY_RUN) {
      console.log(`\n[DRY-RUN] Would generate: ${image.label}`);
      console.log(`   → ${image.outputPaths.join(', ')}`);
      continue;
    }

    try {
      const result = await generateImage(image);
      results.push({ ...result, status: 'ok' });
      // Small delay between requests
      if (toGenerate.indexOf(image) < toGenerate.length - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    } catch (err) {
      console.error(`\n✗ Failed: ${image.label}`);
      console.error(`  ${err.message}`);
      results.push({ id: image.id, status: 'error', error: err.message });
    }
  }

  console.log('\n━'.repeat(50));
  if (DRY_RUN) {
    console.log(`Would generate ${toGenerate.length} images. Run without --dry-run to execute.`);
  } else {
    const ok = results.filter(r => r.status === 'ok');
    const failed = results.filter(r => r.status === 'error');
    console.log(`Generated: ${ok.length} images  Failed: ${failed.length}`);
    if (ok.length > 0) {
      console.log('\n✅ Images saved. Next steps:');
      console.log('   1. Review images in marketing/ai/img/ and marketing/affiliate/img/');
      console.log('   2. If good: commit with git add marketing/*/img/ marketing/brand/hero/');
      console.log('   3. Vercel auto-deploys → hero images appear on live landing pages');
    }
    if (failed.length > 0) {
      console.log('\nFailed images:');
      failed.forEach(f => console.log(`  ✗ ${f.id}: ${f.error}`));
    }
  }
}

main().catch(err => {
  console.error('\n✗ Script failed:', err.message);
  process.exit(1);
});
