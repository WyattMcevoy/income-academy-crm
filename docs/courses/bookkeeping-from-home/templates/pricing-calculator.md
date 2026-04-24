# Bookkeeping Pricing Calculator

Build this in a Google Sheet. Use it to price new engagements consistently. Adjust the base numbers to match your market and target hourly rate.

---

## Part 1 — Monthly Retainer Calculator

### Inputs

| Variable | Your input | Typical range |
|---|---|---|
| Target hourly rate (A) | $____ | $40-$75 for retiree-friendly pricing |
| Transactions per month, bank (B) | ____ | 20 / 50 / 100 / 200 / 500 |
| Transactions per month, credit card (C) | ____ | 10 / 25 / 50 / 100 / 200 |
| # bank accounts to reconcile (D) | ____ | 1 / 2 / 3+ |
| # credit cards to reconcile (E) | ____ | 1 / 2 / 3+ |
| AR activity (F) | y/n | Y = invoicing customers |
| AP activity (G) | y/n | Y = paying bills |
| Payroll coordination (H) | y/n | Y = entries from Gusto/ADP |
| Inventory tracking (I) | y/n | Y = if using QBO inventory |
| Complexity multiplier (J) | 1.0 / 1.25 / 1.5 | industry difficulty |

### Hours estimate

| Task | Hours formula | Your hours |
|---|---|---|
| Categorization | (B+C) × 0.02 (about 1 min per transaction) | ____ |
| Reconciliation | (D+E) × 0.75 (about 45 min per account) | ____ |
| AR maintenance | F × 1.5 | ____ |
| AP maintenance | G × 1.5 | ____ |
| Payroll entries | H × 0.5 | ____ |
| Inventory adjustments | I × 1.0 | ____ |
| Reports + narrative | 1.5 | ____ |
| Client communication + Q&A | 1.0 | ____ |
| **Subtotal** | sum all above | ____ |
| Complexity-adjusted | × J | **____** |

### Retainer pricing

```
Monthly hours = (adjusted subtotal)
Monthly retainer = hours × A × 1.2 (20% buffer)
```

### Example — small service business

- Target hourly: $55
- 80 bank transactions, 30 CC transactions, 1 bank, 1 CC
- AR yes, AP no, Payroll yes (simple), Inventory no
- Complexity: 1.0 (simple service biz)

Hours:
- Categorization: 110 × 0.02 = 2.2
- Reconciliation: 2 × 0.75 = 1.5
- AR: 1.5
- Payroll: 0.5
- Reports: 1.5
- Communication: 1.0
Subtotal: 8.2 hours

Retainer: 8.2 × $55 × 1.2 = **$541/month** → price at $525-$550

---

## Part 2 — One-Time Cleanup Project Calculator

### Inputs

| Variable | Your input |
|---|---|
| Months out of date | ____ |
| Severity: 1 (just not reconciled) / 2 (messy categorization) / 3 (chart of accounts broken) | ____ |
| Volume multiplier based on transactions per month | 0.5 / 1.0 / 1.5 / 2.0 |

### Hour estimates by severity

| Severity | Hours per month out of date |
|---|---|
| 1 (not reconciled, categories roughly right) | 0.5 per month |
| 2 (need to re-categorize, some chart changes) | 1.5 per month |
| 3 (full chart rebuild, historical fixes needed) | 3.0 per month |

Adjusted hours = (months out × severity hours × volume multiplier)

### Flat fee pricing

```
Cleanup hours = adjusted hours from above
Flat fee = hours × target hourly × 0.85 (small discount for committing to the full project)
Minimum floor: $500 (don't go below — small projects have overhead)
```

### Example — 12 months out, moderate mess, medium volume

- 12 months × 1.5 hours/month × 1.0 volume = 18 hours
- 18 × $55 × 0.85 = **$841** → price at $850

---

## Part 3 — Realistic Income Projections (for your own planning)

| Scenario | Clients | Avg retainer | Monthly revenue |
|---|---|---|---|
| Starter (2 months in) | 2 | $400 | $800 |
| Stable (6 months in) | 4 | $450 | $1,800 |
| Target (12+ months in) | 5-6 | $500 | $2,500-$3,000 |
| Ambitious (but still solo) | 8-10 | $550 | $4,400-$5,500 |

**What NOT to plan for at the Foundation Pass / solo scale**:
- 20+ clients (needs an agency / employees)
- $10k/mo+ solo (possible but unusual for retiree-friendly work hours)

**Honest hours per week at each scenario**:
- 2 clients: 4-8 hours
- 4 clients: 10-15 hours
- 6 clients: 15-22 hours
- 10 clients: 25-35 hours (getting close to full-time)

Stay in the 4-6 client zone for the relaxed retirement income angle this course is built for.

---

## Part 4 — Quick Reference Table (share with prospects)

Use this to explain your pricing to clients without revealing your calculator logic:

| Business profile | Typical monthly retainer |
|---|---|
| Solopreneur service business, simple books | $300-$450 |
| Small business, 2-10 employees, moderate volume | $500-$750 |
| Small business, 10-20 employees, with payroll + inventory | $750-$1,100 |
| Medium business with complexity | $1,100-$2,000 |
| Add: one-time cleanup if books are not current | $500-$2,500 (flat) |

Use this as a conversational anchor — "Based on what you've described, you're probably in the [X] range" — before you do the detailed calculation for your formal proposal.
