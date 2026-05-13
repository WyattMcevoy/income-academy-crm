# Vote-Next-Course Page Setup

Page: [marketing/vote-next-course/index.html](../marketing/vote-next-course/index.html)
URL: `https://incomeacademy.biz/vote-next-course`

Voting page for the fifth Foundation Pass course. Three options shown:
1. **Write & Publish a Book** (user's pick)
2. **Pet Sitting Side Business** (physical, low tech, retiree-friendly)
3. **Voiceover From Home** (work-from-couch, mature voices in demand)

Each option has identical structure (icon, tagline, 4 bullet points, "I'd buy this one" radio) so no option has a visual advantage. Card hover/select states give clear feedback.

---

## Part 1: Build the GHL form

1. GHL → Sites → Forms → "+ Create form"
2. Name: `Course #5 Vote`
3. Fields (names MUST match the HTML):

| Field label | Field name | Type | Required |
|---|---|---|---|
| Course vote | `course_vote` | Dropdown OR hidden text | Yes |
| Full name | `full_name` | Text | Yes |
| Email | `email` | Email | Yes |
| Why this one? | `why` | Text area | No |
| Source page | `source_page` | Hidden text | No |

Dropdown options for `course_vote` (match HTML values exactly):
- `write-and-publish-book`
- `pet-sitting-side-business`
- `voiceover-from-home`

4. Save form, copy the endpoint URL (`https://api.leadconnectorhq.com/widget/form/...`)

## Part 2: Wire the URL

In `marketing/vote-next-course/index.html`, find `VOTE_FORM_PLACEHOLDER` and replace with your endpoint URL.

The JS at the bottom of the file detects the placeholder string and shows a "thanks" inline instead of submitting. Once you replace, real submissions go to GHL.

## Part 3: GHL workflow on submission

Set up a workflow:

1. **Trigger:** form submission (Course #5 Vote)
2. **Action 1:** Tag contact with `voted-course-5-{course_vote value}` (e.g., `voted-course-5-write-and-publish-book`)
3. **Action 2:** Tag contact with `voter` (general voter tag for future first-access offer)
4. **Action 3:** Add to "Course 5 Voters" pipeline (or list)
5. **Action 4:** Auto-respond with "Thanks for voting" email (3-sentence template — confirm vote, explain next step)

## Part 4: Track votes

Two tracking options:

**Option A — Manual (simplest):**
Once a week, export the "Course 5 Voters" pipeline to CSV. Count by tag. Update a Google Sheet with running totals.

**Option B — Automated (later if volume justifies):**
GHL has a custom dashboard you can build with the count of each tag. Bake the live count into the voting page via a webhook polling a JSON endpoint. Worth doing only if you cross ~500 votes.

For first run, Option A is correct. Don't over-engineer.

## Part 5: Voting period + announcement

Suggested cadence:

1. **Week 1–2:** soft launch to warm email list. "We're building course #5 — help us pick."
2. **Week 3–4:** social posts + landing page links pointing to /vote-next-course.
3. **Week 5:** close voting (add banner: "Voting closed — winner announced [date]").
4. **Week 6:** announce winner via email blast to ALL voters. Include voter-only discount code for first access when the course launches.
5. **Builds the course over the next 60–90 days** (you've got the curriculum framework — see existing courses for the template).

## Part 6: How to use voter list when the course launches

When the winning course is ready:

1. Email everyone tagged `voted-course-5-{winning-option}` first
   - "Your pick won. Here's first access at $X (voter-only price)."
2. Then email everyone tagged `voter` (regardless of which option they picked) a week later
   - "Course #5 is live. Voters get a 20% launch discount."
3. Open to general Foundation Pass members two weeks after that

This rewards engagement, builds buyer loyalty, and segments your list cleanly.

---

## Privacy / compliance notes

- The page is index'able (`robots: index,follow`) — good for SEO + sharing
- No income claims anywhere in the option descriptions
- "Honest revenue expectations" callout on the Book option specifically — sets right expectations
- Email collection is opt-in by design (they're voluntarily submitting to vote)
- Add CAN-SPAM-compliant footer to the auto-response email (physical address + unsubscribe link + reply-to)

---

## Rollback

To take the page down: delete `marketing/vote-next-course/` directory → commit → Vercel removes the route. No data is lost in GHL.

If a different option emerges that you want to vote on instead: edit the three option cards in the HTML, update GHL form dropdown values to match, redeploy. Stateless — no migration needed.

---

## Why these three options specifically

Each option targets a different sub-audience within the over-50 / side-income demo:
- **Book** → intellectual / story-driven / lifelong-learner segment (overlaps with Affiliate audience)
- **Pet Sitting** → physical / animal-lover / low-tech segment (closer to Estate Sale audience, but indoor)
- **Voiceover** → creative / performer-leaning segment (different from existing courses — no overlap)

The split means the vote will produce real signal, not just "the loudest sub-audience wins." If Book wins easily, it tells you your audience is intellectual-leaning. If Pet wins, you have a more practical-minded audience than you thought. Either way, useful data.

The two "other options" should ideally be ones you'd actually be willing to build. If you'd be miserable building Voiceover even if it won, swap it for something you'd genuinely build. The vote needs to be honest — don't put a "trap" option on the ballot.
