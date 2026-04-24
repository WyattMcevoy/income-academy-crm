# Prompts — Bookkeeping & Admin Support

For freelancers offering receipt categorization, expense memos, invoice generation, and admin for small operators.

**⚠️ Important compliance reminder**: These prompts support BOOKKEEPING SUPPORT services only. You are not a CPA. You are not providing tax advice. Always tell your clients to have a qualified CPA review for tax implications.

## Receipt & expense categorization

### BK-01: Categorize a batch of receipts from CSV
```
You are a bookkeeping assistant. Below is a CSV of my client's business expenses. For each row, assign:
- Category (use standard categories: Office Supplies, Software Subscriptions, Professional Services, Travel, Meals & Entertainment, Utilities, Rent, Marketing, Bank Fees, Contractor Payments, Equipment, Inventory, Insurance, Other)
- Tax-deductible (Yes / Probably / Review needed) — flag anything questionable for human review
- Note (optional, 1 sentence, only if something is unclear)

CSV:
[PASTE CSV]

Return as a clean table. Do not make up categories. For anything ambiguous, mark "Review needed" and briefly explain why.
```

### BK-02: Identify missing or suspicious receipts
```
Below are my client's bank transactions for [MONTH]. Flag any that look:
- Personal (not business)
- Duplicate or possibly duplicate
- Unusually large compared to normal patterns
- Missing category or vendor info

Transactions:
[PASTE]

Return as a list with transaction ID, reason for flag, and recommended action.
```

## Expense memos & descriptions

### BK-03: Write expense memo
```
Write a short expense memo (2-3 sentences) for the following transaction:

Vendor: [NAME]
Amount: $[AMOUNT]
Date: [DATE]
Business context: [WHAT IS IT FOR]

The memo should note the business purpose clearly for IRS substantiation purposes. No tax advice — just describe what it is and why it's a business expense.
```

### BK-04: Meal expense documentation
```
The client had a business meal. Write a short record:

Attendees: [NAMES + RELATIONSHIP TO BUSINESS]
Date: [DATE]
Location: [RESTAURANT]
Amount: $[AMOUNT]
Business purpose: [WHY]

Return a 2-3 sentence memo documenting business purpose for tax substantiation. Format: "Meal with [who] to discuss [what] regarding [business purpose]. Date: [date]. Amount: $[amount]."
```

## Invoices & billing

### BK-05: Draft invoice from work log
```
Below is my client's work log for [CLIENT'S CLIENT]. Generate an invoice description.

Work log:
[PASTE]

Output format:
- Client name
- Invoice period
- Itemized list (task, hours or flat, rate, line total)
- Subtotal
- Any applicable tax (ask me if you're not sure)
- Total due

Payment terms: [NET 15 / NET 30 / UPON RECEIPT]
Invoice number: [NEXT NUMBER]

Keep descriptions professional but specific enough that the payer understands what they're paying for.
```

### BK-06: Follow-up on overdue invoice (polite)
```
Write a polite follow-up email for an invoice that's [N] days overdue.

Client name: [NAME]
Invoice number: [#]
Amount: $[AMOUNT]
Original due date: [DATE]
History with client: [FIRST TIME LATE / SECOND TIME / CHRONIC]

Tone: friendly but firm. Assume it's an oversight, not malice. Give a clear next step.
Length: under 150 words.
```

### BK-07: Follow-up on overdue invoice (firm)
```
Write a firm but professional second follow-up for an invoice that's [N] days overdue. Previous gentle reminder was sent [DATE].

Client: [NAME]
Invoice: [# + AMOUNT]
Days overdue: [N]

Tone: professional, not hostile. Mention specific next step (call, late fee, pause work). Do not threaten litigation.
```

## Monthly close / reconciliation support

### BK-08: Monthly reconciliation summary
```
Summarize my client's month-end reconciliation:

Opening balance: $[X]
Deposits: [COUNT] totaling $[Y]
Withdrawals: [COUNT] totaling $[Z]
Ending balance: $[ENDING]

Exceptions / unreconciled items:
[PASTE]

Write a 1-paragraph summary email to the client that includes:
- The month's activity
- The ending balance confirmation
- Flagged items needing their input
- A cheerful closing

Length: under 150 words.
```

### BK-09: Month-end checklist for small business
```
Generate a month-end closing checklist for a [BUSINESS TYPE] client. Include:
- Bank reconciliation
- Expense categorization
- Invoice receivables review
- Mileage log (if applicable)
- Payroll if they run it
- Any [INDUSTRY]-specific items

Format as a checkbox list my client can walk through in 30 minutes.
```

## Tax prep support (CPA handoff)

### BK-10: Tax prep organizer for CPA
```
My client is preparing for tax filing with their CPA. Generate a document organization list covering:

Business: [BUSINESS TYPE]
Filing status: [SOLO PROP / LLC / S-CORP]
Tax year: [YEAR]

List what the client should gather, organized by:
- Income documentation
- Expense documentation
- Payroll/contractor records (1099s, W-2s)
- Asset records (purchases, vehicle, home office)
- Banking and investment records
- Health insurance and retirement records
- Prior year returns

End with: "Your CPA may request additional items specific to your situation."

DO NOT offer tax advice. Just list what to gather.
```

## Client communication

### BK-11: Monthly bookkeeping report email
```
Write a monthly report email to my client.

Month: [MONTH]
Total expenses: $[X]
Top categories: [TOP 3 WITH $ AMOUNTS]
Income recorded: $[Y]
Flagged items needing review: [LIST]
Anything notable: [OPTIONAL]

Tone: clear, confident, collaborative. Not jargon-heavy. Close with "Ready to chat any time."
Length: under 250 words.
Format: brief greeting, 3-4 short paragraphs, sign-off.
```

### BK-12: Client onboarding info request
```
Write an email to a new bookkeeping client requesting the info I need to get started. Request:
- Bank statements (last 3 months)
- Credit card statements (last 3 months)
- Access method to their accounting software (if any)
- List of recurring vendors
- Names of their CPA / tax preparer
- Any existing categorization conventions they prefer

Tone: warm, professional, organized. Make it feel like an onboarding, not a data dump.
```

### BK-13: Scope clarification ("is this something I do?")
```
The client asked if I can do [TASK].

Based on the scope we agreed to (bookkeeping support only — not tax prep, not advisory), write a polite response that:
1. Clarifies whether this falls in scope or not
2. If in scope, confirms I can handle it and give a timeline
3. If out of scope, explains what I can't do, why, and who they should contact instead
4. Keeps the relationship warm

The specific task: [TASK]
Current agreement: [BRIEF SCOPE]
```

---

## Compliance footer (paste in every client engagement)

```
I provide bookkeeping support services. I am not a CPA, EA, or tax preparer. I do not provide tax advice. For tax questions or filing, please consult a qualified tax professional.
```
