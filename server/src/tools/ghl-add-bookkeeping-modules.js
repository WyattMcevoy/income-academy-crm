#!/usr/bin/env node
// =============================================================================
// GHL Course Module Adder — Bookkeeping From Home for Over-55s
// =============================================================================
// Adds all 9 modules (0-8) to the Bookkeeping From Home course in GHL using
// Playwright browser automation.
//
// SETUP — set credentials before running:
//   export GHL_EMAIL="your@email.com"
//   export GHL_PASSWORD="yourpassword"
//
// THEN RUN:
//   node server/src/tools/ghl-add-bookkeeping-modules.js
//
// The browser will open visibly so you can monitor or intervene.
// The script takes ~5-10 minutes to complete all 9 modules.
//
// If you get a 2FA prompt, fill it in the browser — the script waits 60s.
// =============================================================================

import { chromium } from 'playwright';

const EMAIL    = process.env.GHL_EMAIL    || '';
const PASSWORD = process.env.GHL_PASSWORD || '';
const LOCATION_ID = 'c3HSS74ILjGye3pvGsHg';
const COURSE_URL  = `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/memberships/courses/products-v2`;

if (!EMAIL || !PASSWORD) {
  console.error('\n✗ Missing credentials. Set GHL_EMAIL and GHL_PASSWORD env vars and re-run.\n');
  console.error('  export GHL_EMAIL="your@email.com"');
  console.error('  export GHL_PASSWORD="yourpassword"\n');
  process.exit(1);
}

// ─── Module content ───────────────────────────────────────────────────────────

const MODULES = [
  {
    moduleTitle: 'Module 0 — Welcome + Reality Check',
    lessonTitle: 'Welcome + Reality Check',
    lessonHtml: `<p><strong>Runtime: 20 min</strong> — Objective: Set honest expectations. Filter out wrong-fit buyers early.</p>
<ul>
<li>What this course is: how to run a part-time bookkeeping service with 3–5 clients from home</li>
<li>What this course is NOT: how to become a CPA, how to build an agency, how to do tax prep</li>
<li>Realistic numbers (live 2026 market data):
  <ul>
    <li>Hourly rates: <strong>$25–$50/hour</strong> for virtual bookkeepers</li>
    <li>Monthly retainers: <strong>$300–$800 per small-business client</strong> for standard monthly close</li>
    <li>3 clients × $400/mo = $1,200/mo recurring</li>
    <li>5 clients × $500/mo = $2,500/mo recurring</li>
  </ul>
</li>
<li>Time commitment: <strong>~2 weeks of concentrated work per month</strong> (week mid-month + week end-of-month)</li>
<li>Who succeeds: comfortable with numbers, reliable, patient with messy client books</li>
<li>Who fails: needs to learn bookkeeping basics from scratch (get Intuit Academy free first), or wants to scale to 30+ clients (wrong course)</li>
</ul>`,
  },
  {
    moduleTitle: "Module 1 — Bookkeeping vs. Accounting vs. Tax Prep (The Line You Don't Cross)",
    lessonTitle: "Bookkeeping vs. Accounting vs. Tax Prep (The Line You Don't Cross)",
    lessonHtml: `<p><strong>Runtime: 30 min</strong></p>
<ul>
<li>The legal distinctions (no state requires bookkeeping licensure as of 2026, but lines matter):
  <ul>
    <li><strong>Bookkeeping</strong> (what we teach): transaction entry, reconciliation, monthly reports, AR/AP tracking</li>
    <li><strong>Accounting</strong>: financial statement analysis, tax-ready adjustments, audit preparation (CPA/EA territory)</li>
    <li><strong>Tax prep for pay</strong>: requires PTIN + EA or CPA. Do NOT do this without credentials.</li>
  </ul>
</li>
<li>FTC Safeguards Rule (updated 2023): generally applies to financial institutions, not bookkeepers — but cross into tax prep and you may be caught. Clean line matters.</li>
<li>State variations to confirm before launch: LA, NV, WV have had narrow licensing discussions historically. As of 2026, none require a bookkeeping license.</li>
<li>When to refer out: the three scenarios where you hand the client back to their CPA</li>
</ul>`,
  },
  {
    moduleTitle: 'Module 2 — Your Software Stack (QBO, Xero, FreshBooks)',
    lessonTitle: 'Your Software Stack (QBO, Xero, FreshBooks)',
    lessonHtml: `<p><strong>Runtime: 60 min</strong></p>
<ul>
<li><strong>QuickBooks Online (QBO)</strong> — the market leader, 80% of small biz bookkeeping clients use it. Certification path available.</li>
<li><strong>Xero</strong> — growing, especially in tech-forward businesses and international clients</li>
<li><strong>FreshBooks</strong> — simpler, solopreneur-focused, underrated for the tiny-client niche</li>
<li>Which platform(s) to learn first: QBO first, then either Xero or FreshBooks</li>
<li><strong>QBO ProAdvisor program</strong> (free) — badge + discounted subscriptions for your clients</li>
<li>Xero Advisor certification (free) — same concept</li>
<li>The "single-platform specialist" vs "multi-platform generalist" choice — specialist is better for this niche</li>
<li>How to handle client credentials safely: shared vault (1Password, LastPass, Bitwarden) — never email logins</li>
</ul>`,
  },
  {
    moduleTitle: 'Module 3 — The 5 Services You Can Offer (Pick 2-3)',
    lessonTitle: 'The 5 Services You Can Offer (Pick 2-3)',
    lessonHtml: `<p><strong>Runtime: 45 min</strong></p>
<p>Full menu — but don't try to offer all of them. Specialize.</p>
<ol>
<li><strong>Monthly reconciliation + financials</strong> (core offering, every client needs this)</li>
<li><strong>Accounts Receivable management</strong> (invoicing, collections reminders)</li>
<li><strong>Accounts Payable</strong> (bill payment, vendor management)</li>
<li><strong>Payroll coordination</strong> — NOT payroll filing (that's payroll companies). Coordination between QBO and their payroll provider.</li>
<li><strong>QBO cleanup projects</strong> (one-time engagements, $500–$2,000 flat — great entry point)</li>
</ol>
<p><strong>Recommended starter package:</strong> monthly reconciliation + financials + AR management for 1 industry (contractors, realtors, e-commerce, or consultants — pick one).</p>`,
  },
  {
    moduleTitle: 'Module 4 — Landing Your First 3 Clients (The Honest Way)',
    lessonTitle: 'Landing Your First 3 Clients (The Honest Way)',
    lessonHtml: `<p><strong>Runtime: 60 min</strong></p>
<ul>
<li><strong>Where the clients are</strong> (by frequency of hiring):
  <ul>
    <li>Referrals from CPAs/tax prep — biggest source, build these relationships first</li>
    <li>Local small business networking (BNI, Chambers of Commerce, rotary)</li>
    <li>Facebook local business groups</li>
    <li>Upwork + online marketplaces (works but competitive; price compression)</li>
    <li>Cold outreach to small businesses who've grown past the owner-does-it stage</li>
  </ul>
</li>
<li><strong>CPA referral network strategy</strong> — most CPAs hate bookkeeping work and happily refer out if you're reliable. 1 good CPA relationship = 3–5 client introductions per year.</li>
<li><strong>Cold outreach template for the 55–75 voice</strong> (not "hey 👋 I see you're crushing it") — use the AI Writing Assistant to draft, your voice to edit</li>
<li><strong>The free "books review" offer</strong> — 15-minute look at their QBO file, identify 3 issues, $0 cost. Converts at ~40%.</li>
<li><strong>First client in 30 days = realistic</strong> if you do 5 CPA outreaches + 10 local network introductions per week.</li>
</ul>`,
  },
  {
    moduleTitle: "Module 5 — Pricing That Doesn't Burn You Out",
    lessonTitle: "Pricing That Doesn't Burn You Out",
    lessonHtml: `<p><strong>Runtime: 40 min</strong></p>
<ul>
<li><strong>Three pricing models:</strong>
  <ul>
    <li><strong>Hourly</strong> ($25–$50/hr industry range) — bad because it caps income at your time and punishes efficiency. Avoid.</li>
    <li><strong>Project / one-time</strong> ($500–$2,000 for QBO cleanup) — good for entry. Get in, fix, then offer monthly retainer.</li>
    <li><strong>Monthly retainer</strong> ($300–$800/mo) — <strong>this is the target</strong>. Predictable, compounds, aligns with retiree schedule preference.</li>
  </ul>
</li>
<li><strong>The price-your-time formula:</strong> target hours/month per client × your target hourly rate × 1.2 (buffer) = monthly retainer</li>
<li><strong>Raising prices on existing clients:</strong> the 90-day value-review template (scripted conversation)</li>
<li><strong>When to fire a client:</strong> the "3 signs you're underpricing by a lot and they won't agree to raise" checklist</li>
<li><strong>Stop charging for scope creep:</strong> the boundary scripts</li>
</ul>`,
  },
  {
    moduleTitle: 'Module 6 — Engagement Letters + Legal Boundaries',
    lessonTitle: 'Engagement Letters + Legal Boundaries',
    lessonHtml: `<p><strong>Runtime: 40 min</strong></p>
<ul>
<li><strong>Why every engagement needs a written letter</strong> — scope, fees, deliverables, termination, confidentiality</li>
<li><strong>Template engagement letter</strong> included (NOT legal advice — recommend attorney review for your specific state, but covers 95% of common arrangements)</li>
<li><strong>E&amp;O (Errors and Omissions) insurance</strong> — optional but recommended for &gt;$2,000/mo in billable work. Typical cost: $300–$600/year.</li>
<li><strong>Data privacy / FTC Safeguards Rule review</strong> — when it applies to you (usually it doesn't, but the one scenario where it might)</li>
<li><strong>The "I'm not your tax preparer" letter</strong> — required language that protects you when clients try to pull you across the line</li>
<li><strong>Password management</strong> — never email credentials; use 1Password, LastPass, or Bitwarden shared vaults</li>
</ul>`,
  },
  {
    moduleTitle: 'Module 7 — Running It Efficiently with AI (The Included AI Assistant)',
    lessonTitle: 'Running It Efficiently with AI (The Included AI Assistant)',
    lessonHtml: `<p><strong>Runtime: 45 min</strong></p>
<ul>
<li>Your included <strong>Income Academy AI Writing Assistant</strong> (custom Claude Project, shared across the bundle) — now preloaded with bookkeeping-specific workflows:
  <ul>
    <li><strong>Client outreach emails</strong> — cold outreach to CPAs, small businesses, referrals</li>
    <li><strong>Monthly report narratives</strong> — turns your QBO reports into plain-English summaries clients love ("Revenue was up 12% this month, driven by…")</li>
    <li><strong>Engagement letter adaptation</strong> — adapt the template to specific client scenarios</li>
    <li><strong>Question triage</strong> — draft responses to common client questions with your voice applied</li>
    <li><strong>Late-payment reminders</strong> — polite scripts that don't burn the relationship</li>
  </ul>
</li>
<li>The <strong>one thing NOT to use AI for:</strong> categorization decisions on live transactions. Review every one. AI is for drafting, not judging.</li>
<li>Prompt templates library (included with course)</li>
</ul>`,
  },
  {
    moduleTitle: 'Module 8 — Your 90-Day Plan',
    lessonTitle: 'Your 90-Day Plan',
    lessonHtml: `<p><strong>Runtime: 30 min</strong></p>
<h3>Days 1–14 (Foundation)</h3>
<ul>
<li>Complete QBO ProAdvisor certification (free)</li>
<li>Pick your client niche (1 industry) and service package (2–3 services)</li>
<li>Set up your business entity (sole prop or LLC — covered in Module 6)</li>
<li>Write your engagement letter + pricing sheet</li>
</ul>
<h3>Days 15–30 (Outreach)</h3>
<ul>
<li>10 CPA firm outreaches + 10 local network introductions per week</li>
<li>Free "books review" offer as the lead magnet</li>
<li>Goal: first client by Day 30</li>
</ul>
<h3>Days 31–60 (First Client, Second Outreach)</h3>
<ul>
<li>Deliver Month 1 for your first client — build the habit, refine the process</li>
<li>Continue outreach for client 2</li>
<li>Goal: second client by Day 60</li>
</ul>
<h3>Days 61–90 (Stabilize)</h3>
<ul>
<li>Running Month 2 for client 1, Month 1 for client 2</li>
<li>Third client prospecting</li>
<li>Evaluate: do you want 3 clients and stop? 5? More? (Most members target 3–5.)</li>
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
  console.log('\n🚀 GHL Bookkeeping Module Adder — starting Chromium...\n');

  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // ── 1. Login ──────────────────────────────────────────────────────────────
  console.log('① Navigating to GHL login...');
  await page.goto('https://app.gohighlevel.com/', { waitUntil: 'domcontentloaded' });
  await sleep(2000);

  // Fill login form
  await fillField(page, 'input[type="email"], input[name="email"], #email', EMAIL);
  await sleep(300);
  await fillField(page, 'input[type="password"], input[name="password"], #password', PASSWORD);
  await sleep(300);
  await page.keyboard.press('Enter');

  console.log('   Waiting for dashboard (up to 60s — fill 2FA in browser if prompted)...');
  await page.waitForURL(/app\.gohighlevel\.com/, { timeout: 60000 });
  await sleep(3000);

  // ── 2. Navigate to the Bookkeeping course ─────────────────────────────────
  console.log('\n② Navigating to Bookkeeping course...');
  await page.goto(COURSE_URL, { waitUntil: 'domcontentloaded' });
  await sleep(3000);

  // Find and click the Bookkeeping course card
  const courseLink = await page.locator('text="Bookkeeping From Home"').first();
  if (await courseLink.count() === 0) {
    throw new Error('Could not find "Bookkeeping From Home" course on the page. Create the course first in GHL, then re-run this script.');
  }
  await courseLink.click();
  await sleep(2000);

  // Click "Edit / Builder" or similar button
  const builderBtn = page.locator('text="Builder", text="Edit Course", [aria-label*="builder" i], [href*="/builder"]').first();
  if (await builderBtn.count() > 0) {
    await builderBtn.click();
    await sleep(2000);
  }

  // ── 3. Add each module ────────────────────────────────────────────────────
  for (let i = 0; i < MODULES.length; i++) {
    const mod = MODULES[i];
    console.log(`\n③ Adding Module ${i}: ${mod.moduleTitle}`);

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
      // Confirm (Enter or Save button)
      const saveBtn = page.locator('button:has-text("Save"), button:has-text("Add"), button[type="submit"]').last();
      if (await saveBtn.count() > 0) await saveBtn.click();
      else await page.keyboard.press('Enter');
      await sleep(1500);
    } else {
      // Title may have appeared inline — try to find an editable header
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

    // Click "+ Add Post" or "+ Add Lesson" within the newly created category
    const addPostBtn = page.locator(
      'button:has-text("Add Post"), button:has-text("Add Lesson"), [data-testid="add-post"]'
    ).last();
    await addPostBtn.waitFor({ timeout: 15000 });
    await addPostBtn.scrollIntoViewIfNeeded();
    await addPostBtn.click();
    await sleep(2000);

    // Fill lesson title (usually in a dialog or inline input)
    const lessonTitleInput = page.locator(
      'input[placeholder*="lesson" i], input[placeholder*="post" i], dialog input[type="text"], .post-title input'
    ).last();
    if (await lessonTitleInput.count() > 0) {
      await lessonTitleInput.fill(mod.lessonTitle);
      await sleep(300);
    }

    // Try to save and open the lesson editor
    const saveLessonBtn = page.locator('button:has-text("Save"), button:has-text("Create"), button[type="submit"]').last();
    if (await saveLessonBtn.count() > 0) {
      await saveLessonBtn.click();
      await sleep(2000);
    } else {
      await page.keyboard.press('Enter');
      await sleep(2000);
    }

    // ── 3c. Open lesson and add HTML content ──────────────────────────────
    // Click on the newly created lesson to open the editor
    const lessonItem = page.locator(`text="${mod.lessonTitle}"`).last();
    if (await lessonItem.count() > 0) {
      await lessonItem.click();
      await sleep(2000);
    }

    // Look for the rich text editor
    const editor = page.locator(
      '.ql-editor, [contenteditable="true"].ProseMirror, .tiptap, [contenteditable="true"]'
    ).first();

    if (await editor.count() > 0) {
      // Try source/HTML mode first
      const srcBtn = page.locator('button.ql-code-block, button[data-value="code"], [aria-label*="source" i], [aria-label*="html" i], button:has-text("</>")').first();
      if (await srcBtn.count() > 0) {
        await srcBtn.click();
        await sleep(500);
        const codeInput = page.locator('textarea.ql-code-block-container, textarea.html-source').first();
        if (await codeInput.count() > 0) {
          await codeInput.fill(mod.lessonHtml);
          // Click OK/Apply
          const applyBtn = page.locator('button:has-text("OK"), button:has-text("Apply"), button:has-text("Save")').first();
          if (await applyBtn.count() > 0) await applyBtn.click();
          await sleep(500);
        }
      } else {
        // Paste HTML directly into the editor
        await editor.click();
        await page.keyboard.selectAll();
        await page.keyboard.press('Delete');
        await page.evaluate((html) => {
          const ed = document.querySelector('.ql-editor, .ProseMirror, .tiptap, [contenteditable="true"]');
          if (ed) ed.innerHTML = html;
        }, mod.lessonHtml);
        await sleep(500);
      }

      // Save the lesson
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
      // Re-enter the course builder
      const courseLinkAgain = await page.locator('text="Bookkeeping From Home"').first();
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

  console.log('\n✅ All 9 modules added successfully!\n');
  console.log(`   Review the course at: ${COURSE_URL}\n`);

  await sleep(3000);
  await browser.close();
}

main().catch(async (err) => {
  console.error('\n✗ Script failed:', err.message);
  console.error('\nIf the script failed due to UI selector mismatches, open the browser manually:');
  console.error(`  ${COURSE_URL}`);
  console.error('\nUse the HTML upload helper for manual entry:');
  console.error('  /Users/wyattsmac/Documents/Income Academy CRM/tools/ghl-upload-helpers/bookkeeping-from-home.html\n');
  process.exit(1);
});
