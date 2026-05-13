# Module Milestone Celebration Emails

Short, specific celebration emails triggered when a member completes a key module or milestone in any of the 4 courses. Designed to:

1. Reinforce the action they took (action > dollars)
2. Move them to the next named milestone (wins ladder)
3. Reduce cancellation risk during the long-ramp phases

**Voice rules:**
- 3–5 sentences max
- No income claims, no "guaranteed" anything
- Use the member's name
- Reference exactly what they did, not vague praise
- One clear CTA (the next step)
- Send from a real person (Wyatt), not a no-reply address

**Voice:** warm, plain-spoken, slightly informal — like a friend who happens to teach this.

---

## Universal trigger logic

For each email below: triggered by a GHL workflow when the member self-reports completion (via portal form, checkbox, or worksheet upload) of the named module.

---

## Email 1 — First Module Complete (any course)

**Trigger:** member completes ANY Module 0 (Welcome + Reality Check) in any course
**Subject:** You started.

```
{{contact.first_name}},

You finished Module 0 — the reality check.

Most people who buy a course like this never finish lesson 1. You did. That's the hardest first move out of the way.

Module 1 is your next 30 minutes. Same place you left off.

— Wyatt
```

---

## Email 2 — Halfway Point (any course)

**Trigger:** member completes Module 4 of any course
**Subject:** Halfway through. Quick note.

```
{{contact.first_name}},

You're halfway through {{course_name}}. Real recognition: about 60% of people who start a course never get past Module 3.

Modules 5–8 are where the rubber meets the road. Less theory, more "actually do the thing."

Don't skip the homework on Module 5 — it's the one that matters most.

— Wyatt

P.S. If you've gotten stuck somewhere, hit reply. Tell me where. I read every email.
```

---

## Email 3 — Affiliate Marketing, Stage 2 cancel-risk window

**Trigger:** Day 45 from purchase + affiliate-track tag + no commission reported yet
**Subject:** Quick check-in (Visibility Builder stage)

```
{{contact.first_name}},

About 45 days into affiliate. Quick honest note:

This is the boring middle. You've published a few things, your traffic is small, no commissions yet. The temptation to quit is highest right now.

Don't.

The members who break through this stage almost always do ONE thing: they keep publishing for 4 more weeks before evaluating whether it's working. The market signal takes that long to show up.

If you're stuck, reply to this email and tell me your niche statement. I'll send back one specific thing to try.

— Wyatt
```

---

## Email 4 — Bookkeeping, Outreach cancel-risk window

**Trigger:** Day 30 from purchase + bookkeeping-track tag + no first-client tag yet
**Subject:** The outreach gate

```
{{contact.first_name}},

You're at Module 4 or close to it — the outreach module.

This is where 60% of would-be bookkeepers freeze. Not because the work is hard. Because sending emails to strangers feels weird.

It does feel weird. It also gets easier after the first 5.

Your assignment this week: send 5 outreach emails using the template in Module 4. Not 50. Not 10. Five.

Reply with the response rate when you're done. Even if all 5 say no — that's a real win, and we'll talk about what to fix.

— Wyatt
```

---

## Email 5 — First-client celebration (Bookkeeping)

**Trigger:** member self-reports first paid client in portal
**Subject:** Your first client.

```
{{contact.first_name}},

You landed your first paid bookkeeping client.

That's not a small thing. You went from "I'm thinking about doing this" to running a real practice in (however many) weeks. Most people never close the gap.

Two things to do this week:
1. Document your onboarding process while it's fresh — client 2 will go 3x faster with notes from client 1
2. Quietly raise your rate for your next client by 15%. You're worth it now.

Talk soon,
Wyatt
```

---

## Email 6 — First commission (Affiliate)

**Trigger:** member self-reports first commission in portal
**Subject:** First commission.

```
{{contact.first_name}},

You got your first commission. Doesn't matter if it's $0.12 — you proved the system works for you.

Three things matter from here:
1. Which piece of content earned it? That's your highest-leverage page. Double down.
2. What was the product? Look for 2–3 similar products you can recommend in the same context.
3. Keep publishing. The next 3 commissions come faster than the first.

You're past the hardest gate.

— Wyatt
```

---

## Email 7 — Course Complete (any course)

**Trigger:** member completes Module 8 of any course
**Subject:** You finished {{course_name}}.

```
{{contact.first_name}},

You completed {{course_name}} — all 8 modules.

Industry stat: about 15% of people who buy an online course actually finish it. You're in that 15%.

A few things now:
1. Your completion certificate is in your portal — print it, frame it, share it, whatever you want
2. The course content keeps updating. You'll get an email each time we ship new material
3. If you want to share your story (anonymously or by name), reply to this email — your perspective helps the next person who's just starting

Real congratulations.

— Wyatt
```

---

## Email 8 — Multi-course Completion (rare/special)

**Trigger:** member completes Module 8 of a SECOND course
**Subject:** Two courses done.

```
{{contact.first_name}},

You've now finished two full Foundation Pass courses. That's serious commitment.

I'd like to hear: which one is actually paying off for you so far, and which one are you still warming up on? Just curious — your honest answer helps me make both better.

Reply when you have a minute.

— Wyatt
```

---

## Implementation notes for the team

1. **GHL workflow setup**: each email triggers from a tag or pipeline-stage change, not a date. Members move at different speeds.
2. **Send timing**: 10:30 AM local time (highest open rate for older audience). Use GHL's timezone-aware sending.
3. **Reply-to**: real human inbox. These ask for replies; honor that.
4. **No bulk send**: these fire one-by-one, triggered by behavior. Never mass-send.
5. **Frequency cap**: max 1 celebration email per 3 days per member. If multiple trigger close together, queue and space.
6. **Suppression**: if member is in cancellation flow, suppress celebrations. Don't celebrate a member who's leaving.
7. **Track replies**: any member who replies to a celebration email gets tagged "high-engagement" — they're future testimonial candidates.

---

## Rollback

These are GHL-side workflows. To disable: pause the workflow in GHL. The emails themselves are stored in this file as source of truth — if GHL templates drift, restore from here.
