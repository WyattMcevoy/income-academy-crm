# PayPal Backup Processor Setup (Phase 6b)

How to activate PayPal as a backup payment option on the checkout page. Stripe remains primary; PayPal is the fallback for customers who prefer it OR if Stripe has an outage.

**Status after this PR merges**: The checkout page is PayPal-ready — a "Pay with PayPal" button is in the code but hidden until you paste in a real PayPal Payment Link URL. Until then, only the Stripe button shows, so there's no customer-facing change if you don't finish this setup yet.

---

## Why Payment Links instead of the PayPal SDK

Two reasons:
1. **Zero new dependencies** — honors LVL V1 rule #4. No npm packages, no server code, no webhook integration required.
2. **Backup-appropriate** — this is a redundancy option, not a primary flow. A full SDK integration is over-engineering for this job.

Trade-off: you manually fulfill PayPal orders (provision the GHL account yourself) until/unless you wire up PayPal IPN/webhooks later. For a backup that gets <10% of orders, manual is fine.

---

## Part 1: Create the Payment Link in PayPal

1. Log into `https://www.paypal.com/` (use your PayPal Business account)
2. Go to **Pay & Get Paid** → **Hyperlinks** (older UI) OR **Checkout** → **Payment links** (newer UI)
3. Click **Create payment link** (or **+ New payment link**)
4. Fill in:
   - **Name**: `Income Academy Starter Training`
   - **Amount**: `$47.00 USD` (fixed)
   - **Allow shipping?** No
   - **Allow custom amount?** No
   - **Thank-you URL after payment**: `https://incomeacademy.biz/success`
   - **Cancel URL**: `https://incomeacademy.biz/checkout`
   - **Include custom note field**: leave off (reduces friction)
5. Save / Create
6. PayPal will generate a URL like `https://www.paypal.com/ncp/payment/ABC123DEF456`
7. **Copy that URL** — you'll paste it in the next step

## Part 2: Paste the URL into checkout.html

In the repo: [marketing/checkout.html](marketing/checkout.html)

Find this line (around line ~130):
```html
<a href="PAYPAL_LINK_PLACEHOLDER" class="pay-secondary" id="paypal-cta">
```

Replace `PAYPAL_LINK_PLACEHOLDER` with the URL you copied from PayPal. Commit. Vercel auto-deploys. The PayPal button now appears on the checkout page.

(The JavaScript at the bottom of `checkout.html` keeps the PayPal button hidden while it's still showing the placeholder string, so customers never see a broken link.)

## Part 3: Test it end-to-end

1. Go to `https://incomeacademy.biz/checkout`
2. You should now see two payment options: Stripe (primary gold button) and PayPal (outlined secondary button below)
3. Click "Pay with PayPal"
4. Use PayPal's **sandbox mode** or a real test card to complete a $47 transaction
5. Verify you're redirected to `/success` after payment
6. Check your PayPal inbox for the "You got a payment!" notification
7. Verify the amount + customer email are correct

## Part 4: Manual fulfillment workflow (until you add webhooks)

When a PayPal order comes in:

1. You get an email from PayPal: "You've received a payment."
2. Log into PayPal → copy the buyer's email address
3. Log into GHL → provision the course for that email (same process you'd do for any manual GHL contact add)
4. MailerLite won't auto-trigger since it's wired to Stripe — send the buyer a welcome manually OR add them to the "Starter Program Buyers" group
5. Mark the PayPal transaction as "fulfilled" in your own notes/CRM

This is fine for low-volume backup usage. If PayPal ever becomes >20% of orders, upgrade to webhook-based auto-fulfillment (see Part 5).

## Part 5: Future upgrade — PayPal IPN / webhooks (not doing now)

When volume justifies it, PayPal IPN (Instant Payment Notification) or webhooks can auto-fulfill the same way Stripe does. This requires:
- Adding a new server endpoint: `server/src/routes/paypal-webhook.js`
- Adding `PAYPAL_WEBHOOK_SECRET` to Render env vars
- Adding PayPal IPN URL in PayPal account settings

That's Phase 6c, tracked separately. Don't do it until the manual process becomes annoying.

## Rollback

If PayPal integration causes any issue:
1. In `marketing/checkout.html`, change the PayPal button's `href` back to `PAYPAL_LINK_PLACEHOLDER`
2. Commit + push
3. Vercel auto-deploys (~60 sec) → the JS hides the PayPal button again → checkout page is Stripe-only as before

---

## Security notes

- **The PayPal Payment Link URL is public** (it's a URL anyone can visit to pay you $47). Not a secret. Safe to commit to the repo.
- PayPal never receives your Stripe keys. Stripe never receives your PayPal keys. They're isolated.
- If someone pays through PayPal for a refund test, refund it from PayPal (not Stripe).
- Your 7-day refund policy applies to both processors equally.
