#!/usr/bin/env node
// End-to-end smoke test for the Income Academy marketing site.
// Checks all critical URLs respond correctly + contain expected content.
// Catches deployment regressions (broken deploys, middleware breaks,
// DNS/SSL issues, content drift).
//
// Run after any merge to main, or on a cron schedule.
//
// Usage:
//   node server/src/tools/e2e-smoke-test.js
//
// Exit codes:
//   0 = all checks passed
//   1 = at least one check failed
//
// No dependencies — uses Node 18+ built-in fetch.

const BASE = 'https://incomeacademy.biz';
const AI_SUBDOMAIN = 'https://ai.incomeacademy.biz';
const AFF_SUBDOMAIN = 'https://affiliate.incomeacademy.biz';

// ============================================================
// Check definitions
// ============================================================

const checks = [
  // Main domain — public, expects 200 + specific content patterns
  {
    name: 'Main site renders Foundation Pass hero',
    url: `${BASE}/`,
    expectStatus: [200, 301, 302, 307, 308], // main domain may redirect to www
    expectContent: ['Foundation Pass', 'Income Academy'],
    followRedirects: true,
  },
  {
    name: 'Checkout page renders bundle order summary',
    url: `${BASE}/checkout`,
    expectStatus: [200, 301, 302, 307, 308],
    expectContent: ['Foundation Pass', '$47'],
    followRedirects: true,
  },
  {
    name: 'Members dashboard renders',
    url: `${BASE}/members`,
    expectStatus: [200, 301, 302, 307, 308],
    expectContent: ['Foundation Pass', 'Members Area'],
    followRedirects: true,
  },
  {
    name: 'Apply-eBay page renders',
    url: `${BASE}/apply-ebay`,
    expectStatus: [200, 301, 302, 307, 308],
    expectContent: ['eBay', 'Apply'],
    followRedirects: true,
  },

  // Legal pages — must exist for compliance
  {
    name: 'Privacy policy page exists',
    url: `${BASE}/privacy`,
    expectStatus: [200, 301, 302, 307, 308],
    expectContent: ['Privacy'],
    followRedirects: true,
  },
  {
    name: 'Terms page exists',
    url: `${BASE}/terms`,
    expectStatus: [200, 301, 302, 307, 308],
    expectContent: ['Terms'],
    followRedirects: true,
  },
  {
    name: 'Refund page exists',
    url: `${BASE}/refund`,
    expectStatus: [200, 301, 302, 307, 308],
    expectContent: ['Refund'],
    followRedirects: true,
  },
  {
    name: 'Disclaimer page exists',
    url: `${BASE}/disclaimer`,
    expectStatus: [200, 301, 302, 307, 308],
    expectContent: ['Disclaimer'],
    followRedirects: true,
  },

  // Static assets
  {
    name: 'Favicon SVG loads',
    url: `${BASE}/favicon.svg`,
    expectStatus: [200, 301, 302, 307, 308],
    followRedirects: true,
  },
  {
    name: 'Main stylesheet loads',
    url: `${BASE}/styles.css`,
    expectStatus: [200, 301, 302, 307, 308],
    expectContent: ['--gold', '--navy'],
    followRedirects: true,
  },

  // AI subdomain — password-gated, expects 401
  {
    name: 'AI subdomain prompts for auth (middleware working)',
    url: `${AI_SUBDOMAIN}/`,
    expectStatus: [401],
    expectHeaders: { 'www-authenticate': /Basic/i },
  },

  // Affiliate subdomain — password-gated, expects 401
  {
    name: 'Affiliate subdomain prompts for auth',
    url: `${AFF_SUBDOMAIN}/`,
    expectStatus: [401],
    expectHeaders: { 'www-authenticate': /Basic/i },
  },
];

// ============================================================
// Runner
// ============================================================

function pass(msg) { return { ok: true, msg }; }
function fail(msg) { return { ok: false, msg }; }

async function runCheck(check) {
  try {
    const res = await fetch(check.url, {
      method: 'GET',
      redirect: check.followRedirects ? 'follow' : 'manual',
    });
    const finalStatus = res.status;

    // Status check
    const statusOk = Array.isArray(check.expectStatus)
      ? check.expectStatus.includes(finalStatus)
      : finalStatus === check.expectStatus;
    if (!statusOk) {
      return fail(`${check.name}\n     Expected status ${check.expectStatus}, got ${finalStatus}`);
    }

    // Headers check
    if (check.expectHeaders) {
      for (const [headerName, pattern] of Object.entries(check.expectHeaders)) {
        const actual = res.headers.get(headerName);
        if (!actual) {
          return fail(`${check.name}\n     Expected header "${headerName}" missing`);
        }
        if (pattern instanceof RegExp && !pattern.test(actual)) {
          return fail(`${check.name}\n     Header "${headerName}" = "${actual}" does not match ${pattern}`);
        }
      }
    }

    // Content check
    if (check.expectContent) {
      const body = await res.text();
      for (const pattern of check.expectContent) {
        if (!body.toLowerCase().includes(pattern.toLowerCase())) {
          return fail(`${check.name}\n     Content missing substring: "${pattern}"`);
        }
      }
    }

    return pass(check.name);
  } catch (err) {
    return fail(`${check.name}\n     Network/fetch error: ${err.message}`);
  }
}

async function main() {
  console.log('🧪 E2E smoke test — Income Academy');
  console.log(`   ${checks.length} checks`);
  console.log();

  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const check of checks) {
    const result = await runCheck(check);
    if (result.ok) {
      console.log(`   ✓ ${result.msg}`);
      passed++;
    } else {
      console.log(`   ✗ ${result.msg}`);
      failures.push(result.msg);
      failed++;
    }
  }

  console.log();
  console.log('━'.repeat(60));
  console.log(`Passed: ${passed}/${checks.length}   Failed: ${failed}`);
  console.log('━'.repeat(60));

  if (failed > 0) {
    console.log();
    console.log('FAILURES:');
    failures.forEach(f => console.log(`  ✗ ${f}`));
    console.log();
    process.exit(1);
  } else {
    console.log();
    console.log('🎉 All checks passed — site is healthy.');
  }
}

main().catch(err => {
  console.error('\n✗ Smoke test harness crashed:', err.message);
  process.exit(1);
});
