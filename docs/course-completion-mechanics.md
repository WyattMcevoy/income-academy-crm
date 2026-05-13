# Course Completion Mechanics

How the four pieces of completion infrastructure fit together. Read this before turning on GHL workflows.

---

## The four pieces

| Piece | What it is | Where it lives |
|---|---|---|
| 1. Module checkboxes | In-portal progress tracking | GHL (built-in feature, needs enabling per course) |
| 2. Milestone celebration emails | 8 trigger emails for key progression points | `docs/email-sequences/module-milestone-celebrations.md` |
| 3. Completion certificate | Printable PDF-ready cert with member name + course | `marketing/certificate/index.html` |
| 4. Course-complete share page | Celebration page + testimonial capture + share buttons | `marketing/course-complete/index.html` |

---

## 1. Module checkboxes — enabling in GHL

GHL has native progress tracking on course content. To enable:

1. Log into GHL → Membership area
2. For each course (4 of them) → Settings → enable "Progress tracking"
3. Confirm each module has a "Mark as complete" button visible to members
4. Test as a member: complete a module, verify the checkbox persists across sessions

**One catch:** GHL progress tracking is per-course, not global. There's no single "you've completed 23 modules across all Foundation Pass courses" dashboard. If you want that view, it's a Phase 2 custom build on the CRM dashboard side.

---

## 2. Milestone celebration emails — GHL workflow setup

All 8 emails live in [docs/email-sequences/module-milestone-celebrations.md](email-sequences/module-milestone-celebrations.md). For each one:

1. Create a GHL workflow
2. Trigger: tag added OR pipeline-stage change (NOT date-based — members move at different speeds)
3. Single email send action, then exit
4. From: Wyatt's real email address (not no-reply)
5. Reply-to: same real email

**Trigger tags to create in GHL** (these get added by member action — completing a module, uploading a worksheet, self-reporting an outcome):

| Tag | Triggers email |
|---|---|
| `completed-module-0-{course}` | Email 1: First Module Complete |
| `completed-module-4-{course}` | Email 2: Halfway Point |
| `day-45-no-commission` (affiliate-track + not yet earned) | Email 3: Affiliate Stage 2 check-in |
| `day-30-no-first-client` (bookkeeping-track) | Email 4: Bookkeeping outreach gate |
| `first-paid-client-bookkeeping` | Email 5: First-client celebration |
| `first-commission-affiliate` | Email 6: First commission |
| `completed-module-8-{course}` | Email 7: Course Complete |
| `completed-two-courses` | Email 8: Multi-course milestone |

**Frequency cap:** max 1 celebration email per 3 days per member. GHL supports this via workflow wait-step logic.

---

## 3. Completion certificate — how it works

URL pattern:

```
https://incomeacademy.biz/certificate/?name=Jane%20Doe&course=AI%20Side%20Income&date=2026-06-15
```

The page reads URL parameters and renders a personalized printable certificate.

**To trigger this from GHL:**

When `completed-module-8-{course}` tag fires, the celebration email (Email 7) should include a button:

```html
<a href="https://incomeacademy.biz/certificate/?name={{contact.full_name | url_encode}}&course={{custom.course_completed | url_encode}}&date={{date.today}}">
  View your certificate
</a>
```

GHL's merge field syntax may vary — confirm at workflow build time. Result: member clicks → lands on cert with their info pre-filled → prints or saves PDF.

**Storage:** the cert is not stored server-side. It's a stateless HTML page that renders from URL params. That's intentional — no PII at rest, no DB needed.

---

## 4. Course-complete share page — how it works

URL: `https://incomeacademy.biz/course-complete/?course=AI%20Side%20Income`

When a member completes Module 8, the celebration email (Email 7) routes them here. The page:

- Pulls course name from URL
- Shows three CTAs: certificate, share, story submission
- Captures testimonials via a GHL form (currently `TESTIMONIAL_FORM_PLACEHOLDER` — needs wiring)

### Wiring the testimonial form

Follow the same pattern as [docs/ebay-apply-setup.md](ebay-apply-setup.md):

1. In GHL → Sites → Forms → "+ Create form"
2. Name: `Course Completion Testimonial`
3. Fields (these field names MUST match the HTML):

| Field label | Field name | Type | Required |
|---|---|---|---|
| Your name | `full_name` | Text | Yes |
| Your email | `email` | Email | Yes |
| Completed course | `completed_course` | Text | No |
| Your story | `story` | Text area | Yes |
| Permission: first name + last initial | `permission_to_use_name` | Checkbox | No |
| Permission: full name | `permission_to_use_full` | Checkbox | No |
| Permission: anonymous only | `permission_anonymous` | Checkbox | No |

4. Get the form endpoint URL (`https://api.leadconnectorhq.com/widget/form/...`)
5. Open [marketing/course-complete/index.html](../marketing/course-complete/index.html), find `TESTIMONIAL_FORM_PLACEHOLDER`, replace with the real URL
6. Commit → Vercel deploys

**GHL workflow on submission:**
- Tag contact with `submitted-testimonial`
- Notify Wyatt by email
- Route to a "Testimonials to review" pipeline stage

The PLACEHOLDER pattern means the [scripts/check-placeholders.sh](../scripts/check-placeholders.sh) will catch it if you forget — add `TESTIMONIAL_FORM_PLACEHOLDER` to that script's list once you're ready to fail CI on it.

---

## Member-facing flow (end-to-end)

1. Member finishes Module 8 → marks it complete in GHL portal
2. GHL workflow fires → adds `completed-module-8-{course}` tag
3. Celebration Email 7 sends → contains certificate link with merge fields + course-complete page link
4. Member clicks certificate link → cert renders with their name → they print or save PDF
5. Member optionally returns to course-complete page → shares + submits testimonial
6. Testimonial form submit → tagged for review → enters Wyatt's pipeline
7. Wyatt reviews → if good, requests final permission to publish → adds to landing pages as proof artifact

This loop turns Module 8 completion into a proof-artifact pipeline. Every finisher is a potential testimonial.

---

## Implementation order

1. [ ] Update [scripts/check-placeholders.sh](../scripts/check-placeholders.sh) to include `TESTIMONIAL_FORM_PLACEHOLDER` once form is built (not yet — placeholder is fine while in dev)
2. [ ] Enable GHL progress tracking on all 4 courses
3. [ ] Create the trigger tags in GHL
4. [ ] Build the testimonial form in GHL → wire to course-complete page
5. [ ] Build the 8 GHL workflows (one per email, triggered by tag)
6. [ ] End-to-end test: complete Module 8 as a test member → verify cert + share page + testimonial form all work
7. [ ] Document the working flow in `docs/openclaw-handoff-*.md` for future reference

---

## Rollback

If the celebration emails or completion pages cause issues (too noisy, wrong people receive, etc.):

1. **Disable emails:** pause the GHL workflows
2. **Disable cert/share pages:** delete `marketing/certificate/` and `marketing/course-complete/` directories, commit, push. Vercel removes the routes. The email links would 404 but no data is lost.
3. **Revert:** all four pieces are documented here; rebuilding is straightforward.

Source of truth for the emails is [docs/email-sequences/module-milestone-celebrations.md](email-sequences/module-milestone-celebrations.md). Source of truth for the static pages is the HTML files. No DB writes happen as part of these mechanics — they're all stateless URL-driven.
