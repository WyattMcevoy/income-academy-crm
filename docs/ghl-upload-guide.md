# GHL Course Content Upload Guide

How to take the course assets in `docs/courses/ai-side-income/` and `docs/courses/affiliate-marketing/` and turn them into deliverable lessons in your GoHighLevel member portal.

**Context**: Per the session primer, GHL currently has a placeholder course. This guide replaces it with real content for both AI Side Income Starter Kit and Honest Affiliate Marketing Starter.

**GHL location ID**: `c3HSS74ILjGye3pvGsHg`
**GHL product ID**: `c02c3923-c9f1-404f-a76f-e48f97b91206`

---

## Part 1: Understand the asset-to-GHL mapping

For each course in `docs/courses/<course-slug>/`:

| Course file | What it is | GHL destination |
|---|---|---|
| `curriculum.md` | Module + lesson outline | Each H2 becomes a Module; each H3 becomes a Lesson in the course |
| `prompts/*.md` (AI course) | Prompt library | Downloadable resource attached to the relevant module |
| `templates/*.md` | Fill-in-the-blank templates | Downloadable resources per module or course-wide |
| `scripts/sales-team.md` | Internal phone sales script | **Do NOT upload** — stays internal for phone team |
| `assistant/*.md` | Claude Project / custom GPT configuration | Set up externally (see Part 4), link to member portal |
| `copy/landing-page.md` | Marketing copy | Already wired into subdomain pages — not uploaded to GHL |

---

## Part 2: Upload a course (walkthrough, AI Side Income example)

### 2a. Log in
1. Go to `https://app.gohighlevel.com/`
2. Switch to the Income Academy sub-account (location ID `c3HSS74ILjGye3pvGsHg`)
3. Left sidebar → **Memberships** (or Courses, depending on GHL version)

### 2b. Create or replace the course
If a placeholder course exists:
- Click its name → Settings → either rename it to "AI Side Income Starter Kit" OR delete and create new

If creating fresh:
- **+ Create Course**
- Title: `AI Side Income Starter Kit`
- Description: first paragraph from `docs/courses/ai-side-income/README.md`
- Thumbnail: upload `marketing/brand/og-images/ai-og.jpg` (once generated — see asset prompts)
- Pricing: linked to $47 product (don't duplicate Stripe integration)

### 2c. Add modules and lessons
Open `docs/courses/ai-side-income/curriculum.md`. Each top-level module (`## Module 1 — Your AI Assistants, Explained`) becomes a GHL **Module**. Each subsection (`### Lesson 1.1`) becomes a **Lesson**.

For each lesson:
1. **+ Add Lesson** inside the module
2. Title: the subsection heading from `curriculum.md`
3. Content: paste the lesson body (markdown → GHL rich editor, preserve headings and lists)
4. Video: leave empty for now (flagged in session primer: real videos are still needed)
5. **Save**

Repeat through all 8 modules.

**Time estimate**: ~2-3 hours for AI course if pasting without video recording. Double that for affiliate.

### 2d. Attach downloadable resources per module
For the AI course, Module 5 ("Doing the Work") benefits from the full prompt library. Attach:
- `docs/courses/ai-side-income/prompts/01-writing-editing.md` → export as PDF → attach
- Same for `02-` through `08-`
- Or: combine all 8 files into one master PDF titled "AI Side Income — Complete Prompt Library"

For templates: Module 4 ("Landing Your First 3 Clients") should have `cold-outreach-sequence.md`, `proposal-template.md`, `discovery-call-script.md`, etc. attached.

**Tip**: Convert MD → PDF using any tool (pandoc, MD editors, or even pasting into Google Docs → Download as PDF).

---

## Part 3: Repeat for Affiliate Marketing course

Same flow, different source:
- Source: `docs/courses/affiliate-marketing/curriculum.md`
- Title: `Honest Affiliate Marketing Starter`
- Thumbnail: `marketing/brand/og-images/affiliate-og.jpg` (once generated)
- Templates to attach per module:
  - Module 3: `niche-evaluation-worksheet.md` (as spreadsheet or PDF)
  - Module 4: `affiliate-application-email.md`
  - Module 5-6: `product-review-outline.md`, `roundup-post-outline.md`, `guest-post-pitch.md`
  - Module 8: `ftc-disclosure-library.md`, `privacy-policy-starter.md`

---

## Part 4: Set up the Income Academy AI Assistant

This is the "custom Claude Project / GPT" promised on the landing pages. It's set up **outside** GHL but linked from within the course.

### 4a. Claude Project (primary)
1. Go to `https://claude.ai/` → Projects → **New Project**
2. Name: `Income Academy AI Assistant` (one per course, or a combined one)
3. Project knowledge: upload every file from `docs/courses/ai-side-income/` (curriculum, prompts, templates) — Claude Projects accept ~200K tokens of knowledge
4. Custom instructions: use the content of `docs/courses/ai-side-income/assistant/system-prompt.md` (check if this file exists; if not, write one based on the course's persona)
5. Test: ask it a question from the FAQ and verify it answers from the course, not the open internet
6. **Share** → Anyone with link can chat → copy link

### 4b. Custom GPT (for ChatGPT users)
1. Go to `https://chatgpt.com/gpts/editor`
2. Name: `Income Academy AI Assistant`
3. Instructions: paste the same system prompt
4. Knowledge: upload the same course files (GPTs accept up to 20 files, 512MB total)
5. Publish (anyone with link)

### 4c. Wire into GHL
In the AI course's final module or a sidebar resource card:
- Add a card: "Your Included AI Assistant"
- Two buttons: "Open in Claude (recommended)" → Claude Project URL; "Open in ChatGPT" → Custom GPT URL
- Instruction: "Both are pre-loaded with everything in this course. Ask it anything."

Repeat for Affiliate with a separate Project/GPT (or one combined assistant with a mode switch).

---

## Part 5: Set up the welcome automation

Per the session primer, a MailerLite automation already sends welcome emails to the "Starter Program Buyers" group (ID `185313701944886793`). Verify it:

1. MailerLite → Automations → find the welcome sequence
2. Check subject line references "AI Side Income" or "Income Academy" — not a generic placeholder
3. Check first email body includes: course login link, what to do first, support email
4. Email templates referenced in `marketing/brand/emails/` should be dropped in once generated (welcome-hero.jpg, email-banner-600.png, email-footer-200.png)

For the **affiliate course**: when you launch it, duplicate the AI welcome automation and swap the course-specific links / hero image / copy.

---

## Part 6: Final verification checklist

Before public launch of either course:

- [ ] All 8-9 modules have lesson content (not "[placeholder]")
- [ ] Each lesson has either a video OR clear written content (video ideal, text acceptable for v1)
- [ ] Downloadable resources attached to the relevant modules
- [ ] AI Assistant link is live and tested
- [ ] Welcome email references the correct course name + login URL
- [ ] Refund link in welcome email points to `incomeacademy.biz/refund`
- [ ] Course thumbnail matches the landing page (subdomain hero image)
- [ ] Stripe product → GHL course auto-provision is tested end-to-end (do a $47 test purchase)
- [ ] Legal review (FTC Biz Opp Rule) completed per session primer pending actions

---

## Estimated time

- AI course content upload (text-only, no video): **2-3 hours**
- Affiliate course content upload: **2-3 hours**
- AI Assistant setup (Claude + ChatGPT): **1 hour**
- Email template swap: **30 min** (once graphics exist)
- Video recording (if doing per-lesson): **10-20 hours** per course

**Fastest MVP launch**: text-only lessons + AI Assistant live + welcome email verified = ~6-7 hours across both courses. Video can follow.
