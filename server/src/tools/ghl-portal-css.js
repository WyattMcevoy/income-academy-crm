#!/usr/bin/env node
/**
 * Injects custom CSS branding into the GHL Income Academy client portal.
 * Tries to use existing Chrome session first, falls back to manual login.
 *
 * Usage: node ghl-portal-css.js
 * Optional: GHL_EMAIL=... GHL_PASSWORD=... node ghl-portal-css.js
 */

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import { existsSync, mkdirSync, cpSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const LOCATION_ID = 'c3HSS74ILjGye3pvGsHg';
const PORTAL_SETTINGS_URL = `https://app.gohighlevel.com/v2/location/${LOCATION_ID}/memberships/client-portal/settings`;

const CSS_TO_INJECT = `:root { --primary: #f59e0b; --secondary: #0f172a; --accent: #1e293b; }
.btn-primary, .button-primary, button[type=submit] { background-color: #f59e0b !important; color: #0f172a !important; }
nav, .navbar, .header { background-color: #0f172a !important; }
a { color: #f59e0b !important; }
.course-card:hover { border-color: #f59e0b !important; }`;

async function isLoginPage(page) {
  try {
    return (await page.locator('input[type="password"]').count()) > 0;
  } catch {
    return false;
  }
}

async function waitForEl(page, selectors, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    for (const sel of selectors) {
      try {
        const el = page.locator(sel).first();
        if ((await el.count()) > 0 && (await el.isVisible())) return { el, sel };
      } catch {}
    }
    await page.waitForTimeout(500);
  }
  return null;
}

async function run() {
  const email = process.env.GHL_EMAIL;
  const password = process.env.GHL_PASSWORD;

  // Try to copy Chrome profile to a temp location (Chrome must be closed or we use a copy)
  const chromeProfile = join(homedir(), 'Library/Application Support/Google/Chrome');
  const tmpProfile = '/tmp/chrome-ghl-profile';

  let launchOptions = {
    headless: false,
    slowMo: 80,
    channel: 'chrome',
  };

  // Try using Chrome with existing profile (works if Chrome is not running)
  try {
    // Kill Chrome first if needed — skip this, just try with user data dir
    launchOptions.args = [`--user-data-dir=${chromeProfile}`, '--profile-directory=Default'];
    console.log('Attempting to use existing Chrome session...');
  } catch (e) {
    console.log('Will use fresh browser instead.');
    delete launchOptions.channel;
    delete launchOptions.args;
  }

  let browser;
  let usedProfile = false;

  try {
    browser = await chromium.launch(launchOptions);
    usedProfile = true;
  } catch (err) {
    console.log('Chrome with profile failed, falling back to Chromium:', err.message);
    browser = await chromium.launch({ headless: false, slowMo: 80 });
  }

  const context = usedProfile
    ? await browser.newContext()
    : await browser.newContext();
  const page = await context.newPage();

  console.log('Navigating to GHL portal settings...');
  await page.goto(PORTAL_SETTINGS_URL, { timeout: 60000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  console.log('Current URL:', page.url());

  // Handle login if needed
  if (await isLoginPage(page)) {
    console.log('Login page detected.');

    if (email && password) {
      console.log('Auto-logging in...');
      await page.fill('input[type="email"], input[placeholder*="email" i]', email);
      await page.fill('input[type="password"]', password);
      await page.click('button[type="submit"], button:has-text("Sign in"), button:has-text("Login")');
      await page.waitForTimeout(2000);
    } else {
      console.log('');
      console.log('=== ACTION REQUIRED: Please log into GHL in the browser window ===');
      console.log('You have 180 seconds. Set GHL_EMAIL and GHL_PASSWORD env vars to automate.');
      console.log('');
    }

    // Wait until login form disappears
    try {
      await page.waitForFunction(() => !document.querySelector('input[type="password"]'), {
        timeout: 180000,
        polling: 1000,
      });
      console.log('Login detected. Continuing...');
      await page.waitForTimeout(3000);
    } catch {
      console.error('Login timed out.');
      await page.screenshot({ path: '/tmp/ghl-css-login-timeout.png' });
      await browser.close();
      process.exit(1);
    }

    // After login, navigate to portal settings
    console.log('Navigating to portal settings post-login...');
    await page.goto(PORTAL_SETTINGS_URL, { timeout: 60000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(8000);
  } else {
    // Already past login — wait for SPA to fully render
    await page.waitForTimeout(8000);
  }

  console.log('URL after navigation:', page.url());
  await page.screenshot({ path: '/tmp/ghl-css-portal-page.png', fullPage: true });

  if (await isLoginPage(page)) {
    console.error('Still on login page after navigation attempt.');
    await browser.close();
    process.exit(1);
  }

  // Look for Custom CSS field
  const textareaSelectors = [
    'textarea[placeholder*="CSS" i]',
    'textarea[id*="css" i]',
    'textarea[name*="css" i]',
    '.custom-css textarea',
    '[data-testid*="css"] textarea',
    '[class*="css"] textarea',
    '[class*="custom"] textarea',
    'textarea',
  ];

  let result = await waitForEl(page, textareaSelectors, 15000);

  if (result) {
    console.log(`Found CSS textarea: ${result.sel}`);
    await result.el.scrollIntoViewIfNeeded();
    await result.el.click({ clickCount: 3 });
    await result.el.fill(CSS_TO_INJECT);
    console.log('CSS inserted.');
  } else {
    // Try CodeMirror
    const cm = page.locator('.CodeMirror').first();
    if ((await cm.count()) > 0) {
      console.log('Found CodeMirror editor.');
      await cm.click();
      await page.keyboard.press('ControlOrMeta+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.type(CSS_TO_INJECT, { delay: 10 });
      console.log('CSS typed into CodeMirror.');
    } else {
      // Try Monaco
      const monaco = page.locator('.monaco-editor').first();
      if ((await monaco.count()) > 0) {
        console.log('Found Monaco editor.');
        await monaco.click();
        await page.keyboard.press('ControlOrMeta+A');
        await page.keyboard.type(CSS_TO_INJECT, { delay: 10 });
        console.log('CSS typed into Monaco.');
      } else {
        console.error('No CSS input found on the page.');
        console.log('Page title:', await page.title());
        console.log('Visible textareas on page:', await page.locator('textarea').count());
        // Print all visible text on page to debug
        const bodyText = await page.locator('body').innerText().catch(() => '');
        console.log('Page content (first 500 chars):', bodyText.slice(0, 500));
        await page.screenshot({ path: '/tmp/ghl-css-no-field.png', fullPage: true });
        console.log('Screenshot: /tmp/ghl-css-no-field.png');
        await browser.close();
        process.exit(1);
      }
    }
  }

  await page.screenshot({ path: '/tmp/ghl-css-before-save.png' });

  // Save
  const saveResult = await waitForEl(page, [
    'button:has-text("Save")',
    'button:has-text("Update")',
    'button:has-text("Apply")',
    '[class*="save"] button',
    'button[type="submit"]',
  ], 5000);

  if (saveResult) {
    console.log(`Clicking save: ${saveResult.sel}`);
    await saveResult.el.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/tmp/ghl-css-after-save.png' });
    console.log('SUCCESS: CSS saved. Screenshot: /tmp/ghl-css-after-save.png');
  } else {
    console.warn('No save button found — CSS may not be persisted.');
    await page.screenshot({ path: '/tmp/ghl-css-no-save.png', fullPage: true });
  }

  await browser.close();
  console.log('Done.');
}

run().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
