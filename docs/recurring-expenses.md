# Recurring SaaS expenses — Income Academy

Source of truth for monthly/annual spend. Mirrors what should be entered into the CRM Expenses page (`dashboard.incomeacademy.biz` → Expenses).

**Last updated**: April 29, 2026

---

## Active subscriptions

| Service | Cost | Cadence | Charged to | Next charge | Notes |
|---|---|---|---|---|---|
| GoHighLevel Agency Subscription | $103.55 | monthly | AmEx ····2000 | May 5, 2026 | Free trial ends May 5, 2026; auto-charge unless canceled. Manage at billing@gohighlevel.com or +1 888-732-4197. |
| Google Workspace (incomeacademy.biz) | TBD | monthly | TBD | May 1, 2026 (start) | Username Wyatt@incomeacademy.biz; paid subscription begins May 1, 2026. Confirm Standard tier ($6/user/mo) vs Business ($12/user/mo). |
| HeyGen API | $10 prepaid | usage-based | prepaid | n/a | Avatar video generation. Burns down per video render. |
| Vercel | Free (Hobby) | n/a | n/a | n/a | Marketing + dashboard hosting. Upgrade to Pro at $20/user/mo if team grows. |
| Render | Free | n/a | n/a | n/a | API server. ~50s cold-start after 15 min idle. Starter $7/mo would remove that. |
| Neon | Free | n/a | n/a | n/a | Postgres. Scale to Pro $19/mo when ≥1 active paying member. |
| MailerLite | Free (≤1000 subs) | n/a | n/a | n/a | Tier upgrade trigger: 1000+ subscribers. |
| Stripe | 2.9% + $0.30 | usage-based | per transaction | n/a | Sandbox now; live pending Utah LLC. |
| Namecheap — incomeacademy.biz | ~$13 | annual | TBD | check renewal date | Domain registration. |
| Namecheap — incomeacademymail.com | ~$13 | annual | TBD | check renewal date | MailerLite sending domain. |
| OpenAI / Anthropic API | usage-based | monthly | TBD | n/a | Image generation, AI Assistant powering. |

---

## Approval-gated additions

Per the Maximum Autonomy mandate: **any new paid SaaS subscription >$25/mo must be flagged for Wyatt's approval before signing up.**

Subscriptions ≤$25/mo can be added without explicit approval but should still be added to this table when set up.

---

## How to push these into the CRM Expenses page

The CRM at `dashboard.incomeacademy.biz` has a per-user Expenses page hitting `POST /api/expenses` on the Render server. Schema:

```js
{
  description: string (max 300 chars),
  amount_cents: integer (e.g., 10355 for $103.55),
  incurred_on: 'YYYY-MM-DD',
  category: string (optional, e.g., "SaaS — Recurring"),
  notes: string (optional),
  reimbursement_status: 'Pending' | 'Submitted' | 'Reimbursed' | 'Denied' (default 'Pending'),
}
```

To bulk-import these from this doc, use:

```bash
# Get auth token from login (or paste from CRM session cookie)
TOKEN=eyJ... node server/src/tools/import-recurring-expenses.js
```

(Tool not yet built — Wyatt should add the first month's entry by hand via the UI to test the flow, then the import script can replicate going forward.)

---

## Annual cost projection (current state)

Conservative estimate, monthly fixed:
- GHL: $103.55/mo = $1,242.60/yr
- Google Workspace (assume $6/mo): $72/yr
- HeyGen: usage-based, est. $20/mo if generating videos = $240/yr
- Domains: $26/yr
- All free tiers: $0

**Total before any paid scaling: ~$1,580/yr** (≈$132/mo)

When real revenue starts, add:
- Render Starter $7/mo (~$84/yr) — recommended once ≥1 paying member to kill cold starts
- Neon Pro $19/mo (~$228/yr) — recommended once Postgres data matters
- MailerLite Growing tier ~$15/mo at 1k subs ($180/yr)
- Stripe transaction fees (variable, not flat)

Pre-revenue burn target: <$150/mo. Currently on track at ~$130/mo committed once GHL + Google Workspace billing kicks in.
