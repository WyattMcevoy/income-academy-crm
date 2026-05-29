#!/usr/bin/env node
/**
 * Wire GHL placeholders across all marketing pages in one command.
 *
 * Run once you have the GHL IDs from the GHL dashboard.
 *
 * Usage:
 *   node server/src/tools/wire-ghl-placeholders.js \
 *     --chat-widget-id=abc123 \
 *     --ebay-form-id=xyz789 \
 *     --quiz-form-id=def456
 *
 * Or set env vars:
 *   GHL_CHAT_WIDGET_ID=abc123 \
 *   GHL_EBAY_FORM_ID=xyz789 \
 *   GHL_QUIZ_FORM_ID=def456 \
 *   node server/src/tools/wire-ghl-placeholders.js
 *
 * --dry-run: shows what would change without writing files
 *
 * ── How to get each ID ──────────────────────────────────────────────────────
 *
 * Chat widget ID:
 *   1. GHL → Sites → Chat Widget
 *   2. Create/open widget → Get embed code
 *   3. Copy data-widget-id="XXXXX" value
 *   4. Pass as --chat-widget-id=XXXXX
 *      (Script wraps it in the full <script> tag automatically)
 *
 * eBay apply form ID:
 *   1. GHL → Sites → Forms → open your "eBay Application" form
 *   2. Click Share/Embed → copy the ID from the embed URL:
 *      api.leadconnectorhq.com/widget/form/FORM_ID_HERE
 *   3. Pass as --ebay-form-id=XXXXX
 *
 * Quiz email capture form ID:
 *   1. GHL → Sites → Forms → open your quiz lead-capture form
 *   2. Same as above, grab form ID
 *   3. Pass as --quiz-form-id=XXXXX
 *
 * ── What gets changed ───────────────────────────────────────────────────────
 *
 * Chat widget (<script> tag) inserted just before </body> in:
 *   marketing/index.html
 *   marketing/checkout.html
 *   marketing/success.html
 *   marketing/apply-ebay/index.html
 *   marketing/members/index.html
 *   marketing/ai/index.html
 *   marketing/affiliate/index.html
 *   marketing/quiz/index.html
 *
 * eBay form action URL in:
 *   marketing/apply-ebay/index.html
 *
 * Quiz form action URL in:
 *   marketing/quiz/index.html
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../');
const DRY_RUN = process.argv.includes('--dry-run');

// ─── Parse args + env ─────────────────────────────────────────────────────

function getArg(name) {
  const flag = `--${name}=`;
  const arg = process.argv.find(a => a.startsWith(flag));
  if (arg) return arg.slice(flag.length).trim();
  const envKey = name.replace(/-/g, '_').toUpperCase().replace(/^GHL_/, 'GHL_');
  // try GHL_CHAT_WIDGET_ID, GHL_EBAY_FORM_ID, GHL_QUIZ_FORM_ID
  const envMap = {
    'chat-widget-id': 'GHL_CHAT_WIDGET_ID',
    'ebay-form-id': 'GHL_EBAY_FORM_ID',
    'quiz-form-id': 'GHL_QUIZ_FORM_ID',
  };
  return process.env[envMap[name] || envKey] || null;
}

const chatWidgetId = getArg('chat-widget-id');
const ebayFormId   = getArg('ebay-form-id');
const quizFormId   = getArg('quiz-form-id');

// ─── Chat widget <script> template ─────────────────────────────────────────

function chatWidgetScript(widgetId) {
  return `<script src="https://widgets.leadconnectorhq.com/loader.js"
  data-resources-url="https://widgets.leadconnectorhq.com/chat-widget/loader.js"
  data-widget-id="${widgetId}">
</script>`;
}

// ─── File patch helpers ─────────────────────────────────────────────────────

function patchFile(relPath, patches) {
  const fullPath = path.join(REPO_ROOT, relPath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`  ⚠ File not found: ${relPath}`);
    return false;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;

  for (const { search, replace, description } of patches) {
    if (content.includes(search)) {
      content = content.replace(search, replace);
      console.log(`  ✓ ${description}`);
      changed = true;
    } else {
      console.log(`  – ${description} (already patched or not found)`);
    }
  }

  if (changed && !DRY_RUN) {
    fs.writeFileSync(fullPath, content, 'utf8');
  }

  return changed;
}

// ─── Main ──────────────────────────────────────────────────────────────────

console.log('\n🔌  GHL Placeholder Wiring Tool');
console.log(`   Mode: ${DRY_RUN ? '🟡 DRY-RUN (no writes)' : '🟢 LIVE'}\n`);

if (!chatWidgetId && !ebayFormId && !quizFormId) {
  console.log(`Usage:
  node server/src/tools/wire-ghl-placeholders.js \\
    --chat-widget-id=YOUR_WIDGET_ID \\
    --ebay-form-id=YOUR_EBAY_FORM_ID \\
    --quiz-form-id=YOUR_QUIZ_FORM_ID

All three are optional — run with just the ones you have.

How to get each ID:
  Chat widget ID:  GHL → Sites → Chat Widget → Get embed code → data-widget-id="..."
  eBay form ID:    GHL → Sites → Forms → [eBay form] → Embed URL → /form/XXXXX
  Quiz form ID:    GHL → Sites → Forms → [Quiz form] → Embed URL → /form/XXXXX
`);
  process.exit(0);
}

let totalChanged = 0;

// ─── 1. Chat widget ──────────────────────────────────────────────────────

if (chatWidgetId) {
  console.log(`\n💬 Chat widget → data-widget-id="${chatWidgetId}"`);
  const widgetScript = chatWidgetScript(chatWidgetId);

  const chatFiles = [
    'marketing/index.html',
    'marketing/checkout.html',
    'marketing/success.html',
    'marketing/apply-ebay/index.html',
    'marketing/members/index.html',
    'marketing/ai/index.html',
    'marketing/affiliate/index.html',
    'marketing/quiz/index.html',
  ];

  for (const file of chatFiles) {
    const changed = patchFile(file, [
      {
        search: '<!-- GHL_CHAT_WIDGET_PLACEHOLDER — see docs/chat-widget-setup.md -->',
        replace: widgetScript,
        description: `chat widget in ${file}`,
      },
      {
        search: '<!-- GHL_CHAT_WIDGET_PLACEHOLDER -->',
        replace: widgetScript,
        description: `chat widget in ${file}`,
      },
    ]);
    if (changed) totalChanged++;
  }
}

// ─── 2. eBay apply form ─────────────────────────────────────────────────

if (ebayFormId) {
  console.log(`\n📋 eBay apply form → form ID: ${ebayFormId}`);
  const changed = patchFile('marketing/apply-ebay/index.html', [
    {
      search: 'https://api.leadconnectorhq.com/widget/form/FORM_ID_PLACEHOLDER',
      replace: `https://api.leadconnectorhq.com/widget/form/${ebayFormId}`,
      description: 'eBay form action URL',
    },
    {
      search: "action.indexOf('FORM_ID_PLACEHOLDER') !== -1",
      replace: `action.indexOf('${ebayFormId}') === -1`,
      description: 'eBay form validation check',
    },
  ]);
  if (changed) totalChanged++;
}

// ─── 3. Quiz form ────────────────────────────────────────────────────────

if (quizFormId) {
  console.log(`\n📝 Quiz email capture form → form ID: ${quizFormId}`);
  const changed = patchFile('marketing/quiz/index.html', [
    {
      search: 'https://api.leadconnectorhq.com/widget/form/QUIZ_FORM_PLACEHOLDER',
      replace: `https://api.leadconnectorhq.com/widget/form/${quizFormId}`,
      description: 'Quiz form action URL',
    },
    {
      search: "action.indexOf('QUIZ_FORM_PLACEHOLDER') !== -1",
      replace: `action.indexOf('${quizFormId}') === -1`,
      description: 'Quiz form validation check',
    },
  ]);
  if (changed) totalChanged++;
}

// ─── Summary ─────────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(50));
if (DRY_RUN) {
  console.log(`DRY-RUN complete. ${totalChanged} file(s) would be changed.`);
  console.log('Run without --dry-run to apply.\n');
} else if (totalChanged > 0) {
  console.log(`✅ Done. ${totalChanged} file(s) updated.`);
  console.log('\nNext steps:');
  console.log('  git add marketing/');
  console.log('  git commit -m "wire: GHL chat widget + form IDs"');
  console.log('  git push  → Vercel auto-deploys in ~60 seconds\n');
} else {
  console.log('No changes made (all already wired or no matching placeholders found).\n');
}
