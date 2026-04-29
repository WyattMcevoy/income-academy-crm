#!/usr/bin/env node
/**
 * Imports the recurring SaaS expenses listed in docs/recurring-expenses.md
 * into the Income Academy CRM via the Expenses API.
 *
 * Usage:
 *   1. Log into https://dashboard.incomeacademy.biz
 *   2. Open browser DevTools → Application → Local Storage → copy the JWT token
 *      (or use the same token your /api/expenses requests are using)
 *   3. Run:
 *        TOKEN='eyJ...' node server/src/tools/import-recurring-expenses.js
 *
 * Idempotent: skips entries whose description already exists in the user's
 * expense list for the same incurred_on date.
 *
 * --dry-run flag prints what would be created without hitting the API.
 */

const API_BASE = process.env.API_BASE || 'https://income-academy-crm.onrender.com';
const TOKEN = process.env.TOKEN;

const DRY_RUN = process.argv.includes('--dry-run');

if (!TOKEN && !DRY_RUN) {
  console.error('✗ TOKEN env var required. Run: TOKEN="eyJ..." node server/src/tools/import-recurring-expenses.js');
  console.error('  (or pass --dry-run to preview without an API call)');
  process.exit(1);
}

// Each entry represents the "first charge" we want to record. Add more
// (with future incurred_on dates) when monthly bills land.
const ENTRIES = [
  {
    description: 'GoHighLevel Agency Subscription — Monthly',
    amount_cents: 10355,
    incurred_on: '2026-05-05',
    category: 'SaaS — Recurring',
    notes: 'AmEx ····2000. First charge after free trial ends. $103.55/mo, monthly auto-renew.',
  },
  {
    description: 'Google Workspace (incomeacademy.biz) — Monthly',
    amount_cents: 600, // assumes Standard $6/mo per user; adjust after first bill
    incurred_on: '2026-05-01',
    category: 'SaaS — Recurring',
    notes: 'Username: Wyatt@incomeacademy.biz. Paid subscription begins May 1, 2026. Update amount once first bill lands.',
  },
  {
    description: 'Namecheap — incomeacademy.biz domain',
    amount_cents: 1300,
    incurred_on: '2027-04-22', // TBD: confirm actual renewal date
    category: 'Domains — Annual',
    notes: 'Annual renewal. Confirm exact renewal date in Namecheap dashboard.',
  },
  {
    description: 'Namecheap — incomeacademymail.com domain',
    amount_cents: 1300,
    incurred_on: '2027-04-22', // TBD: confirm actual renewal date
    category: 'Domains — Annual',
    notes: 'MailerLite sending domain. Annual renewal. Confirm exact renewal date.',
  },
  {
    description: 'HeyGen API prepaid balance',
    amount_cents: 1000,
    incurred_on: '2026-04-29',
    category: 'SaaS — Usage',
    notes: '$10 prepaid balance for AI avatar video generation (Saffron/Linda). Tops up usage-based.',
  },
];

async function listExisting() {
  const res = await fetch(`${API_BASE}/api/expenses`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) {
    throw new Error(`GET /api/expenses → ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function createExpense(entry) {
  const res = await fetch(`${API_BASE}/api/expenses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  });
  if (!res.ok) {
    throw new Error(`POST /api/expenses → ${res.status} ${await res.text()}`);
  }
  return res.json();
}

(async () => {
  console.log(`→ Recurring expense import (${ENTRIES.length} entries)`);
  if (DRY_RUN) {
    console.log('  [DRY RUN — no API calls will be made]\n');
  }

  let existing = [];
  if (!DRY_RUN) {
    try {
      existing = await listExisting();
      console.log(`  ${existing.length} existing expense(s) on this account\n`);
    } catch (e) {
      console.error('✗ Failed to fetch existing expenses:', e.message);
      console.error('  Check that TOKEN is valid and API is reachable.');
      process.exit(2);
    }
  }

  let created = 0;
  let skipped = 0;
  for (const entry of ENTRIES) {
    const dup = existing.find(
      (e) => e.description === entry.description && e.incurred_on?.slice(0, 10) === entry.incurred_on,
    );
    if (dup) {
      console.log(`  ⊘ skip (already exists): ${entry.description} on ${entry.incurred_on}`);
      skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`  + would create: ${entry.description} | $${(entry.amount_cents / 100).toFixed(2)} | ${entry.incurred_on}`);
      created++;
      continue;
    }

    try {
      const result = await createExpense(entry);
      console.log(`  ✓ created #${result.id}: ${entry.description} | $${(entry.amount_cents / 100).toFixed(2)}`);
      created++;
    } catch (e) {
      console.error(`  ✗ failed: ${entry.description} — ${e.message}`);
    }
  }

  console.log(`\n${DRY_RUN ? '[DRY RUN] ' : ''}Done. ${created} created, ${skipped} skipped.`);
})();
