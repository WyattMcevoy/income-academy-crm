# Foundation Pass — Pre-Launch Checklist

Everything that must be TRUE before flipping the site to public-promotion mode (paid ads, organic content campaigns, press outreach). Treat as a gate — don't run paid traffic until every "must" item is checked.

---

## Tier 1 — MUST be done before any paid traffic

### Legal entity
- [ ] Utah LLC formed and registered
- [ ] EIN issued by IRS
- [ ] Business bank account opened (Mercury / Relay / similar)
- [ ] Virtual mailbox set up (iPostal1 Utah, or similar)
- [ ] Mailing address updated on every page footer that says "[BUSINESS_ADDRESS]"
- [ ] Mailing address updated in welcome email template footer

### Payments
- [ ] Stripe live mode toggled (post-LLC + KYC)
- [ ] Bundle Payment Link created in Stripe Live ($47 + $19/mo with 7-day trial)
- [ ] Live URL pasted into `marketing/checkout.html` (replace test URL)
- [ ] Test purchase made with a real card → confirmed receipt + GHL provision works
- [ ] Refund tested end-to-end → confirmed working
- [ ] Cancellation flow tested → confirmed working
- [ ] PayPal Payment Link created and pasted (optional but recommended)

### Course content
- [x] ~~All 4 courses uploaded to GHL with at least text content for every module~~ — ✅ all 9 modules × 4 courses done
- [ ] Course thumbnails uploaded (1280×720 — generated from `marketing/brand/course-thumbs/*.svg`, PNGs at `marketing/brand/png-exports/`)
- [ ] Member portal custom domain (`portal.incomeacademy.biz`) live + SSL verified
- [ ] AI Writing Assistant Claude Project created and link in member portal
- [x] ~~Course URLs replaced in `marketing/members/index.html`~~ — ✅ wired via `marketing/members/ghl-config.js` (Apr 29)

### Email automations
- [ ] Welcome email sequence (7 emails) loaded into MailerLite or GHL automations
- [ ] Email "From" address verified (deliverability check)
- [ ] Email banner image uploaded (`marketing/brand/emails/email-banner-600.svg` converted to PNG)
- [ ] Email footer image uploaded
- [ ] CAN-SPAM compliant footer on every email (mailing address + unsubscribe + reply-to)
- [ ] Test email sent end-to-end → arrived in inbox (not spam)

### Compliance
- [ ] Earnings disclaimer reviewed by attorney (if budget allows)
- [ ] Engagement letter template (Bookkeeping course) reviewed by attorney
- [ ] FTC Biz Opp Rule reviewed for the eBay Done-With-You program (this is the highest-risk piece — counsel review recommended before public marketing)
- [ ] Privacy Policy reflects actual data practices
- [ ] Terms of Service reflects actual offer (bundle, trial, refund policy)
- [ ] Refund policy page matches what's promised at checkout

### Site quality
- [ ] All landing pages render correctly on mobile (test on actual phone, not just desktop responsive mode)
- [ ] All CTAs lead to working URLs (no `PAYPAL_LINK_PLACEHOLDER` or `GHL_*` placeholder strings deployed)
- [ ] All images load (no broken `<img>` references)
- [x] ~~e2e smoke test passes~~ — ✅ 14/14 passing (May 29, 2026)
- [ ] Robots.txt + sitemap.xml deployed and accessible
- [ ] Subdomain password (`MARKETING_PREVIEW_PASSWORD`) updated for launch (or removed if subdomains are now public)

---

## Tier 2 — STRONGLY recommended before paid traffic

### Brand assets (raster versions)
- [ ] PNG versions of logo set generated (run `npm install --save-dev puppeteer` then `node server/src/tools/svg-to-png.js`)
- [ ] PNGs uploaded to GHL (logos + course thumbnails)
- [ ] Favicon set generated and added to `marketing/` root (favicon-32.png, apple-touch-icon-180.png)
- [ ] Hero photography/video generated for AI + Affiliate subdomains (AI image tool prompts in `docs/asset-generation-prompts.md`)

### Tracking + analytics
- [ ] Meta Pixel installed on landing pages (placeholder script exists in HTML head — needs real ID)
- [ ] Google Analytics 4 installed (placeholder exists)
- [ ] Google Search Console verified ownership of `incomeacademy.biz`
- [ ] Sitemap submitted to Google Search Console
- [ ] UTM tracking convention documented and shared with team (see `docs/utm-tracking.md`)

### Lead capture
- [ ] GHL chat widget configured + embed snippet in all 4 landing pages (replace `GHL_CHAT_WIDGET_PLACEHOLDER`)
- [ ] eBay Apply form endpoint live in `marketing/apply-ebay/index.html` (replace `FORM_ID_PLACEHOLDER`)
- [ ] eBay Apply form submissions tested end-to-end (apply → GHL contact created → notification email)

### Sales team readiness
- [ ] Phone team trained on Foundation Pass sales script (`docs/sales-team-foundation-pass-script.md`)
- [ ] Phone team trained on per-course scripts (Estate Sale + Bookkeeping have specific scripts)
- [ ] CRM access for phone team configured
- [ ] Inbox monitoring schedule set (someone reads support@incomeacademy.biz daily)

### Legal / compliance polish
- [ ] State sales tax review for Utah LLC (most digital education is exempt, but confirm)
- [ ] FTC endorsement disclosure language reviewed for any testimonials shown
- [ ] Affiliate disclosure language present on AI + Affiliate landing pages
- [ ] No "guaranteed income" language anywhere on the site (search and verify)

---

## Tier 3 — Nice to have, not blocking

- [ ] Open Graph PNG images generated and committed (already SVG, conversion to PNG improves Facebook/Twitter share rendering)
- [ ] Twitter Card preview tested (Twitter's card validator)
- [ ] LinkedIn share preview tested
- [ ] Schema.org JSON-LD added to landing pages (FAQ structured data — see `docs/jsonld-faq.md`)
- [ ] Newsletter opt-in flow built for non-buyer leads
- [ ] Course completion certificates template (members who finish a course get a downloadable PDF)
- [ ] Quiz: "Which course is right for you?" lead-gen tool live
- [ ] Member referral / affiliate program scaffolded (when you have ~20 members and want to recruit affiliates)

---

## Pre-launch dry run (do this in a 60-min block 2-3 days before launching)

1. Visit `https://incomeacademy.biz/` in incognito → does it look right?
2. Click each course tab in Members Area → all 4 + locked eBay tile work
3. Click Pricing CTA → checkout page renders, Stripe button works
4. Complete a real $47 + $19/mo purchase with a real card
5. Receive welcome email within 5 minutes (check it looks branded, not GHL default)
6. Click login link → land on `portal.incomeacademy.biz` → set password → see 4 courses
7. Click into one course → modules + lessons render correctly
8. Open AI Writing Assistant Claude Project → test with sample question
9. Visit `incomeacademy.biz/members` → branded dashboard, course tiles link to GHL
10. Visit `incomeacademy.biz/apply-ebay` → form works, submit goes to GHL
11. Cancel the membership in one click from portal → confirms cancel flow
12. Refund the $47 from Stripe → confirms refund flow
13. Run `node server/src/tools/e2e-smoke-test.js` → all 12 pass

If any step fails: don't launch. Fix and re-run.

---

## Day-of-launch monitoring

- First 24 hours: refresh inbox + Stripe + GHL every 2 hours
- Watch for: failed payments, refund requests, broken member experiences, support emails, social media mentions
- Have rollback ready: every change in this codebase has `git revert` documented in commit messages
- Have a friend/colleague run the full purchase flow as a real user before announcing

Don't announce more loudly than your support capacity can handle. Better 5 happy buyers than 50 frustrated ones.

---

## Post-launch (first 30 days)

- [ ] Daily: check Stripe + GHL + email inbox for any issues
- [ ] Day 7: review first cohort's behavior — did anyone hit `/refund`? Why?
- [ ] Day 14: pull e2e smoke test data — anything regressed?
- [ ] Day 30: cohort analysis — % who logged in, % completing Module 0, % progressing past Module 3
- [ ] Day 30: collect 1-2 honest testimonials (with permission + FTC-safe disclaimers)
- [ ] Day 30: identify the most common support question → consider adding to FAQ or course content
- [ ] Day 60: first quarterly content update review (per the `docs/automation-scripts.md` rebuild cadence)
