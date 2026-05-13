# GHL Outage Runbook

What to do when GoHighLevel goes down. GHL is your CRM, course host, email sender, form handler, automation engine, and chat widget — single point of failure on most of the business. This runbook keeps you operating until it's back.

**Last updated**: 2026-05-12

---

## When to use this

Trigger this runbook if ANY of the following are true for **more than 15 minutes**:

- GHL portal (`app.gohighlevel.com`) returns 5xx or won't load
- `portal.incomeacademy.biz` (member course portal) returns 5xx
- Workflow emails not firing (test by submitting a known-good form, watch for confirmation email)
- Form submissions on `incomeacademy.biz` not creating contacts
- Members report "can't log in to courses"

Don't trigger on a single 30-second blip. Trigger on a confirmed sustained outage.

---

## Phase 1 — Confirm (first 15 min)

1. Check GHL status: [status.gohighlevel.com](https://status.gohighlevel.com)
2. Try GHL portal from a different network (phone hotspot) — rules out your ISP
3. Try the member portal `portal.incomeacademy.biz` directly
4. If GHL is confirmed down: proceed to Phase 2. If only your account is affected: contact GHL support (`billing@gohighlevel.com`, `+1 888-732-4197`) and skip to Phase 4.

---

## Phase 2 — Stop the bleeding (within 30 min)

1. **Pause Meta ads.** Don't burn ad budget driving traffic to a broken funnel.
   - Meta Ads Manager → all active campaigns → pause
2. **Pin a banner to the site** announcing brief outage. Edit [marketing/index.html](../marketing/index.html) and add a top banner:
   ```html
   <div style="background:#fff3cd;padding:12px;text-align:center;border-bottom:1px solid #ffeaa7;">
     <strong>Brief portal maintenance</strong> — fully restored shortly. Email <a href="mailto:support@incomeacademy.biz">support@incomeacademy.biz</a> if urgent.
   </div>
   ```
   Commit + push → Vercel auto-deploys in ~60 seconds.
3. **Disable PayPal + Stripe checkout temporarily** if the outage is preventing course delivery — replace the "Buy" buttons with the banner explanation. No point taking money if the buyer can't access what they bought.

---

## Phase 3 — Communicate with members (within 2 hours)

Members are source of truth in Stripe Dashboard, NOT GHL. Don't wait for GHL to come back to email people.

1. **Export Stripe customer list** as backup:
   - Stripe Dashboard → Customers → Export → CSV
2. **Use MailerLite as the emergency sender** (NOT GHL). MailerLite is kept warmed for exactly this purpose.
   - Subject: "Brief Income Academy portal hiccup — your access is safe"
   - Body: explain the outage, confirm subscription is unaffected, ETA if known, link to support email, apology for inconvenience
3. **Skip social posts unless outage > 4 hours.** Quiet small-blip outages, communicate clearly on long ones.

---

## Phase 4 — Provide emergency access (if outage > 4 hours)

Course content is in this repo at `docs/courses/` — can be served as static HTML from `incomeacademy.biz/courses-emergency/`.

1. Copy `docs/courses/<course-name>/lessons-html/*` to `marketing/courses-emergency/<course-name>/`
2. Add a simple index page listing each course
3. Push to deploy
4. Email active members a magic link to the emergency portal (password-gated using a single shared password, communicated in the email)

Detailed copy-paste commands in [docs/automation-scripts.md](automation-scripts.md) under "Emergency course portal."

---

## Phase 5 — Recovery (when GHL comes back)

Don't assume recovery is clean. Run these checks:

1. **Spot-check 3 random members:** are they tagged correctly, in the right pipeline stage, with the right subscription status?
2. **Check workflow queue:** did trial-end emails fire late? Did any fire INCORRECTLY (e.g., canceling members who actually paid)?
3. **Reconcile against Stripe:** every Stripe-active customer should be a GHL-active member. Anyone in Stripe but not GHL needs re-provisioning.
4. **Form submissions during outage:** were any lost? Check form endpoint logs. Test-submit one yourself to verify pipe is restored.
5. **Resume paid traffic** only after the above 4 checks pass.
6. **Remove the banner** from the site.

---

## Phase 6 — Refund offers (if outage > 24 hours)

If members lost access for a full day or more, proactively offer:

- **1 free month** (apply credit in Stripe → no charge next billing cycle)
- **Or pro-rated refund** for the lost days

This converts a brand-damage event into a loyalty event. Email template:

> Subject: A free month on us — apology for yesterday's outage
>
> Yesterday our portal was down for [N hours]. That's not the experience we promise. As an apology, I've credited your account for a free month — you won't be charged on your next billing date. No action needed.
>
> If you have any frustration to share, hit reply. I read every one.
>
> — Wyatt

---

## What you have that GHL can't take away

Critical: these are your real moats. Outages can't touch them.

| Asset | Where it lives | Recovery time if GHL is GONE forever |
|---|---|---|
| Customer list (active payers) | Stripe Dashboard | Instant |
| Customer list (leads) | Latest GHL weekly backup CSV (see below) | <1 week stale |
| Course content (all 4 courses) | This Git repo `docs/courses/` | Instant |
| Course videos | YouTube unlisted + S3 backup | Instant |
| Email templates | This Git repo + MailerLite | Instant |
| Domain | Namecheap | Instant |

The two things you actually can't lose: **Stripe + Git**. Everything else is rebuildable in days, not weeks.

---

## Prevention — what to set up BEFORE outages happen

### Weekly GHL backup (automated)

See [scripts/backup-ghl-contacts.sh](../scripts/backup-ghl-contacts.sh). Runs every Sunday 2am UTC, exports GHL contacts to a CSV file, stores it in `backups/ghl-contacts-YYYY-MM-DD.csv`, retains 12 weeks rolling. Email yourself a notification on completion.

### MailerLite kept warmed

- Send one newsletter per month minimum so the sending domain stays warm
- Don't let MailerLite go dormant — when you need it as emergency sender, dormant = poor deliverability

### Render Starter ($7/mo) for the API

API cold starts (50 seconds after 15 min idle on free tier) make the site feel broken even when nothing is wrong. Upgrade to Render Starter the day you turn on paid traffic. See "Render upgrade steps" below.

### Course content static fallback

Course HTML lives in repo at `docs/courses/<name>/lessons-html/`. Already there — no setup needed. Just remember it's there when you need it.

---

## Render upgrade steps (do this before public launch)

1. Log in to [render.com](https://render.com)
2. Navigate to the Income Academy API service
3. Settings → Instance Type → upgrade from **Free** to **Starter ($7/mo)**
4. Confirm. New instance type takes effect on next deploy (or click "Manual Deploy" to apply now).
5. Verify: open the API root URL, refresh after 20 minutes idle, should respond instantly (no 50s wait).

**Why $7/mo is worth it:** the first visitor after 15 min idle on Free tier waits ~50 seconds for the server to wake. Industry data: 30%+ of users abandon after 10 seconds. You're losing 30% of cold-traffic conversions silently every day on Free tier.

---

## Contact escalation

| Issue | Contact |
|---|---|
| GHL billing / urgent support | `billing@gohighlevel.com`, +1 888-732-4197 |
| Stripe account issues | Stripe Dashboard → Help → Contact |
| Render outage | [status.render.com](https://status.render.com), `support@render.com` |
| Vercel outage | [vercel-status.com](https://vercel-status.com) |
| Neon (Postgres) outage | [neonstatus.com](https://neonstatus.com) |

---

## Rollback

This runbook is documentation only — no code, no risk. If procedures here turn out wrong, edit this file. If a step caused harm (e.g., banner deploy broke the site), revert the commit: `git revert <sha>`.
