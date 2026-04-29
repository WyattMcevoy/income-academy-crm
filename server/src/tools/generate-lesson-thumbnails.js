#!/usr/bin/env node
/**
 * Generates 40 branded gradient PNG thumbnails:
 *   • 4 course hero banners (1920×600)
 *   • 36 lesson/module thumbnails (1280×720)
 *
 * Each is unique: course-specific gradient + per-module gradient angle shift +
 * module number badge + module title text. Visually consistent (same brand
 * vocabulary) but each is distinguishable from the others.
 *
 * Output: marketing/brand/png-exports/lesson-thumbs/{course}/{module-slug}.png
 *         marketing/brand/png-exports/course-heroes/{course}-hero.png
 *
 * Usage: node server/src/tools/generate-lesson-thumbnails.js
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../');
const OUT_LESSON = path.join(REPO_ROOT, 'marketing/brand/png-exports/lesson-thumbs');
const OUT_HERO = path.join(REPO_ROOT, 'marketing/brand/png-exports/course-heroes');

// ── Course metadata: brand-aligned palette + 9 modules each ─────────────────
const COURSES = [
  {
    slug: 'ai-side-income',
    title: 'AI Side Income Starter Kit',
    abbr: 'AI',
    badge: 'COURSE 1',
    accent: '#1e40af',   // deep blue
    accentLight: '#3b82f6',
    modules: [
      { n: 0, title: 'Welcome + Setup', icon: '👋' },
      { n: 1, title: 'Your AI Assistants, Explained', icon: '🤖' },
      { n: 2, title: 'Talking to AI: The Skill That Makes Everything Work', icon: '💬' },
      { n: 3, title: 'Five AI-Ready Side Hustles That Work', icon: '🚀' },
      { n: 4, title: 'Landing Your First 3 Clients', icon: '🤝' },
      { n: 5, title: 'Doing the Work With AI', icon: '⚙️' },
      { n: 6, title: 'Pricing Your Time', icon: '💰' },
      { n: 7, title: 'Boundaries, Scheduling, and Not Burning Out', icon: '🛡️' },
      { n: 8, title: 'Your 90-Day Plan', icon: '📅' },
    ],
  },
  {
    slug: 'affiliate-marketing',
    title: 'Honest Affiliate Marketing Starter',
    abbr: 'AM',
    badge: 'COURSE 2',
    accent: '#065f46',   // emerald
    accentLight: '#10b981',
    modules: [
      { n: 0, title: 'Welcome + Reality Check', icon: '👋' },
      { n: 1, title: 'How Affiliate Marketing Actually Works', icon: '🔗' },
      { n: 2, title: 'The 3 Honest Paths', icon: '🛤️' },
      { n: 3, title: 'Picking a Niche You Can Live With', icon: '🎯' },
      { n: 4, title: 'Your First Affiliate Partner (Amazon)', icon: '📦' },
      { n: 5, title: 'Beyond Amazon — Higher-Commission Programs', icon: '💎' },
      { n: 6, title: 'Creating Content That Actually Helps', icon: '✍️' },
      { n: 7, title: 'Getting Traffic the Slow-and-Steady Way', icon: '📈' },
      { n: 8, title: 'Measuring, Compliance, and Scaling', icon: '⚖️' },
    ],
  },
  {
    slug: 'estate-sale-sourcing',
    title: 'Estate Sale & Garage Sale Sourcing Academy',
    abbr: 'ES',
    badge: 'COURSE 3',
    accent: '#7c2d12',   // amber-brown
    accentLight: '#ea580c',
    modules: [
      { n: 0, title: 'Welcome + Reality Check', icon: '👋' },
      { n: 1, title: 'How the Estate Sale Ecosystem Works', icon: '🏠' },
      { n: 2, title: 'Finding Sales Near You', icon: '🗺️' },
      { n: 3, title: 'What to Look For: The 7 Categories', icon: '🔍' },
      { n: 4, title: 'Pricing, Negotiation, and the Exit Rule', icon: '💵' },
      { n: 5, title: 'From Sale to Profit Pipeline', icon: '📦' },
      { n: 6, title: 'Scaling to eBay Done-With-You', icon: '🚀' },
      { n: 7, title: 'Taxes, Tracking, and Not Becoming a Hoarder', icon: '📊' },
      { n: 8, title: 'Your 90-Day Plan', icon: '📅' },
    ],
  },
  {
    slug: 'bookkeeping-from-home',
    title: 'Bookkeeping From Home for Over-55s',
    abbr: 'BK',
    badge: 'COURSE 4',
    accent: '#581c87',   // deep purple
    accentLight: '#a855f7',
    modules: [
      { n: 0, title: 'Welcome + Reality Check', icon: '👋' },
      { n: 1, title: 'Bookkeeping vs. Accounting vs. Tax Prep', icon: '📚' },
      { n: 2, title: 'Your Software Stack (QBO, Xero, FreshBooks)', icon: '💻' },
      { n: 3, title: 'The 5 Services You Can Offer', icon: '🎯' },
      { n: 4, title: 'Landing Your First 3 Clients', icon: '🤝' },
      { n: 5, title: 'Pricing That Doesn\'t Burn You Out', icon: '💰' },
      { n: 6, title: 'Engagement Letters + Legal Boundaries', icon: '📜' },
      { n: 7, title: 'Running It Efficiently With AI', icon: '🤖' },
      { n: 8, title: 'Your 90-Day Plan', icon: '📅' },
    ],
  },
];

const NAVY = '#0f172a';
const GOLD = '#f59e0b';
const WHITE = '#ffffff';
const SLATE = '#94a3b8';

// ── SVG generators ──────────────────────────────────────────────────────────

function buildLessonSVG(course, mod) {
  // Per-module gradient angle shift (so each is visually different)
  const angle = (mod.n * 12) % 360;
  // Per-module radial shimmer position shift
  const shimmerX = 20 + (mod.n * 8) % 70;
  const shimmerY = 15 + (mod.n * 6) % 60;
  // Per-module accent rotation between two course-aligned tones
  const ribbonColor = mod.n % 2 === 0 ? GOLD : course.accentLight;

  return `<svg viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" gradientTransform="rotate(${angle})">
        <stop offset="0%" stop-color="${NAVY}"/>
        <stop offset="100%" stop-color="${course.accent}"/>
      </linearGradient>
      <radialGradient id="s" cx="${shimmerX}%" cy="${shimmerY}%" r="55%">
        <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1280" height="720" fill="url(#g)"/>
    <rect width="1280" height="720" fill="url(#s)"/>

    <!-- Module number badge (top-left corner, large) -->
    <circle cx="120" cy="120" r="78" fill="${ribbonColor}" opacity="0.9"/>
    <text x="120" y="148" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" font-weight="900" font-size="80" fill="${NAVY}" text-anchor="middle">${mod.n}</text>

    <!-- Course abbreviation (top-right) -->
    <text x="1220" y="100" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" font-weight="900" font-size="64" fill="${GOLD}" text-anchor="end" letter-spacing="-2">${course.abbr}</text>
    <text x="1220" y="135" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" font-weight="700" font-size="16" fill="${SLATE}" text-anchor="end" letter-spacing="3">${course.badge}</text>

    <!-- Module title (centered, mid-bottom) -->
    ${wrapText(mod.title, 24).map((line, i) =>
      `<text x="640" y="${380 + i * 60}" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" font-weight="800" font-size="50" fill="${WHITE}" text-anchor="middle">${escapeXml(line)}</text>`
    ).join('')}

    <!-- Bottom strip: module number context -->
    <rect x="0" y="650" width="1280" height="70" fill="${NAVY}" opacity="0.6"/>
    <text x="60" y="695" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" font-weight="700" font-size="20" fill="${GOLD}" letter-spacing="3">MODULE ${String(mod.n).padStart(2, '0')}</text>
    <text x="1220" y="695" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" font-weight="500" font-size="18" fill="${WHITE}" text-anchor="end" letter-spacing="2">INCOME ACADEMY</text>
  </svg>`;
}

function buildHeroSVG(course) {
  return `<svg viewBox="0 0 1920 600" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${NAVY}"/>
        <stop offset="60%" stop-color="${course.accent}"/>
        <stop offset="100%" stop-color="${NAVY}"/>
      </linearGradient>
      <radialGradient id="s" cx="50%" cy="50%" r="60%">
        <stop offset="0%" stop-color="${GOLD}" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="${GOLD}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1920" height="600" fill="url(#g)"/>
    <rect width="1920" height="600" fill="url(#s)"/>

    <text x="960" y="280" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" font-weight="900" font-size="220" fill="${GOLD}" text-anchor="middle" letter-spacing="-8">${course.abbr}</text>
    <text x="960" y="380" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" font-weight="800" font-size="56" fill="${WHITE}" text-anchor="middle">${escapeXml(course.title)}</text>
    <text x="960" y="430" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" font-weight="500" font-size="22" fill="${SLATE}" text-anchor="middle" letter-spacing="6">${course.badge} · INCOME ACADEMY FOUNDATION PASS</text>

    <!-- Decorative gold rule -->
    <rect x="860" y="455" width="200" height="6" rx="3" fill="${GOLD}"/>
  </svg>`;
}

function escapeXml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function wrapText(text, maxChars) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const w of words) {
    if ((current + ' ' + w).trim().length > maxChars && current) {
      lines.push(current.trim());
      current = w;
    } else {
      current = (current + ' ' + w).trim();
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3); // hard cap 3 lines
}

function moduleSlug(course, mod) {
  const titleSlug = mod.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
  return `mod${String(mod.n).padStart(2, '0')}-${titleSlug}`;
}

// ── Render via Playwright ───────────────────────────────────────────────────

async function renderSVGToPNG(page, svg, width, height, outPath) {
  const html = `<!doctype html><html><head><style>html,body{margin:0;padding:0;background:#0f172a;width:${width}px;height:${height}px;overflow:hidden}svg{width:${width}px;height:${height}px;display:block}</style></head><body>${svg}</body></html>`;
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({ path: outPath, type: 'png', clip: { x: 0, y: 0, width, height }, omitBackground: false });
}

(async () => {
  fs.mkdirSync(OUT_LESSON, { recursive: true });
  fs.mkdirSync(OUT_HERO, { recursive: true });
  for (const c of COURSES) fs.mkdirSync(path.join(OUT_LESSON, c.slug), { recursive: true });

  const browser = await chromium.launch();
  const lessonContext = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const heroContext = await browser.newContext({ viewport: { width: 1920, height: 600 } });

  let total = 0;

  for (const course of COURSES) {
    // Hero banner
    const lessonPage = await lessonContext.newPage();
    const heroPage = await heroContext.newPage();
    const heroSvg = buildHeroSVG(course);
    const heroOut = path.join(OUT_HERO, `${course.slug}-hero.png`);
    await renderSVGToPNG(heroPage, heroSvg, 1920, 600, heroOut);
    console.log(`✓ hero: ${path.relative(REPO_ROOT, heroOut)}`);
    total++;

    // Module thumbnails
    for (const mod of course.modules) {
      const svg = buildLessonSVG(course, mod);
      const out = path.join(OUT_LESSON, course.slug, `${moduleSlug(course, mod)}.png`);
      await renderSVGToPNG(lessonPage, svg, 1280, 720, out);
      console.log(`  ✓ ${course.abbr} M${mod.n}: ${mod.title.slice(0, 50)}`);
      total++;
    }

    await lessonPage.close();
    await heroPage.close();
  }

  await lessonContext.close();
  await heroContext.close();
  await browser.close();

  console.log(`\n✓ Generated ${total} images.`);
  console.log(`  Heroes:  ${path.relative(REPO_ROOT, OUT_HERO)}`);
  console.log(`  Lessons: ${path.relative(REPO_ROOT, OUT_LESSON)}`);
})();
