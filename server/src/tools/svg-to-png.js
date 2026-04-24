#!/usr/bin/env node
// Batch-convert SVG brand assets to PNG at recommended sizes.
// Uses Puppeteer (headless Chrome) for pixel-perfect rendering — same
// engine browsers use, so output matches preview exactly.
//
// Usage:
//   1. Install the dev dep (one-time):
//        cd server && npm install --save-dev puppeteer
//   2. Run:
//        node server/src/tools/svg-to-png.js
//
// Reads:   marketing/brand/**/*.svg
// Writes:  marketing/brand/png-exports/<same-relative-path>.png
//
// Sizing rules defined in SIZE_OVERRIDES below. Defaults to the SVG's
// natural viewBox size.

import { readFileSync, readdirSync, statSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname, basename, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '..', '..', '..');
const BRAND_DIR = join(REPO_ROOT, 'marketing', 'brand');
const OUTPUT_DIR = join(BRAND_DIR, 'png-exports');

// Size overrides per file. Format: 'path/relative/to/marketing/brand': [width, height]
// Leave undefined to use the SVG's natural viewBox.
const SIZE_OVERRIDES = {
  // Logos — multiple sizes for each
  'logos/ia-mark-color.svg': [
    { width: 32, height: 32, suffix: '-32' },
    { width: 180, height: 180, suffix: '-180' },
    { width: 512, height: 512, suffix: '-512' },
  ],
  'logos/ia-horizontal-color.svg': [
    { width: 600, height: 147, suffix: '-600' },
    { width: 1200, height: 293, suffix: '-1200' },
  ],
  // Course thumbs are fine at natural 1280x720
  // OG images fine at natural 1200x630
  // Email assets
  'emails/email-banner-600.svg': [{ width: 600, height: 200, suffix: '' }],
  'emails/email-footer-200.svg': [{ width: 200, height: 80, suffix: '' }],
};

function findSvgFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      // Skip png-exports itself
      if (entry === 'png-exports') continue;
      out.push(...findSvgFiles(full));
    } else if (entry.endsWith('.svg')) {
      out.push(full);
    }
  }
  return out;
}

function parseViewBox(svgContent) {
  const match = svgContent.match(/viewBox=["']([\d\s.-]+)["']/);
  if (!match) return null;
  const [x, y, w, h] = match[1].trim().split(/\s+/).map(Number);
  return { x, y, width: w, height: h };
}

async function convertSvg(page, svgPath, outputPath, width, height) {
  const svgContent = readFileSync(svgPath, 'utf8');
  const html = `<!DOCTYPE html>
<html>
<head>
<style>
  html, body { margin: 0; padding: 0; background: transparent; }
  svg { display: block; width: ${width}px; height: ${height}px; }
</style>
</head>
<body>${svgContent}</body>
</html>`;

  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.setContent(html, { waitUntil: 'domcontentloaded' });

  // Ensure directory exists
  const outDir = dirname(outputPath);
  if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

  await page.screenshot({ path: outputPath, type: 'png', omitBackground: true, fullPage: false, clip: { x: 0, y: 0, width, height } });
}

async function main() {
  console.log('🖼  SVG → PNG batch export');
  console.log('   Source:', BRAND_DIR);
  console.log('   Output:', OUTPUT_DIR);
  console.log();

  // Lazy import puppeteer so users who haven't installed it get a clear error
  let puppeteer;
  try {
    puppeteer = (await import('puppeteer')).default;
  } catch (err) {
    console.error('✗ Puppeteer is not installed.');
    console.error('');
    console.error('  Install it once (dev dependency only):');
    console.error('  cd server && npm install --save-dev puppeteer');
    console.error('');
    process.exit(1);
  }

  const svgs = findSvgFiles(BRAND_DIR);
  console.log(`Found ${svgs.length} SVG files\n`);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  let totalGenerated = 0;
  for (const svgPath of svgs) {
    const relPath = relative(BRAND_DIR, svgPath);
    const overrides = SIZE_OVERRIDES[relPath];

    const base = basename(relPath, '.svg');
    const dirRel = dirname(relPath);

    if (overrides) {
      for (const { width, height, suffix } of overrides) {
        const outPath = join(OUTPUT_DIR, dirRel, `${base}${suffix}.png`);
        await convertSvg(page, svgPath, outPath, width, height);
        console.log(`✓ ${relPath} → ${relative(REPO_ROOT, outPath)} (${width}×${height})`);
        totalGenerated++;
      }
    } else {
      // Use natural viewBox
      const svg = readFileSync(svgPath, 'utf8');
      const vb = parseViewBox(svg);
      const width = vb ? Math.round(vb.width) : 1200;
      const height = vb ? Math.round(vb.height) : 630;
      const outPath = join(OUTPUT_DIR, dirRel, `${base}.png`);
      await convertSvg(page, svgPath, outPath, width, height);
      console.log(`✓ ${relPath} → ${relative(REPO_ROOT, outPath)} (${width}×${height})`);
      totalGenerated++;
    }
  }

  await browser.close();

  console.log();
  console.log(`🎉 Generated ${totalGenerated} PNG files in ${relative(REPO_ROOT, OUTPUT_DIR)}/`);
  console.log();
  console.log('Upload to:');
  console.log('  - GHL Business Profile (logos)');
  console.log('  - GHL Memberships (course thumbnails)');
  console.log('  - Main site /marketing/ (favicon-32.png, apple-touch-icon.png)');
  console.log('  - Social share meta tags (og:image)');
  console.log('  - MailerLite / GHL email templates (banners)');
}

main().catch(err => {
  console.error('\n✗ Export failed:', err.message);
  console.error(err);
  process.exit(1);
});
