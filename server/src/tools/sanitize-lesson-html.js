#!/usr/bin/env node
/**
 * Sanitizes lesson markdown → clean, ASCII-safe HTML for GHL paste.
 *
 * Why: GHL's lesson editor pipeline mangles UTF-8 special characters
 * (em-dashes, smart quotes, checkmarks) into Mac Roman gibberish like
 * ",Äî" and ",ÄúÖ". Sanitizing to pure ASCII fixes the rendering.
 *
 * Usage:
 *   node server/src/tools/sanitize-lesson-html.js <markdown-file>
 *   → outputs sanitized HTML to /tmp/<basename>.html and to stdout
 */

import fs from 'node:fs';
import path from 'node:path';
import { marked } from 'marked';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node sanitize-lesson-html.js <markdown-file>');
  process.exit(1);
}

const md = fs.readFileSync(inputPath, 'utf8');

// ── Pre-process markdown: replace problematic Unicode with ASCII ────────────
const sanitized = md
  // Em-dash and en-dash → " -- " or " - "
  .replace(/—/g, ' -- ')
  .replace(/–/g, '-')
  // Smart quotes → straight quotes
  .replace(/[“”]/g, '"')
  .replace(/[‘’]/g, "'")
  // Ellipsis → three dots
  .replace(/…/g, '...')
  // Checkmark / cross emojis → text equivalents
  .replace(/✅/g, '[x]')
  .replace(/❌/g, '[ ]')
  .replace(/⚠️/g, '!')
  .replace(/🎉/g, '')
  // Other common emojis we accidentally include → strip
  .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
  // Any leftover non-ASCII → strip (last resort)
  .replace(/[^\x00-\x7F]/g, '');

// Convert to HTML
let html = marked.parse(sanitized);

// ── Post-process HTML: tidy up for nicer rendering ──────────────────────────
html = html
  // Remove `<hr>` tags right before headings (the heading IS the divider)
  .replace(/<hr>\s*(<h[1-6])/g, '$1')
  // Use double <br> to space out lists from following paragraphs
  .replace(/(<\/[ou]l>)\s*(<p>)/g, '$1<br>$2');

// Output
const basename = path.basename(inputPath, '.md');
const outPath = `/tmp/${basename}.html`;
fs.writeFileSync(outPath, html, 'utf8');

console.log(`Wrote ${outPath} (${html.length} chars, ${sanitized.length} chars source)`);
console.log('---');
console.log(html.slice(0, 600));
