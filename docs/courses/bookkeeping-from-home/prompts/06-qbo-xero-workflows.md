# Prompts — QBO & Xero Workflows

Specific software tasks and troubleshooting.

## BK-50: QBO chart of accounts cleanup

```
My new client's QBO chart of accounts has [PROBLEM — e.g., "150+
accounts with overlapping categories like 'Office Supplies' and
'Office Supplies - Misc'" / "no sub-accounts, everything flat" /
"category names that don't match their actual business activities"].

Propose a cleanup plan:
1. A target chart of accounts for a [INDUSTRY] business their size
2. Which existing accounts should be merged, renamed, or deactivated
3. Which sub-account structure (if any) would help
4. The order to do the cleanup in (some merges depend on others)
5. The impact on historical reports (do I need to re-reconcile? will
   past P&Ls change?)

Give me the safest cleanup sequence that doesn't break historical
data. I should be able to show the client a clean COA without them
noticing any past-month reports changed.
```

## BK-51: QBO bank feed issue

```
My client's bank feed in QBO has [ISSUE — e.g., "duplicates
transactions", "missing transactions that appeared on the statement",
"transactions with unclear payees needing manual matching"].

Walk me through:
1. The most likely cause (bank connector issue, categorization rule,
   timing)
2. The fix in QBO step-by-step
3. How to prevent it recurring
4. When to escalate to QBO support vs. fix myself

Include: if the issue is systemic (happens every month), the conversation
to have with the client about potentially switching to manual CSV
import or a different bank feed provider.
```

## BK-52: Xero migration planning

```
I have a new client currently on [OLD SOFTWARE — QuickBooks Desktop
/ Excel / FreshBooks / paper]. They want to move to Xero. Help me
plan the migration.

Client info:
- Business type: [TYPE]
- Years of historical data: [YEARS]
- How much of that history do they want in Xero: [ALL / JUST RECENT /
  CURRENT YEAR]
- Transaction volume: [VOLUME]
- Start date for Xero: [DATE]

Walk me through:
1. Data extraction from [OLD SOFTWARE] — what to export and in what
   format
2. Xero setup tasks before import (COA, tracking categories, users)
3. Order of import (customers, vendors, opening balances, then
   transactions)
4. Reconciliation verification steps (how to confirm the migration
   was accurate)
5. Common pitfalls for this type of migration + how to avoid them
6. Timeline estimate for this specific client

Include: what I can do vs. what the client needs to do (e.g., they
need to download their own QB Desktop file, they need to connect
their bank accounts).
```

## BK-53: Reconcile a credit card with unusual transactions

```
My client's business credit card has [UNUSUAL ACTIVITY — e.g.,
"refund of a 2-month-old charge showing as new", "foreign transaction
with currency conversion fees", "chargeback dispute that's pending"].

How do I handle each of these in QBO? Specifically:
- Which account each lands in
- Whether it affects current-month P&L or prior periods
- Any special documentation to keep
- How to explain to the client in plain English if they ask

Include: when these issues are substantial enough to slow my close
timeline vs. when they're routine.
```

## BK-54: Payroll coordination with Gusto / ADP / QBO Payroll

```
My client uses [PAYROLL PROVIDER] for payroll. They handle the
filing / tax compliance. I handle the bookkeeping entries in QBO.

Walk me through:
1. How payroll transactions should flow into QBO (is there an
   integration? manual journal entry? pull from Gusto reports?)
2. Which accounts get debited/credited for a typical payroll run
   (wages, employer taxes, benefits, deductions)
3. Reconciliation between Gusto reports and QBO entries
4. Red flags: what would indicate the payroll entry is wrong

If I should recommend a better setup than they have (e.g., "Gusto
integrates with QBO directly, they should enable it"), include that
recommendation.
```
