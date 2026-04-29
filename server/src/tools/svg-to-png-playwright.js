#!/usr/bin/env node
/**
 * Convert course-thumb SVGs to 1280×720 PNGs using Playwright (already installed).
 *
 * Reads:  marketing/brand/course-thumbs/*.svg
 * Writes: marketing/brand/png-exports/course-thumbs/*.png
 *
 * Usage: node server/src/tools/svg-to-png-playwright.js
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../');
const SRC_DIR = path.join(REPO_ROOT, 'marketing/brand/course-thumbs');
const OUT_DIR = path.join(REPO_ROOT, 'marketing/brand/png-exports/course-thumbs');

const SIZE = { width: 1280, height: 720 };

(async () => {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const svgs = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith('.svg'));
  if (!svgs.length) {
    console.error('No SVGs found in', SRC_DIR);
    process.exit(1);
  }

  console.log(`→ Converting ${svgs.length} SVG → PNG (${SIZE.width}×${SIZE.height})`);
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: SIZE, deviceScaleFactor: 1 });

  for (const file of svgs) {
    const svg = fs.readFileSync(path.join(SRC_DIR, file), 'utf8');
    const outPath = path.join(OUT_DIR, file.replace(/\.svg$/, '.png'));

    const html = `<!doctype html><html><head><style>
      html,body{margin:0;padding:0;background:#0f172a;width:${SIZE.width}px;height:${SIZE.height}px;overflow:hidden}
      svg{width:${SIZE.width}px;height:${SIZE.height}px;display:block}
    </style></head><body>${svg}</body></html>`;

    const page = await context.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.screenshot({ path: outPath, type: 'png', omitBackground: false, clip: { x: 0, y: 0, ...SIZE } });
    await page.close();
    console.log(`  ✓ ${file} → ${path.relative(REPO_ROOT, outPath)}`);
  }

  await context.close();
  await browser.close();
  console.log('\n✓ Done. PNGs ready for GHL upload at:', path.relative(REPO_ROOT, OUT_DIR));
})();
