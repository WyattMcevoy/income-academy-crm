#!/usr/bin/env node
// Set up the Income Academy Foundation Pass bundle in Stripe:
//  - Product: "Income Academy Foundation Pass"
//  - Price 1: $47.00 USD one-time
//  - Price 2: $19.00 USD recurring monthly, with 7-day free trial
//  - Payment Link: includes both prices (customer pays $47 today +
//    subscribes to $19/mo with trial)
//
// SAFE BY DEFAULT: dry-run mode is ON. Script will tell you exactly what
// it would do but make no API calls until you pass --live.
//
// Prerequisites:
//   1. Stripe LLC + bank account set up (KYC complete)
//   2. STRIPE_SECRET_KEY environment variable set
//      - For TEST mode: sk_test_...
//      - For LIVE mode:  sk_live_...  (only flip after LLC is filed)
//   3. Node 18+ (uses built-in fetch — no new npm deps)
//
// Usage:
//   # Dry-run (default, safe — no API calls):
//   STRIPE_SECRET_KEY=sk_test_xxx node server/src/tools/setup-stripe-bundle.js
//
//   # Actually create in Stripe:
//   STRIPE_SECRET_KEY=sk_test_xxx node server/src/tools/setup-stripe-bundle.js --live
//
// Rollback (if you need to remove what this creates):
//   - In Stripe dashboard: archive the created Product + Prices + Payment Link
//   - Or: use the Stripe API with DELETE on the returned IDs

const DRY_RUN = !process.argv.includes('--live');
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

const PRODUCT = {
  name: 'Income Academy Foundation Pass',
  description: 'All 4 courses (AI Side Income, Affiliate Marketing, Estate Sale Sourcing, Bookkeeping) + AI Writing Assistant + community + monthly Q&As. 7-day free trial on the monthly membership. Cancel anytime.',
};

const PRICES = [
  {
    label: 'one_time_47',
    unit_amount: 4700, // $47.00 in cents
    currency: 'usd',
    recurring: null,
    nickname: 'Foundation Pass — $47 one-time',
  },
  {
    label: 'monthly_19_with_trial',
    unit_amount: 1900, // $19.00 in cents
    currency: 'usd',
    recurring: { interval: 'month', trial_period_days: 7 },
    nickname: 'Income Academy Membership — $19/mo (7-day trial)',
  },
];

const PAYMENT_LINK_META = {
  name: 'Foundation Pass Checkout',
  after_completion: {
    type: 'redirect',
    redirect: { url: 'https://incomeacademy.biz/success' },
  },
  allow_promotion_codes: true,
  metadata: {
    product_family: 'foundation_pass',
    created_by: 'setup-stripe-bundle.js',
  },
};

// ============================================================

const STRIPE_API = 'https://api.stripe.com/v1';

function prettyAmount(cents, currency) {
  return `$${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

function formBody(obj) {
  // Stripe API uses form-encoded bodies for POST requests, with dot notation
  // for nested objects (e.g. recurring[interval]=month)
  const params = new URLSearchParams();
  const walk = (value, prefix) => {
    if (value === null || value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((v, i) => walk(v, `${prefix}[${i}]`));
    } else if (typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) {
        walk(v, prefix ? `${prefix}[${k}]` : k);
      }
    } else {
      params.append(prefix, String(value));
    }
  };
  walk(obj, '');
  return params.toString();
}

async function stripeRequest(method, path, body) {
  if (DRY_RUN) {
    console.log(`   [DRY-RUN] ${method} ${path}`);
    if (body) console.log(`             body: ${JSON.stringify(body, null, 2).split('\n').join('\n             ')}`);
    return { id: `dry_run_${Math.random().toString(36).slice(2, 10)}`, __dry_run: true };
  }

  const url = `${STRIPE_API}${path}`;
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${STRIPE_KEY}`,
      'Stripe-Version': '2024-10-28.acacia',
    },
  };
  if (body) {
    options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    options.body = formBody(body);
  }

  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Stripe API error (${res.status}): ${data.error?.message || JSON.stringify(data)}`);
  }
  return data;
}

async function findExistingProduct() {
  // Check if we've already created this product (idempotent re-runs)
  if (DRY_RUN) return null;
  const data = await stripeRequest('GET', '/products?active=true&limit=100');
  return data.data?.find(p => p.name === PRODUCT.name) || null;
}

async function main() {
  console.log('🔷 Stripe Foundation Pass Bundle Setup');
  console.log(`   Mode: ${DRY_RUN ? '🟡 DRY-RUN (no API calls)' : '🔴 LIVE (will create in Stripe)'}`);
  console.log();

  if (!STRIPE_KEY && !DRY_RUN) {
    console.error('✗ STRIPE_SECRET_KEY environment variable required for live mode');
    console.error('  Set it: export STRIPE_SECRET_KEY=sk_test_xxx');
    process.exit(1);
  }
  if (!STRIPE_KEY) {
    console.log('⚠  No STRIPE_SECRET_KEY set — dry-run output will show structure only');
    console.log();
  } else if (STRIPE_KEY.startsWith('sk_test_')) {
    console.log('ℹ  Using TEST mode key (safe to experiment)');
    console.log();
  } else if (STRIPE_KEY.startsWith('sk_live_')) {
    console.log('⚠  Using LIVE mode key — real products will be created on your Stripe account');
    if (!DRY_RUN) {
      console.log('   Proceeding in 3 seconds... Ctrl+C to abort.');
      await new Promise(r => setTimeout(r, 3000));
    }
    console.log();
  }

  // Step 1: Check for existing product (idempotent)
  console.log('→ Step 1: Check for existing product');
  const existing = await findExistingProduct();
  if (existing) {
    console.log(`   Found existing product: ${existing.id} — using it`);
    var product = existing;
  } else {
    console.log('   No existing product found — creating new one');
    product = await stripeRequest('POST', '/products', PRODUCT);
    console.log(`   ✓ Created product: ${product.id}`);
  }
  console.log();

  // Step 2: Create prices
  console.log('→ Step 2: Create two Prices');
  const createdPrices = [];
  for (const price of PRICES) {
    console.log(`   Creating: ${price.nickname} (${prettyAmount(price.unit_amount, price.currency)})`);
    const body = {
      product: product.id,
      unit_amount: price.unit_amount,
      currency: price.currency,
      nickname: price.nickname,
    };
    if (price.recurring) {
      body.recurring = price.recurring;
    }
    const created = await stripeRequest('POST', '/prices', body);
    createdPrices.push({ label: price.label, id: created.id, config: price });
    console.log(`   ✓ Created: ${created.id}`);
  }
  console.log();

  // Step 3: Create payment link with both prices
  console.log('→ Step 3: Create Payment Link with both prices');
  const paymentLinkBody = {
    line_items: createdPrices.map(p => ({ price: p.id, quantity: 1 })),
    ...PAYMENT_LINK_META,
  };
  const paymentLink = await stripeRequest('POST', '/payment_links', paymentLinkBody);
  console.log(`   ✓ Created Payment Link: ${paymentLink.id}`);
  console.log();

  // Summary
  console.log('━'.repeat(60));
  if (DRY_RUN) {
    console.log('DRY-RUN COMPLETE — nothing was actually created in Stripe.');
    console.log('To execute for real, re-run with: --live');
  } else {
    console.log('✓ BUNDLE CREATED IN STRIPE');
    console.log();
    console.log(`Product ID:      ${product.id}`);
    console.log(`Price (one-time): ${createdPrices[0].id}`);
    console.log(`Price (monthly):  ${createdPrices[1].id}`);
    console.log(`Payment Link ID:  ${paymentLink.id}`);
    console.log();
    console.log('━'.repeat(60));
    console.log();
    console.log('🔗 Payment Link URL (paste this into marketing/checkout.html):');
    console.log();
    console.log(`   ${paymentLink.url}`);
    console.log();
    console.log('━'.repeat(60));
    console.log();
    console.log('Next steps:');
    console.log('  1. Open marketing/checkout.html');
    console.log(`  2. Replace the href of #stripe-cta with: ${paymentLink.url}`);
    console.log('  3. Commit + push → Vercel deploys → checkout is live');
    console.log();
    console.log('Rollback:');
    console.log(`  - Stripe dashboard → archive Product ${product.id} and Prices`);
    console.log(`  - Or DELETE via API: stripe products ${product.id}`);
  }
}

main().catch(err => {
  console.error('\n✗ Failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
