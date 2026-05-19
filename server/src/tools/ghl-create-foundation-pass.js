/**
 * Creates the "Income Academy Foundation Pass" bundle offer in GoHighLevel.
 *
 * Strategy:
 * 1. First tries GHL REST API v2 using GHL_API_KEY from env
 * 2. Falls back to Playwright browser automation using saved Chrome session
 *
 * Usage:
 *   node ghl-create-foundation-pass.js
 *   GHL_API_KEY=pit-xxx node ghl-create-foundation-pass.js
 */

import { chromium } from 'playwright';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { execSync } from 'child_process';

const LOCATION_ID = 'c3HSS74ILjGye3pvGsHg';
const API_BASE = 'https://services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';

const KNOWN_PRODUCT_IDS = {
  'AI Side Income Starter Kit': 'd4c2b0c2-dee8-4ccf-8d5b-cd37e1eef075',
  'Honest Affiliate Marketing Starter': '4883bfbe-c2d7-4d08-b8b9-4fe130942e07',
};

const OFFER = {
  name: 'Income Academy Foundation Pass',
  description:
    'All 4 courses bundled — AI Side Income, Honest Affiliate Marketing, Estate Sale Sourcing, and Bookkeeping From Home. $47 one-time + $19/mo membership.',
  courses: [
    { name: 'AI Side Income Starter Kit', id: 'd4c2b0c2-dee8-4ccf-8d5b-cd37e1eef075' },
    { name: 'Honest Affiliate Marketing Starter', id: '4883bfbe-c2d7-4d08-b8b9-4fe130942e07' },
    { name: 'Estate Sale and Garage Sale Sourcing Academy', id: null }, // resolved at runtime
    { name: 'Bookkeeping From Home for Over-55s', id: null }, // resolved at runtime
  ],
  price: { oneTime: 47, monthly: 19 },
};

// ── API approach ──────────────────────────────────────────────────────────────

async function apiGet(path, apiKey) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: API_VERSION,
      Accept: 'application/json',
    },
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

async function apiPost(path, body, apiKey) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: API_VERSION,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text };
}

async function tryApiApproach(apiKey) {
  console.log('→ Trying GHL API approach...');

  // List all membership products to find Estate Sale and Bookkeeping IDs
  const endpoints = [
    `/products/?locationId=${LOCATION_ID}&limit=100`,
    `/products/?locationId=${LOCATION_ID}&type=membership`,
    `/memberships/courses/exporter/public_template?locationId=${LOCATION_ID}`,
  ];

  let products = [];
  for (const ep of endpoints) {
    const r = await apiGet(ep, apiKey);
    console.log(`  GET ${ep} → ${r.status}`);
    if (r.status === 200) {
      try {
        const data = JSON.parse(r.body);
        const arr = data.products || data.courses || data.data || data;
        if (Array.isArray(arr)) {
          products = arr;
          console.log(`  Found ${products.length} products`);
          break;
        }
      } catch {}
    }
  }

  // Match missing course IDs
  for (const course of OFFER.courses) {
    if (!course.id) {
      const match = products.find(
        (p) =>
          p.name?.toLowerCase().includes('estate') ||
          p.title?.toLowerCase().includes('estate') ||
          p.name?.toLowerCase().includes('bookkeeping') ||
          p.title?.toLowerCase().includes('bookkeeping')
      );
      if (match) {
        course.id = match.id || match._id || match.productId;
        console.log(`  Resolved "${course.name}" → ${course.id}`);
      }
    }
  }

  const missingIds = OFFER.courses.filter((c) => !c.id).map((c) => c.name);
  if (missingIds.length > 0) {
    console.log(`  ✗ Could not resolve IDs for: ${missingIds.join(', ')}`);
    return null;
  }

  // Try to create the offer/bundle
  const offerBody = {
    locationId: LOCATION_ID,
    name: OFFER.name,
    description: OFFER.description,
    products: OFFER.courses.map((c) => c.id),
    price: OFFER.price.oneTime,
    subscriptionPrice: OFFER.price.monthly,
    subscriptionInterval: 'monthly',
  };

  const createEndpoints = [
    '/memberships/offers/',
    '/products/offers/',
    '/products/bundles/',
  ];

  for (const ep of createEndpoints) {
    const r = await apiPost(ep, offerBody, apiKey);
    console.log(`  POST ${ep} → ${r.status}: ${r.body.slice(0, 100)}`);
    if (r.status === 200 || r.status === 201) {
      try {
        const data = JSON.parse(r.body);
        const offerId = data.id || data._id || data.offerId || data.offer?.id;
        console.log(`  ✓ Offer created! ID: ${offerId}`);
        return offerId || 'created-see-response';
      } catch {}
    }
  }

  return null;
}

// ── Playwright approach ───────────────────────────────────────────────────────

async function copyChromiumProfile() {
  const srcProfile = path.join(
    os.homedir(),
    'Library/Application Support/Google/Chrome/Profile 3'
  );
  const tmpDir = path.join(os.tmpdir(), `ghl-chrome-${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  // Copy only essential files (Cookies, Local Storage, Session Storage) — avoids lock issues
  const filesToCopy = ['Cookies', 'Local Storage', 'Session Storage', 'IndexedDB'];
  const defaultDir = path.join(tmpDir, 'Default');
  fs.mkdirSync(defaultDir, { recursive: true });

  for (const f of filesToCopy) {
    const src = path.join(srcProfile, f);
    const dst = path.join(defaultDir, f);
    try {
      execSync(`cp -r "${src}" "${dst}" 2>/dev/null || true`);
    } catch {}
  }

  return tmpDir;
}

async function tryPlaywrightApproach() {
  console.log('→ Trying Playwright browser automation...');

  const tmpProfileDir = await copyChromiumProfile();
  console.log(`  Copied Chrome profile to: ${tmpProfileDir}`);

  // Try with actual Chrome binary first (inherits decrypted cookies), fall back to Chromium
  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const useChrome = fs.existsSync(chromePath);

  let browser;
  let context;

  try {
    if (useChrome) {
      // Use Chrome with the copied profile — will decrypt cookies automatically
      context = await chromium.launchPersistentContext(tmpProfileDir, {
        executablePath: chromePath,
        headless: false,
        args: ['--no-sandbox', '--disable-blink-features=AutomationControlled'],
        viewport: { width: 1280, height: 800 },
        timeout: 30000,
      });
    } else {
      browser = await chromium.launch({ headless: false });
      context = await browser.newContext();
    }

    const page = await context.newPage();
    page.setDefaultTimeout(30000);

    // Navigate to GHL app
    console.log('  Navigating to GHL...');
    await page.goto(`https://app.gohighlevel.com/location/${LOCATION_ID}/memberships/courses`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    // Wait for React to render (GHL is slow to hydrate)
    await page.waitForTimeout(8000);

    const url = page.url();
    console.log(`  Current URL: ${url}`);

    // Screenshot + page content for debugging
    await page.screenshot({ path: '/tmp/ghl-debug.png', fullPage: false });
    console.log('  Screenshot saved to /tmp/ghl-debug.png');
    const bodyText = await page.locator('body').innerText().catch(() => '');
    console.log(`  Page body text (first 300): ${bodyText.slice(0, 300)}`);

    if (url.includes('login') || url.includes('signin')) {
      console.log('  Session expired — login required');
      await context.close();
      return { status: 'BLOCKED', reason: 'GHL session expired — re-login needed' };
    }

    // Look for Offers tab
    console.log('  Looking for Offers tab...');
    const offersTab = page.getByRole('tab', { name: /offers/i }).or(
      page.locator('a, button, [role="tab"]').filter({ hasText: /offers/i })
    );

    await offersTab.first().click({ timeout: 10000 });
    await page.waitForTimeout(1500);

    // Click "Create Offer" or "Add Offer" button
    const createBtn = page.getByRole('button', { name: /create offer|add offer|new offer/i });
    await createBtn.first().click({ timeout: 10000 });
    await page.waitForTimeout(1500);

    // Fill in offer name
    const nameInput = page.getByLabel(/offer name|name/i).first();
    await nameInput.fill(OFFER.name);

    // Fill description
    const descInput = page.getByLabel(/description/i).first();
    if (await descInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await descInput.fill(OFFER.description);
    }

    // Add each course to the offer
    for (const course of OFFER.courses) {
      console.log(`  Adding course: ${course.name}`);
      const addProductBtn = page.getByRole('button', { name: /add product|add course/i }).first();
      if (await addProductBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await addProductBtn.click();
        await page.waitForTimeout(500);
        // Search for the course
        const searchInput = page.getByPlaceholder(/search|find/i).last();
        await searchInput.fill(course.name.split(' ').slice(0, 3).join(' '));
        await page.waitForTimeout(700);
        // Select the first matching result
        await page.getByText(course.name, { exact: false }).first().click();
        await page.waitForTimeout(300);
      }
    }

    // Set price — fill $47 one-time
    const priceInput = page.getByLabel(/price|amount/i).first();
    if (await priceInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await priceInput.fill('47');
    }

    // Save the offer
    const saveBtn = page.getByRole('button', { name: /save|create|publish/i }).last();
    await saveBtn.click({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Grab offer ID from URL or response
    const finalUrl = page.url();
    console.log(`  Final URL: ${finalUrl}`);
    const idMatch = finalUrl.match(/offers\/([a-zA-Z0-9_-]+)/);
    const offerId = idMatch ? idMatch[1] : 'check-GHL-ui';

    await context.close();
    return { status: 'CREATED', offerId };
  } catch (err) {
    console.error(`  Playwright error: ${err.message}`);
    if (context) await context.close().catch(() => {});
    if (browser) await browser.close().catch(() => {});
    return { status: 'ERROR', reason: err.message };
  } finally {
    // Clean up temp profile
    fs.rmSync(tmpProfileDir, { recursive: true, force: true });
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== GHL Create Foundation Pass ===\n');

  const apiKey = process.env.GHL_API_KEY;
  let offerId = null;
  let method = null;

  // 1. Try API if key is available
  if (apiKey) {
    console.log('GHL_API_KEY found — trying API first\n');
    offerId = await tryApiApproach(apiKey);
    if (offerId) method = 'API';
  } else {
    console.log('GHL_API_KEY not set — skipping API approach\n');
  }

  // 2. Fall back to Playwright
  if (!offerId) {
    const result = await tryPlaywrightApproach();
    if (result.status === 'CREATED') {
      offerId = result.offerId;
      method = 'Playwright';
    } else {
      console.log(`\n✗ Playwright blocked: ${result.reason || result.status}`);
      const msg = `Foundation Pass bundle: BLOCKED — GHL session expired or login needed. Set GHL_API_KEY (pit-...) in server/.env to use API, or log in to GHL in Chrome and re-run.`;
      console.log(`\nSending failure notification...`);
      try {
        execSync(`openclaw message send --channel telegram --target "8589313426" --message "${msg}"`, { stdio: 'inherit' });
      } catch (e) {
        console.error('Failed to send notification:', e.message);
      }
      process.exit(1);
    }
  }

  console.log(`\n✓ Foundation Pass created via ${method}. Offer ID: ${offerId}`);
  const msg = `Foundation Pass bundle: SUCCESS via ${method} — offer ID: ${offerId}`;
  try {
    execSync(`openclaw message send --channel telegram --target "8589313426" --message "${msg}"`, { stdio: 'inherit' });
  } catch (e) {
    console.error('Failed to send notification:', e.message);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  try {
    execSync(`openclaw message send --channel telegram --target "8589313426" --message "Foundation Pass bundle: ERROR — ${err.message.slice(0, 200)}"`, { stdio: 'inherit' });
  } catch {}
  process.exit(1);
});
