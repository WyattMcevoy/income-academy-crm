# Prompts — Customer Service / Email Triage

For freelancers helping small business owners manage repetitive customer emails.

## Category / triage

### CS-01: Triage a batch of emails
```
Below are [N] customer emails my client received. Categorize each as:
- ORDER STATUS / shipping question
- PRODUCT QUESTION / how-to
- REFUND or RETURN request
- COMPLAINT / negative experience
- COMPLIMENT / positive feedback
- SALES inquiry / potential customer
- SPAM / promotional / irrelevant
- OTHER (specify)

For each, also flag urgency: LOW / MEDIUM / HIGH / URGENT (angry, legal risk, or lost customer).

Emails:
[PASTE]

Return as a table: #, Category, Urgency, 1-sentence summary.
```

### CS-02: Daily digest for client
```
Summarize today's customer service queue for my client.

Categorized emails:
[PASTE OR REFERENCE]

Generate:
- Total emails today: [NUMBER]
- Breakdown by category (bullet list)
- Urgent items needing their personal attention (list, with 1-sentence context each)
- Items I handled with drafts ready for approval (count)
- Anything unusual

Format: short email, 150-250 words. Tone: clear, organized, professional.
```

## Draft responses

### CS-03: Order status reply
```
Customer email:
[PASTE]

Order details:
- Order #: [X]
- Status: [SHIPPED / PROCESSING / DELAYED]
- Tracking: [NUMBER or NOT YET]
- Expected delivery: [DATE or RANGE]

Draft a friendly, clear response under 100 words. Include tracking info if available, set realistic expectations if delayed. Sign as [CLIENT'S SIGN-OFF].
```

### CS-04: Product usage question
```
Customer asks: [QUESTION]

Product: [NAME + BRIEF DESCRIPTION]
Client's past tone: [CASUAL / PROFESSIONAL / WARM]

Draft a helpful response that:
1. Directly answers the question
2. Suggests an additional tip if relevant (not salesy)
3. Offers follow-up if they need more help

Keep under 150 words. If the answer requires specific product info I don't have, flag that in my notes.
```

### CS-05: Refund request — proceeding
```
Customer requesting a refund: [DETAILS]
Eligibility per client's refund policy: YES
Order #: [X]
Reason given: [SHORT SUMMARY]

Draft a response that:
1. Confirms the refund is being processed
2. States when the refund will appear (typical 5-10 business days)
3. Asks briefly if they'd consider an exchange (optional — only if we sell similar items)
4. Wishes them well (don't be defensive about the refund)

Tone: gracious, not apologetic. Never argue. Under 150 words.
```

### CS-06: Refund request — denying (within policy)
```
Customer requesting a refund outside our policy: [DETAILS]
Policy: [BRIEF — e.g., "returns within 30 days, unworn, tags attached"]
Reason for denial: [WHY IT DOESN'T QUALIFY]

Draft a response that:
1. Acknowledges their frustration
2. Clearly explains why we can't refund (cite policy, not blame)
3. Offers an alternative if possible (store credit, partial refund, discount on next purchase)
4. Leaves door open for escalation if they really want to talk

Tone: empathetic but firm. Avoid "unfortunately" as first word. Under 175 words.
```

### CS-07: Complaint response
```
Customer complaint:
[PASTE]

Severity: [MINOR / MODERATE / SEVERE]
Our fault?: [YES / PARTIALLY / NO / UNCLEAR]

Draft a response that:
1. Acknowledges their specific frustration (not generic "sorry for any inconvenience")
2. Takes ownership if we're at fault — no excuses
3. States concrete next step (refund, replacement, callback, etc.)
4. Gives them a specific timeline

Tone: calm, human, no corporate jargon. Under 200 words.
If severe / legal risk / public-facing, flag "NEEDS [CLIENT] PERSONAL ATTENTION" at the top and keep the draft shorter.
```

### CS-08: Compliment acknowledgment
```
Customer left glowing feedback:
[PASTE]

Draft a brief warm response (under 60 words):
- Thank them specifically (not generically)
- Note the specific thing they mentioned
- Invite them to leave a review if they haven't (only if they haven't)

Tone: genuine, not saccharine.
```

### CS-09: Sales inquiry
```
Prospect asking about [PRODUCT / SERVICE]:
[PASTE EMAIL]

Draft a reply that:
1. Thanks them for reaching out
2. Directly answers their specific question
3. Gives them the info they actually need to decide (price, timeline, whatever's relevant)
4. Includes a clear next step (purchase link, consultation booking, etc.)

Tone: warm and helpful, not pushy. Under 200 words.
```

## Templates for recurring types

### CS-10: Build a response template from patterns
```
Below are 10 of my client's past responses to [RECURRING QUESTION TYPE]. Identify the pattern and write a reusable template.

Examples:
[PASTE]

Return:
- Template with [BRACKETED] placeholders
- Notes on when to use it (and when to write custom)
- Variations for different tones/situations
```

### CS-11: FAQ page draft from email patterns
```
Based on our last 30 days of customer emails, these are the top 10 repeat questions:
[PASTE LIST]

For each, draft a FAQ entry:
- Question (rephrased for a public page)
- Answer (150-word max, clear, links to relevant pages where applicable)
- Internal note: "if they email asking this, reply: [SHORT SCRIPT]"

Goal: reduce email volume by making answers discoverable.
```

## Escalation & handoff

### CS-12: Escalation draft for client review
```
This situation needs the client's personal attention.

Original customer email:
[PASTE]

Why I'm escalating:
[PASTE REASON — legal, public relations, angry loyal customer, unclear policy, high-value]

Draft a briefing email to my client that:
1. Summarizes the customer situation in 3-4 sentences
2. States what I would do if it were up to me + why
3. Lists the risks if handled poorly (1-2 items)
4. Asks clearly: "How would you like me to respond? Or would you prefer to reply directly?"

Length: 200 words max. Tone: calm, analytical.
```

### CS-13: Response when I genuinely don't know
```
Customer asked: [QUESTION]

I don't have enough info to answer definitively.

Draft a reply that:
1. Acknowledges their question
2. Is honest: "Let me check on this and get back to you within [TIMEFRAME]"
3. Gives a realistic timeframe (24-48 hours is common)
4. Leaves no doubt they'll hear back

Tone: warm and professional. Under 75 words.
```

## Weekly client report

### CS-14: Weekly email triage report
```
Summarize this week's email support activity for my client.

This week's metrics:
- Total emails: [N]
- Avg response time: [TIME]
- Categories breakdown: [LIST]
- Refunds processed: [$ and count]
- Escalations: [COUNT]
- Trending issue: [ANY PATTERN NOTICED]

Format as a one-page email to the client:
- Headline metrics
- Categories breakdown
- Flags or patterns worth noting
- Recommended follow-ups or FAQ additions

Length: 300-400 words.
```

---

## Customer service voice rules

- Match the client's existing tone (warm, formal, funny — whatever they are)
- Never promise what you can't deliver
- Never bad-mouth the company
- "Apologize once, not five times" — over-apologizing feels weak
- Close every email with a clear next step or "nothing required from you"
