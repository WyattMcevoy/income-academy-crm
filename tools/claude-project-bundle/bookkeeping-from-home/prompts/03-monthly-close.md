# Prompts — Monthly Close Workflow

Running the month-end close efficiently. These prompts assume you use QBO but work for Xero with minor adaptations.

## BK-20: Monthly close checklist for a new client

```
Generate a monthly close checklist for a [INDUSTRY] client with:
- [# BANK ACCOUNTS] bank accounts
- [# CREDIT CARDS] credit cards
- [Y/N] payroll (through [PROVIDER])
- [Y/N] inventory
- [Y/N] AR / AP tracking
- [Y/N] merchant account (Stripe / Square / PayPal)

Create a checklist I can run through every month:
- [ ] Step 1: ...
- [ ] Step 2: ...
etc.

Order by logical workflow (e.g., download statements BEFORE
categorizing, categorize BEFORE reconciling, reconcile BEFORE running
reports).

Include expected time per step for a typical transaction volume.
Flag any step that commonly goes wrong so I know what to double-check.
```

## BK-21: Handle an unreconciled account

```
My client's bank account in QBO won't reconcile. The beginning balance
matches the bank statement, but there's a discrepancy of $[AMOUNT] at
the end of the period.

Common causes of this issue (in order of likelihood):
1. [list them]
2. [list them]
etc.

For each cause, what's the diagnostic step I should take? Give me
an investigation order that will find the issue fastest.

If you need more info to narrow down, ask me:
- How old is this account in QBO (new setup vs long-term)?
- Have prior months reconciled cleanly?
- Is the discrepancy a round number or odd amount?
```

## BK-22: Monthly narrative email to client

```
Write a 1-paragraph plain-English summary to send with my client's
monthly reports. This is the "why it matters" that non-accountants
appreciate.

This month's data:
- Revenue: $[X] (vs. $[PRIOR MONTH])
- Expenses: $[X] (vs. $[PRIOR MONTH])
- Net income: $[X] (vs. $[PRIOR MONTH])
- Cash on hand at month end: $[X]
- Key driver of change from last month: [OBSERVATION — e.g., "a
  larger project invoice was paid" or "seasonal slowdown"]

Write the summary so a non-accountant owner understands:
- How the business did this month
- What (if anything) is worth paying attention to
- What I'm doing or watching for next month

Tone: friendly professional, 3-4 sentences. Don't be robotic, don't
be cutesy, don't use jargon.
```

## BK-23: Generate categorization rules for repeated transactions

```
My client has a lot of repeated transactions I'm categorizing by
hand each month. I want to set up automatic categorization rules in
QBO.

Here are the recurring transactions (paste from their bank feed):
[PASTE 15-20 TRANSACTION LINES]

For each pattern you see, suggest:
- The category it should map to
- The bank rule description text to match (be specific enough to
  not accidentally match other things)
- Any transactions you're uncertain about (I need to ask the client)

Prioritize by transaction frequency — top 10 rules to set up first.
```

## BK-24: Mid-month sanity check on a client I'm worried about

```
My client [BUSINESS TYPE] has been showing signs I'm concerned about:
- [SIGN 1 — e.g., cash reserves dropping each month]
- [SIGN 2 — e.g., AR aging over 60 days]
- [SIGN 3 — e.g., owner drawing more than profits]

I'm not their financial advisor, but as their bookkeeper I can flag
things in neutral professional language.

Write me an email that:
- Opens acknowledging I'm not their advisor on business decisions
- Shares the 3 observations clearly, with specific numbers
- Suggests they discuss with their CPA / financial advisor
- Offers to pull specific reports that would help their advisor
- Doesn't alarm them unnecessarily

Tone: calm, professional, caring. The goal is they see I'm paying
attention and can be trusted to raise issues — not that they should
panic.
```
