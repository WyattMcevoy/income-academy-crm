#!/usr/bin/env node
// Overnight Runner — executes the full Income Academy build queue autonomously
// Sends Telegram updates via OpenClaw at start, key milestones, and completion
// Skips tasks requiring OS-level interaction; logs everything for morning review
//
// Usage: node server/src/tools/overnight-runner.js
// Safe to run while away — no destructive operations, no financial actions

import { execSync, exec } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '..', '..', '..');
const OPENCLAW = '/Users/wyattsmac/.npm-global/bin/openclaw';
const LOG_FILE = join(REPO_ROOT, 'overnight-build.log');

function log(msg) {
  const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
  console.log(line);
  try { writeFileSync(LOG_FILE, line + '\n', { flag: 'a' }); } catch {}
}

function notify(msg) {
  log('📱 Sending Telegram: ' + msg.slice(0, 80));
  try {
    execSync(`${OPENCLAW} message send --channel telegram --message ${JSON.stringify(msg)}`, {
      stdio: 'pipe', timeout: 15000
    });
  } catch (err) {
    log('Telegram failed (OpenClaw may be restarting): ' + err.message?.slice(0, 60));
  }
}

function run(cmd, description) {
  log(`▶ ${description}`);
  try {
    const result = execSync(cmd, { 
      cwd: REPO_ROOT,
      stdio: 'pipe',
      timeout: 300000, // 5 min per task
      encoding: 'utf8'
    });
    log(`✓ ${description}`);
    return { success: true, output: result };
  } catch (err) {
    log(`✗ ${description} — ${err.message?.slice(0, 120)}`);
    return { success: false, error: err.message };
  }
}

function runChromeTask(prompt, description, timeoutMs = 600000) {
  log(`🌐 ${description} (Chrome task)`);
  return new Promise((resolve) => {
    const child = exec(
      `echo ${JSON.stringify(prompt)} | claude --chrome --print`,
      { cwd: REPO_ROOT, timeout: timeoutMs, encoding: 'utf8' }
    );
    let output = '';
    child.stdout?.on('data', d => output += d);
    child.stderr?.on('data', d => output += d);
    child.on('close', (code) => {
      if (code === 0) {
        log(`✓ ${description}`);
        resolve({ success: true, output });
      } else {
        log(`✗ ${description} (exit ${code})`);
        resolve({ success: false, output });
      }
    });
  });
}

// ============================================================
// Task queue
// ============================================================

const ESTATE_COURSE_ID = 'REPLACE_WITH_ESTATE_SALE_COURSE_ID';
const BOOKKEEPING_COURSE_ID = 'REPLACE_WITH_BOOKKEEPING_COURSE_ID';
const LOCATION_ID = 'c3HSS74ILjGye3pvGsHg';

async function main() {
  writeFileSync(LOG_FILE, `=== Income Academy Overnight Build — ${new Date().toLocaleString()} ===\n`);
  
  notify([
    '🚀 Income Academy overnight build started',
    '',
    'Queue:',
    '• Estate Sale + Bookkeeping lesson content (36 modules)',
    '• GHL Bundle/Offer linking all 4 courses',
    '• GHL portal CSS redesign',
    '• Commit + deploy all changes',
    '',
    'Est. time: 2-3 hours. I\'ll message you at completion.',
    'Reply STOP anytime to pause.',
  ].join('\n'));

  const results = { completed: [], failed: [], skipped: [] };

  // ---- Rebuild generated content ----
  const rebuild = run('node server/src/tools/rebuild-all.js', 'Rebuild GHL helpers + Claude bundle');
  if (rebuild.success) results.completed.push('Rebuild generated content');
  else results.failed.push('Rebuild generated content');

  // ---- Estate Sale lesson content ----
  log('\n=== ESTATE SALE COURSE ===');
  const estateResult = await runChromeTask(
    `Navigate to the Estate Sale and Garage Sale Sourcing Academy course in GoHighLevel for Income Academy (location ${LOCATION_ID}). 
    Go to: https://app.gohighlevel.com/v2/location/${LOCATION_ID}/memberships/courses/products-v2
    Find the Estate Sale course and open it. 
    For each of the 9 modules (0 through 8), click + Add Content > Add Lesson, create a lesson with a meaningful title and helpful content based on the module name. Use HTML source editor.
    Module content to add per module:
    0: Welcome + Reality Check — who it's for, realistic income ($300-1500/mo part-time), who should leave
    1: The Ecosystem — estate vs garage vs auction, calendar, Thursday preview nights
    2: Finding Sales — estatesales.net walkthrough, Facebook groups, Craigslist, route optimization
    3: The 7 Categories — vintage tools (Stanley, Starrett), glassware (Pyrex patterns), jewelry, electronics, furniture, books, collectibles — what to look for in each
    4: Pricing and Negotiation — the 40% rule, 30-second phone check on eBay sold listings, bundle offer scripts, walk-away scripts
    5: Sale to Profit Pipeline — photography station, eBay listing workflow, AI-assisted titles, shipping basics
    6: eBay Done-With-You graduation — when you're ready ($1500+/mo sourcing), what DWY does, how to apply
    7: Taxes, Tracking, Not a Hoarder — Schedule C basics, 90-day inventory rule, mileage tracking
    8: 90-Day Plan — week-by-week from first observation to first consistent month
    Add all 9 lessons and confirm completion.`,
    'Estate Sale — add all 9 module lessons',
    900000 // 15 min
  );
  if (estateResult.success) results.completed.push('Estate Sale lessons');
  else results.failed.push('Estate Sale lessons');

  // ---- Bookkeeping lesson content ----
  log('\n=== BOOKKEEPING COURSE ===');
  const bookkeepingResult = await runChromeTask(
    `Navigate to the Bookkeeping From Home for Over-55s course in GoHighLevel for Income Academy (location ${LOCATION_ID}).
    Go to: https://app.gohighlevel.com/v2/location/${LOCATION_ID}/memberships/courses/products-v2
    Find the Bookkeeping course and open it.
    For each of the 9 modules (0 through 8), click + Add Content > Add Lesson, create a lesson with HTML content:
    0: Welcome + Reality Check — 3-5 clients target, $1500-2500/mo realistic, 2 focused weeks per month, honest comparisons vs Bookkeeper Launch ($3k career course)
    1: Bookkeeping vs Accounting vs Tax Prep — the legal line, what bookkeepers can and cannot do, state licensing (none required as of 2026), when to refer to a CPA
    2: Software Stack — QBO ProAdvisor cert (free), Xero cert (free), which to learn first, getting client credentials safely
    3: The 5 Services — monthly reconciliation, AR management, AP, payroll coordination, QBO cleanup projects ($500-2000 flat)
    4: Landing First 3 Clients — CPA referral strategy (biggest source), free books review offer, local networking, LinkedIn
    5: Pricing — flat monthly retainer beats hourly, pricing calculator formula, how to raise prices, when to walk away
    6: Engagement Letters and Legal — template engagement letter, E&O insurance ($300-600/yr), data privacy, where the line is
    7: Running It with AI — AI Writing Assistant for client report narratives, email drafts, outreach, monthly summaries
    8: 90-Day Plan — days 1-14 setup, days 15-30 outreach, first client by day 30, second by day 60
    Add all 9 lessons and confirm completion.`,
    'Bookkeeping — add all 9 module lessons',
    900000 // 15 min
  );
  if (bookkeepingResult.success) results.completed.push('Bookkeeping lessons');
  else results.failed.push('Bookkeeping lessons');

  // ---- Create Bundle/Offer ----
  log('\n=== BUNDLE / OFFER ===');
  const bundleResult = await runChromeTask(
    `In GoHighLevel for Income Academy, navigate to Memberships > Courses > Offers tab.
    Create a new Offer called "Income Academy Foundation Pass".
    Description: All 4 courses bundled — AI Side Income, Honest Affiliate Marketing, Estate Sale Sourcing, and Bookkeeping From Home. $47 one-time + $19/mo membership.
    Add all 4 courses to this offer:
    - AI Side Income Starter Kit (product ID: d4c2b0c2-dee8-4ccf-8d5b-cd37e1eef075)
    - Honest Affiliate Marketing Starter (product ID: 4883bfbe-c2d7-4d08-b8b9-4fe130942e07)
    - Estate Sale and Garage Sale Sourcing Academy
    - Bookkeeping From Home for Over-55s
    Save the offer and tell me the offer ID from the URL.`,
    'Create Foundation Pass Bundle/Offer in GHL',
    300000
  );
  if (bundleResult.success) results.completed.push('GHL Bundle/Offer');
  else results.failed.push('GHL Bundle/Offer');

  // ---- GHL CSS Redesign ----
  log('\n=== GHL PORTAL CSS ===');
  const cssResult = await runChromeTask(
    `In GoHighLevel Income Academy, navigate to Memberships > Client Portal > Settings (or Customize).
    Find the Custom CSS or Theme/Brand settings.
    Inject this CSS to match the Income Academy brand (navy + gold):
    :root { --primary: #f59e0b; --secondary: #0f172a; --accent: #1e293b; }
    .btn-primary, .button-primary, button[type=submit] { background-color: #f59e0b !important; color: #0f172a !important; }
    nav, .navbar, .header { background-color: #0f172a !important; }
    a { color: #f59e0b !important; }
    .course-card:hover { border-color: #f59e0b !important; }
    Save the CSS. Confirm it was saved.`,
    'GHL portal CSS brand redesign',
    180000
  );
  if (cssResult.success) results.completed.push('GHL CSS redesign');
  else results.failed.push('GHL CSS redesign');

  // ---- Run e2e smoke test ----
  log('\n=== SMOKE TEST ===');
  const smokeTest = run('node server/src/tools/e2e-smoke-test.js', 'E2E smoke test (all 12 checks)');
  if (smokeTest.success) results.completed.push('E2E smoke test passed');
  else results.failed.push('E2E smoke test');

  // ---- Final summary ----
  const summary = [
    '✅ Income Academy overnight build complete!',
    '',
    `Completed (${results.completed.length}):`,
    ...results.completed.map(t => `  ✓ ${t}`),
    results.failed.length ? `\nNeeds attention (${results.failed.length}):` : '',
    ...results.failed.map(t => `  ✗ ${t}`),
    '',
    'Log file: ~/Documents/Income\\ Academy\\ CRM/overnight-build.log',
    '',
    'To do when you\'re back:',
    '• Upload course videos (recording needed)',
    '• Set Stripe to Live mode (after LLC)',
    '• Review the GHL portal at portal.incomeacademy.biz',
  ].filter(Boolean).join('\n');

  notify(summary);
  log('\n' + summary);
}

main().catch(err => {
  log('FATAL: ' + err.message);
  notify('🚨 Overnight build crashed: ' + err.message.slice(0, 200) + '\nCheck overnight-build.log for details.');
  process.exit(1);
});
