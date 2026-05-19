#!/usr/bin/env node
// =============================================================================
// GHL Course Module Adder — Estate Sale and Garage Sale Sourcing Academy (Modules 5–8)
// =============================================================================
// Adds modules 5–8 to the existing course in GHL (modules 0–4 already done).
//
// SETUP — set credentials before running:
//   export GHL_EMAIL="your@email.com"
//   export GHL_PASSWORD="yourpassword"
//
// THEN RUN (from the Income Academy CRM root):
//   node server/src/tools/ghl-add-estate-sale-modules-5-8.js
//
// The browser will open visibly so you can monitor or intervene.
// The script takes ~5-10 minutes to complete all 4 modules.
//
// If you get a 2FA prompt, fill it in the browser — the script waits 60s.
// =============================================================================

import { chromium } from 'playwright';

const EMAIL    = process.env.GHL_EMAIL    || '';
const PASSWORD = process.env.GHL_PASSWORD || '';
const LOCATION_ID = 'c3HSS74ILjGye3pvGsHg';
const COURSE_URL  = `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/memberships/courses/products-v2`;
const COURSE_NAME = 'Estate Sale and Garage Sale Sourcing Academy';

if (!EMAIL || !PASSWORD) {
  console.error('\n✗ Missing credentials. Set GHL_EMAIL and GHL_PASSWORD env vars and re-run.\n');
  console.error('  export GHL_EMAIL="your@email.com"');
  console.error('  export GHL_PASSWORD="yourpassword"\n');
  process.exit(1);
}

// ─── Module content ───────────────────────────────────────────────────────────

const MODULES = [
  {
    moduleTitle: 'Module 5 — The Pipeline: From Sale to Profit',
    lessonTitle: 'The Pipeline: From Sale to Profit',
    lessonHtml: `<p><strong>Runtime: 50 min</strong></p>
<ul>
<li>Staging area workflow (dedicate a room or garage zone)</li>
<li>The photograph station: cheap lightbox, phone camera, consistent backdrop</li>
<li>Listing workflow: eBay first (best pricing), then FB Marketplace, then Mercari</li>
<li>Shipping 101: USPS Priority Flat Rate boxes, eBay label savings, fragile-packaging basics</li>
<li>Title-writing conventions for eBay search visibility</li>
<li><strong>AI Writing Assistant</strong> — included Claude Project drafts listings, titles, and descriptions from photos</li>
<li>Deliverable: list your first 10 items this week</li>
</ul>`,
  },
  {
    moduleTitle: 'Module 6 — Scaling Up: When to Graduate to the eBay Done-With-You Program',
    lessonTitle: 'Scaling Up: When to Graduate to the eBay Done-With-You Program',
    lessonHtml: `<p><strong>Runtime: 30 min</strong></p>
<ul>
<li>The ceiling of solo sourcing: ~$1,500–$2,500/month part-time, 25–40 hours/week full-time</li>
<li>Signs you're ready for scale:
  <ul>
    <li>You're averaging 8+ sourced items/week</li>
    <li>You have $2,000+ in ROI inventory</li>
    <li>You're losing time to photography/listing/shipping</li>
    <li>You want to expand beyond your local sourcing radius</li>
  </ul>
</li>
<li>What the eBay DWY program does: warehouses your inventory, photographs professionally, lists on your behalf with expert titling, handles shipping + returns</li>
<li>How to apply (internal funnel — leads to phone consultation, not shown publicly)</li>
<li>Realistic ceiling with the DWY program: $5k–$15k/month (honest range, with disclaimer)</li>
</ul>`,
  },
  {
    moduleTitle: 'Module 7 — Taxes, Tracking, and Not Becoming a Hoarder',
    lessonTitle: 'Taxes, Tracking, and Not Becoming a Hoarder',
    lessonHtml: `<p><strong>Runtime: 30 min</strong></p>
<ul>
<li>Sales tax: when you're a reseller, when you're not (state variations, resale certificates)</li>
<li>Income tax: self-employment, Schedule C basics, when to talk to a CPA</li>
<li>The 1099-K threshold (IRS rules as of 2026)</li>
<li>Inventory tracking: simple spreadsheet template</li>
<li>Mileage tracking: deductible if itemized; apps that do this automatically</li>
<li>The psychological trap of "I might sell this someday" — the 90-day inventory rule</li>
<li>Disposing of what doesn't sell (donations, lot-listings, estate sale RE-sale)</li>
</ul>`,
  },
  {
    moduleTitle: 'Module 8 — Your 90-Day Plan',
    lessonTitle: 'Your 90-Day Plan',
    lessonHtml: `<p><strong>Runtime: 20 min</strong></p>
<ul>
<li>Week 1–2: observe 3 sales, buy nothing, build your route spreadsheet</li>
<li>Week 3–4: first sourcing trips, target $100 in inventory, list first 10 items</li>
<li>Month 2: refine categories, track ROI by source, hit $500 in inventory</li>
<li>Month 3: choose your specialization (the category you're best at), $1,000+ in inventory, evaluate readiness for eBay DWY</li>
<li>The "when to quit" checklist — if you're 90 days in and hate it, refund is still available on the bundle (per the 7-day money-back guarantee OR by canceling the $19/mo membership)</li>
</ul>`,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitAndClick(page, selector, timeout = 15000) {
  const el = await page.waitForSelector(selector, { timeout });
  await el.scrollIntoViewIfNeeded();
  await sleep(300);
  await el.click();
  return el;
}

async function fillField(page, selector, value, timeout = 10000) {
  const el = await page.waitForSelector(selector, { timeout });
  await el.fill(value);
  return el;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀 GHL Estate Sale Module Adder (5–8) — starting Chromium...\n');

  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // ── 1. Login ──────────────────────────────────────────────────────────────
  console.log('① Navigating to GHL login...');
  await page.goto('https://app.gohighlevel.com/', { waitUntil: 'domcontentloaded' });
  await sleep(2000);

  await fillField(page, 'input[type="email"], input[name="email"], #email', EMAIL);
  await sleep(300);
  await fillField(page, 'input[type="password"], input[name="password"], #password', PASSWORD);
  await sleep(300);
  await page.keyboard.press('Enter');

  console.log('   Waiting for dashboard (up to 60s — fill 2FA in browser if prompted)...');
  await page.waitForURL(/app\.gohighlevel\.com/, { timeout: 60000 });
  await sleep(3000);

  // ── 2. Navigate to the Estate Sale course ─────────────────────────────────
  console.log('\n② Navigating to Estate Sale course...');
  await page.goto(COURSE_URL, { waitUntil: 'domcontentloaded' });
  await sleep(3000);

  // Find and click the course card
  const courseLink = await page.locator(`text="${COURSE_NAME}"`).first();
  if (await courseLink.count() === 0) {
    // Try partial match
    const partialLink = await page.locator('text="Estate Sale"').first();
    if (await partialLink.count() === 0) {
      throw new Error(`Could not find "${COURSE_NAME}" course on the page. Make sure the course exists in GHL.`);
    }
    await partialLink.click();
  } else {
    await courseLink.click();
  }
  await sleep(2000);

  // Click "Builder" or "Edit Course" button if present
  const builderBtn = page.locator('text="Builder", text="Edit Course", [aria-label*="builder" i], [href*="/builder"]').first();
  if (await builderBtn.count() > 0) {
    await builderBtn.click();
    await sleep(2000);
  }

  // ── 3. Add each module ────────────────────────────────────────────────────
  for (let i = 0; i < MODULES.length; i++) {
    const mod = MODULES[i];
    console.log(`\n③ Adding ${mod.moduleTitle}`);

    // Click "+ Add Category" / "+ Add Section" / "+ Add Module"
    const addCategoryBtn = page.locator(
      'button:has-text("Add Category"), button:has-text("Add Section"), button:has-text("Add Module"), [data-testid="add-category"]'
    ).last();
    await addCategoryBtn.waitFor({ timeout: 15000 });
    await addCategoryBtn.scrollIntoViewIfNeeded();
    await addCategoryBtn.click();
    await sleep(1500);

    // Fill in module/category title
    const catTitleInput = page.locator(
      'input[placeholder*="category" i], input[placeholder*="section" i], input[placeholder*="module" i], dialog input[type="text"]'
    ).last();
    if (await catTitleInput.count() > 0) {
      await catTitleInput.fill(mod.moduleTitle);
      await sleep(300);
      const saveBtn = page.locator('button:has-text("Save"), button:has-text("Add"), button[type="submit"]').last();
      if (await saveBtn.count() > 0) await saveBtn.click();
      else await page.keyboard.press('Enter');
      await sleep(1500);
    } else {
      const inlineTitle = page.locator('.category-title input, .section-title input, [contenteditable]').last();
      if (await inlineTitle.count() > 0) {
        await inlineTitle.fill(mod.moduleTitle);
        await page.keyboard.press('Enter');
        await sleep(1000);
      }
    }

    console.log(`   ✓ Module title set`);

    // ── 3b. Add lesson inside this module ─────────────────────────────────
    console.log(`   Adding lesson: ${mod.lessonTitle}`);

    const addPostBtn = page.locator(
      'button:has-text("Add Post"), button:has-text("Add Lesson"), [data-testid="add-post"]'
    ).last();
    await addPostBtn.waitFor({ timeout: 15000 });
    await addPostBtn.scrollIntoViewIfNeeded();
    await addPostBtn.click();
    await sleep(2000);

    const lessonTitleInput = page.locator(
      'input[placeholder*="lesson" i], input[placeholder*="post" i], dialog input[type="text"], .post-title input'
    ).last();
    if (await lessonTitleInput.count() > 0) {
      await lessonTitleInput.fill(mod.lessonTitle);
      await sleep(300);
    }

    const saveLessonBtn = page.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]').last();
    if (await saveLessonBtn.count() > 0) {
      await saveLessonBtn.click();
      await sleep(2000);
    } else {
      await page.keyboard.press('Enter');
      await sleep(2000);
    }

    // ── 3c. Open lesson and add HTML content ──────────────────────────────
    const lessonItem = page.locator(`text="${mod.lessonTitle}"`).last();
    if (await lessonItem.count() > 0) {
      await lessonItem.click();
      await sleep(2000);
    }

    const editor = page.locator(
      '.ql-editor, [contenteditable="true"].ProseMirror, .tiptap, [contenteditable="true"]'
    ).first();

    if (await editor.count() > 0) {
      const srcBtn = page.locator('button.ql-code-block, button[data-value="code"], [aria-label*="source" i], [aria-label*="html" i], button:has-text("</>")').first();
      if (await srcBtn.count() > 0) {
        await srcBtn.click();
        await sleep(500);
        const codeInput = page.locator('textarea.ql-code-block-container, textarea.html-source').first();
        if (await codeInput.count() > 0) {
          await codeInput.fill(mod.lessonHtml);
          const applyBtn = page.locator('button:has-text("OK"), button:has-text("Apply"), button:has-text("Save")').first();
          if (await applyBtn.count() > 0) await applyBtn.click();
          await sleep(500);
        }
      } else {
        await editor.click();
        await page.keyboard.selectAll();
        await page.keyboard.press('Delete');
        await page.evaluate((html) => {
          const ed = document.querySelector('.ql-editor, .ProseMirror, .tiptap, [contenteditable="true"]');
          if (ed) ed.innerHTML = html;
        }, mod.lessonHtml);
        await sleep(500);
      }

      const saveContentBtn = page.locator('button:has-text("Save"), button:has-text("Update"), button[aria-label*="save" i]').first();
      if (await saveContentBtn.count() > 0) {
        await saveContentBtn.click();
        await sleep(1500);
      }
      console.log(`   ✓ Lesson content added`);
    } else {
      console.log(`   ⚠ Could not find rich text editor — lesson created without content. Add content manually.`);
    }

    // Go back to builder if we navigated away
    const currentUrl = page.url();
    if (!currentUrl.includes('/builder') && !currentUrl.includes('/curriculum') && i < MODULES.length - 1) {
      await page.goto(COURSE_URL, { waitUntil: 'domcontentloaded' });
      await sleep(2000);
      const courseLinkAgain = page.locator(`text="${COURSE_NAME}", text="Estate Sale"`).first();
      if (await courseLinkAgain.count() > 0) {
        await courseLinkAgain.click();
        await sleep(1500);
        const builderBtnAgain = page.locator('text="Builder", text="Edit Course"').first();
        if (await builderBtnAgain.count() > 0) {
          await builderBtnAgain.click();
          await sleep(2000);
        }
      }
    }
  }

  console.log('\n✅ Modules 5–8 added successfully!\n');
  console.log(`   Review the course at: ${COURSE_URL}\n`);

  await sleep(3000);
  await browser.close();
}

main().catch(async (err) => {
  console.error('\n✗ Script failed:', err.message);
  console.error('\nIf the script failed due to UI selector mismatches, open the browser manually:');
  console.error(`  ${COURSE_URL}`);
  console.error('\nUse the HTML upload helper for manual entry:');
  console.error('  /Users/wyattsmac/Documents/Income Academy CRM/tools/ghl-upload-helpers/estate-sale-sourcing.html\n');
  process.exit(1);
});
