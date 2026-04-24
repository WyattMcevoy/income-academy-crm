# Foundation Pass Welcome Email Sequence

7 emails for the first 14 days after purchase. Paste each into a MailerLite automation (or GHL Workflow) triggered by "Added to Starter Program Buyers" group / "Stripe purchase completed" webhook.

**Design principles**:
- Warm, not hype-y
- Give value in every email (not "hi thanks for buying")
- Reference specific modules/actions they can take in under 30 min
- Tone calibrated for skeptical 55-75 audience
- CAN-SPAM compliant footer on every email

**Sending schedule**:

| # | Send | Subject | Goal |
|---|---|---|---|
| 1 | Immediate | Welcome to the Foundation Pass — here's how to log in | Access + orientation |
| 2 | Day 1 (next morning) | Pick your starting course (here's how to decide) | Path selection |
| 3 | Day 3 | The one mistake most new members make | Behavior nudge |
| 4 | Day 5 | Free tool I should have mentioned | Value add |
| 5 | Day 7 | Your free trial converts tomorrow — here's what to do | Retention touchpoint |
| 6 | Day 10 | [Name], how's Module 1 going? | Progress check-in |
| 7 | Day 14 | Two weeks in — your next move | Retention + guidance |

**Variables to replace throughout**:
- `{{first_name}}` → member's first name
- `{{email}}` → member's email
- `{{password}}` → GHL temporary password
- `[YOUR_NAME]` → your name (replace once, not per email)
- `[YOUR_STORY]` → short backstory line (for email #3)
- `[BUSINESS_ADDRESS]` → your mailing address (CAN-SPAM — required on every email)

---

## Email 1 — Immediate on purchase

**Subject**: Welcome to the Foundation Pass — here's how to log in

**Body**:

```
Hi {{first_name}},

Welcome to Income Academy.

Your 7-day free trial on the $19/mo membership just started. For the
next 7 days you have full access to all 4 courses, the AI Writing
Assistant, and the community — and you'll pay $0 on the membership
during the trial.

Here's how to log in:

Portal: https://portal.incomeacademy.biz/
Email: {{email}}
Temporary password: {{password}} (you'll set your own on first login)

One tip before you start:

Don't try to take all 4 courses at once. Pick ONE that fits your life
right now, work through it, and come back for the next one when you're
ready. This bundle is designed so each course stands alone.

Your Members Area (prettier overview of everything you got):
https://incomeacademy.biz/members

If anything feels off — login doesn't work, email bounces, or you're
confused about what to do first — reply to this email. I read replies.

Welcome aboard,
[YOUR_NAME]
Founder, Income Academy

---
7-day refund policy: https://incomeacademy.biz/refund
Cancel $19/mo anytime: one click from your Account page
Earnings Disclaimer: https://incomeacademy.biz/disclaimer

Income Academy LLC · [BUSINESS_ADDRESS]
You received this because you purchased the Foundation Pass on
{{purchase_date}}. Not you? Reply to this email — we'll fix it.
```

---

## Email 2 — Day 1 (send the next morning)

**Subject**: Pick your starting course (here's how to decide)

**Body**:

```
Hi {{first_name}},

The Foundation Pass gives you 4 courses. Which should you start with?

Honest answer: whichever one feels most like YOU. Here's a quick
cheat sheet:

→ AI Side Income Starter Kit
  Pick if: you want freelance income FAST (weeks, not months), and
  you're curious about ChatGPT and Claude. You'll be doing service
  work with AI as your assistant.
  First client realistic: 30-60 days.

→ Honest Affiliate Marketing Starter
  Pick if: you enjoy writing, are patient, and want to build an asset
  that earns while you sleep. It takes 6-24 months, but it compounds.
  Real money realistic: year 2.

→ Estate Sale & Garage Sale Sourcing Academy
  Pick if: you like hunting for deals and you have a spare room /
  garage zone for inventory. Tangible, weekends-only, feeds into our
  eBay Done-With-You graduation tier when you're ready.
  First profit realistic: 30-45 days.

→ Bookkeeping From Home for Over-55s
  Pick if: you have some comfort with numbers and you want predictable
  recurring income with 3-5 clients. Built for 2 focused weeks per
  month, not a second career.
  First client realistic: 30 days with disciplined outreach.

Don't overthink this. Pick the one that made you lean forward reading.
Start Module 0 today (usually 15-20 min). You can always switch later
— the bundle includes all 4.

Today's 15-minute move:

1. Log in: https://portal.incomeacademy.biz/
2. Pick a course
3. Watch Module 0 (welcome + reality check)
4. Close your laptop and go have dinner. Come back tomorrow for Module 1.

If you genuinely can't decide, reply and tell me: what did you used to
do for work, and what are you hoping this gives you? I'll point you
to the right course.

[YOUR_NAME]

---
Log in: https://portal.incomeacademy.biz/
Members Area: https://incomeacademy.biz/members
Refund policy: https://incomeacademy.biz/refund

Income Academy LLC · [BUSINESS_ADDRESS]
```

---

## Email 3 — Day 3

**Subject**: The one mistake most new members make

**Body**:

```
Hi {{first_name}},

Quick one.

Most new members do one of two things in their first week:

A) They try to "get ahead" by watching all 4 courses in 3 days.
B) They log in once, get overwhelmed, and don't come back for 2 weeks.

Both are mistakes. Here's the move that actually works:

Pick a 20-minute block that happens every day. Morning coffee. After
dinner. Whatever. Show up during that block, watch one lesson, do the
small assignment (if any), close the laptop.

That's it. 20 minutes × 7 days = one module done per week. Two modules
in two weeks. Four in a month. In three months you've finished a
course AND had time to actually try the skills.

Why this works for people 50+:

[YOUR_STORY — 2 sentences about why you know this rhythm works. If
you don't have a story, replace with: "It mirrors how you learned
anything real — piano, a language, a craft. Consistency beats
intensity at our age."]

Two real things, one honest answer:

The worst students I've had were the ones who finished the course in
3 days and never took action.

The best were the ones who went slow and did the work.

Your 20-minute move today:

Log in. Watch the next lesson in your chosen course. Don't skip ahead.

[YOUR_NAME]

---
Log in: https://portal.incomeacademy.biz/
Questions? Reply to this email.

Income Academy LLC · [BUSINESS_ADDRESS]
```

---

## Email 4 — Day 5

**Subject**: Free tool I should have mentioned

**Body**:

```
Hi {{first_name}},

One thing I buried in the onboarding that I should have led with:

Your Foundation Pass includes the Income Academy AI Writing Assistant.
It's a custom Claude Project I built — pre-loaded with every module
from every course, every prompt in our library, every template.

What you can do with it:

- "Take the cold-outreach template and rewrite it for a small dental
  practice" → it does.
- "I'm stuck on Module 3 of the Affiliate course — explain it again,
  plainly" → it does.
- "Here's an email from a potential bookkeeping client — help me
  respond" → paste the email, it drafts your reply.

It's the difference between reading a cookbook and having a chef
whispering suggestions while you cook.

Access it from your Members Area:
https://incomeacademy.biz/members
(scroll to "Your included tools & resources")

Or directly in Claude: [YOUR CLAUDE PROJECT LINK]

Note: the Assistant works best when you give it context. Instead of
"help me write a proposal," try:
"I'm writing a proposal for a bookkeeping client — a small
construction business, 8 employees, $1.2M revenue, they want monthly
books + AR. Use template PT-01 from the course and fill in specifics
for this client."

Same rule as humans: the more context, the better the answer.

[YOUR_NAME]

---
Members Area: https://incomeacademy.biz/members
Refund policy: https://incomeacademy.biz/refund
Income Academy LLC · [BUSINESS_ADDRESS]
```

---

## Email 5 — Day 7 (morning of trial end)

**Subject**: Your free trial converts tomorrow — here's what to do

**Body**:

```
Hi {{first_name}},

Tomorrow your 7-day free trial ends and the $19/mo membership begins.

What this means:

→ You keep full access to all 4 courses, the AI Writing Assistant,
  and the community for as long as you're a member.
→ You get monthly Q&A, new content as AI/affiliate/eBay landscapes
  shift, and member-only updates.
→ It's $19/mo starting tomorrow. Cancel anytime in one click from
  your Account page — no calls, no "are you sure" gauntlet.

Most members keep it. The $19/mo covers the AI Assistant alone, and
the new content + Q&A pays for itself. But if this isn't clicking for
you — cancel. No hard feelings, no guilt trip. Here:

Cancel link: https://portal.incomeacademy.biz/account (click Manage
Membership → Cancel)

Refund on the $47: if you're within your 7-day money-back window and
you want a full refund on the original purchase too, just reply to
this email and I'll process it. Same-day most days.

What to do today if you're keeping it:

→ Finish Module 1 of whichever course you started
→ Bookmark https://portal.incomeacademy.biz/ so you can find it later
→ Join the community (sidebar in your portal) if you haven't

That's it. See you inside.

[YOUR_NAME]

---
Account: https://portal.incomeacademy.biz/account
Refund policy: https://incomeacademy.biz/refund
Income Academy LLC · [BUSINESS_ADDRESS]
```

---

## Email 6 — Day 10

**Subject**: {{first_name}}, how's Module 1 going?

**Body**:

```
Hi {{first_name}},

Checking in 10 days into your Foundation Pass.

By now you should be somewhere between Module 1 and Module 3 of
whichever course you picked. Not there yet? Totally fine. Life
happens. Just log in this week and knock out the next lesson.

A few things members tell me around this point:

"I'm second-guessing the course I picked."
→ Normal. Give it one more module. If you're still second-guessing
  by Module 3, switch to a different course. The bundle is built so
  you can.

"I'm procrastinating because I'm scared to take action."
→ Also normal. The action feels scarier than it is. The first client
  email you send, the first estate sale you visit, the first prompt
  you actually use with AI — you'll feel silly it took you 10 days
  to do a 10-minute thing.

"I wish the course went deeper on X."
→ Tell me. Reply to this email with what you want more of. I read
  every reply, and it's how I decide what to add to the course
  next quarter.

One small thing you can do this week:

Pick ONE action from your course and do it. Not "watch another
lesson." An actual action. Email a CPA about referrals. Visit an
estate sale. Draft a cold outreach email. Do the thing.

[YOUR_NAME]

---
Portal: https://portal.incomeacademy.biz/
Income Academy LLC · [BUSINESS_ADDRESS]
```

---

## Email 7 — Day 14

**Subject**: Two weeks in — your next move

**Body**:

```
Hi {{first_name}},

Two weeks into your Foundation Pass. What's next?

Depending on how you've used it so far, here are three paths most
members take:

1. Go deeper on your chosen course.
   You've finished Modules 0-3. The next 4-5 modules are where the
   specifics live. This is where "reading about it" turns into
   "doing it." Keep going.

2. Explore a second course.
   You've finished one course and are wondering if another fits
   better. Great — go browse. You paid for all 4.

3. Take action, not more lessons.
   You've learned enough. The courses aren't going anywhere. Close
   the laptop, do the thing. Come back when you have a specific
   question.

Which one you pick depends on you. No right answer.

What I'd ask you today:

Reply to this email and tell me:
- Which course you chose
- One thing that clicked for you
- One thing you want more of

I use these replies to improve the courses every quarter. Your
specific feedback — "the prompt library was great, but I wish the
Bookkeeping course covered X" — is how the next update happens.

Thanks for being here. The courses are better because of members
who give real feedback.

[YOUR_NAME]

---
Portal: https://portal.incomeacademy.biz/
Refund: if this isn't working, https://incomeacademy.biz/refund (you're
past the 7-day window on the $47 but can still cancel $19/mo anytime)
Income Academy LLC · [BUSINESS_ADDRESS]
```

---

## After the 7-email sequence ends

Members move into the regular content cadence:
- Monthly Q&A invite
- Quarterly content update announcement
- Occasional "we added a new module" email
- Community digest (optional)

Don't email the Foundation Pass group more than once a week after this sequence. This audience unsubscribes fast when they feel marketed at.

## Compliance checklist (every email must have)

- [ ] Subject line not misleading (no clickbait)
- [ ] From name matches account ("Income Academy" or "[YOUR_NAME] at Income Academy")
- [ ] Physical mailing address in footer (CAN-SPAM requirement)
- [ ] Clear unsubscribe mechanism (auto-added by MailerLite/GHL)
- [ ] No earnings claims without disclaimer
- [ ] No manufactured urgency ("last chance!" "24 hours left!")
- [ ] Reply-to address is monitored
