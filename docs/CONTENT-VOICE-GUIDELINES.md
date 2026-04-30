# Content Voice Guidelines — Income Academy

**Captured**: April 30, 2026 — Wyatt approved this voice during demo prep session.

## The voice in one sentence

**Write like you're walking your 65-year-old neighbor through their first day on a new computer — patient, specific, every step spelled out, fallbacks for when something breaks.**

## Audience reminder

US adults 50-75. Semi-retired or near-retirement. Smart but **not technical**. Skeptical of hype. Many of them are doing something online for the first time. They've signed up for the Foundation Pass because they want a real income stream — not because they enjoy figuring out tech.

A 60-year-old retired schoolteacher should be able to follow every instruction without ever feeling stupid for asking what a button does.

## What "hand-holding" looks like in practice

**Bad** (current curriculum):
> Create free accounts on ChatGPT and Claude. Have a 10-minute conversation with each.

**Good** (the rewrite Wyatt approved):
> 1. Open your web browser — Safari, Chrome, Firefox, whichever you use to check email. If you're not sure, look at the bottom of your screen for an icon that looks like a compass (Safari) or a colored circle (Chrome).
> 2. Find the address bar — the long white box at the top.
> 3. Type `chat.openai.com` and press Enter.
> 4. You'll see a "Welcome to ChatGPT" page with a blue "Sign up" button. Click it.
> 5. Choose how to sign up — "Continue with Google" is fastest if you have a Gmail address.
> 6. Once you're in, find the chat box at the bottom that says "Message ChatGPT…" — click inside it.
> 7. Type a question. Some starters: "Explain inflation like I'm 12." Press Enter.
> 8. Watch the response appear, word by word. Ask a follow-up. Keep going for 10 minutes.

The full sample rewrite is in the conversation history (April 30 session) and shows the level of detail expected.

## Style rules

1. **Number every step.** "1. … 2. … 3. …" not paragraphs.
2. **Say where to look.** "Top right corner" / "the long white box at the top" / "the icon that looks like a compass."
3. **Show the exact text to type** in code formatting: `chat.openai.com`, not "chat.openai.com."
4. **Pre-empt confusion.** "If you've never done this before, here's what to expect: …"
5. **Add a 'If you got stuck' section** at the end of every lesson with common errors + how to fix.
6. **Time estimates.** Tell them upfront: "Total time: 25 minutes."
7. **Reassurance, not hype.** Avoid "rockstar" / "ninja" / "crush it." Use "this is normal," "everyone struggles with this at first," "you're not alone."
8. **One concept per paragraph.** Don't stack ideas. Break them out.
9. **Plain language.** "Address bar" not "URL field." "Click" not "tap." "The button at the bottom" not "the CTA."
10. **Test it on a 65-year-old in your head.** If they'd ask a clarifying question, the copy needs another sentence.

## What gets the rewrite

When the time comes (post-demo, per Wyatt's instruction):

- All 36 module bodies (4 courses × 9 modules) — `docs/courses/*/curriculum.md` AND the lesson copy that lives inside GHL
- All 4 course landing pages — `docs/courses/*/copy/landing-page.md`
- Welcome email sequence — `docs/email-sequences/foundation-pass-welcome.md`
- Sales scripts — `docs/courses/*/scripts/sales-team.md`
- Quiz lead-magnet copy — `marketing/quiz/`
- AI Writing Assistant Claude Project system prompt — `docs/courses/*/assistant/claude-project.md`

Probably NOT getting rewritten:
- Prompts library (`docs/courses/*/prompts/`) — these are for the user to give to ChatGPT/Claude, different audience
- Templates (`docs/courses/*/templates/`) — same, instructional but used as documents

## When to do the rewrite

Per Wyatt: **after the demo is shippable** (current focus) and **before generating the 35 remaining HeyGen Linda videos**. The video script will read whatever copy is in the curriculum, so the rewrite has to come before the videos — otherwise we'd burn HeyGen credits on the old copy and have to redo them.

Sequence:
1. Demo finishes (current work)
2. Wyatt shows demo to friends, gathers reactions
3. **Then**: I do the full content rewrite pass across all 36 modules + landing copy + emails
4. Wyatt reviews + approves a few sample modules before I commit the rest
5. Capture HeyGen workspace look_id
6. Generate 36 Linda module videos (or 36 different per-course avatar videos per Wyatt's later idea)

## How I'll deliver the rewrite

When the time comes:
1. Start with **AI Side Income → Module 0** as the pilot (the one in the example above is already partially written)
2. Commit it as a single PR / commit
3. Wyatt reviews and either approves the voice or asks for adjustments
4. Once approved, I roll the same voice across the other 35 modules + landing pages + emails in one batch
5. Diff is reviewable in git so Wyatt can spot-check anything

Estimated effort: ~half a day of agent time for the full pass once the voice is locked.
