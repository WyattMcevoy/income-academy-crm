# Premortem: First Email Campaign Launch

**Technique:** Imagine it's 30 days after launch and the campaign FAILED. What went wrong?

Then: for each failure mode, decide if the risk is real, how to prevent it, and whether it's a blocker or just something to watch.

---

## Imagined failure scenarios (worst-case, 30 days post-launch)

### Scenario A: "We got 0 sales because Stripe wasn't live"

**Story:** Emails went out. Open rate was great. Click rate was great. People hit the checkout page and got an error or a successful "test mode" message. Zero real revenue. Some asked for refunds on charges that didn't actually go through, generating confusion.

- **Probability:** HIGH if not fixed before launch
- **Impact:** CATASTROPHIC (kills the campaign + trust)
- **Mitigation:** Switch Stripe to live mode BEFORE first email goes out. Even as sole proprietor while LLC pending.
- **Blocker?** YES. Do not send any email until verified.
- **Verification step:** Wyatt makes a real $1 test purchase from his own card before launch. Confirms it actually charges and triggers the welcome email.

---

### Scenario B: "MailerLite suspended us for spam complaints"

**Story:** Imported the 40k Google Docs list into MailerLite. Sent the campaign. People who don't remember signing up reported spam. Spam complaint rate hit 0.4%. MailerLite suspended the account. Can't send anything for 2 weeks. The 1k warm list also can't be reached.

- **Probability:** HIGH if we send to cold 40k without warming up
- **Impact:** SEVERE (lose ability to send for 1-2 weeks, sender reputation damaged for months)
- **Mitigation:** Send first campaign ONLY to the warm 1k. Warm up the 40k in batches of 500 with a re-engagement sequence.
- **Blocker?** YES for the 40k. The 1k can launch safely.
- **Verification step:** Confirm MailerLite list is exactly the warm 1k before sending.

---

### Scenario C: "30% refund rate because the videos weren't ready"

**Story:** Founding members bought and logged in. Module 1 of AI Side Income had Linda. Modules 2-9 had no video. Other 3 courses had zero videos. Customers felt misled - they thought they were buying a video course. Refund requests poured in.

- **Probability:** MEDIUM-HIGH if we don't frame expectations clearly
- **Impact:** MODERATE (refunds eat into revenue + Stripe disputes hurt account)
- **Mitigation:** Either:
  - (a) Wait until AI Side Income's 9 videos are done before launching
  - (b) Frame as "early access" - "videos roll out weekly through August. Written lessons are your source of truth right now."
- **Blocker?** Only if option (b) isn't communicated clearly in the emails AND on the checkout page AND in the welcome email
- **Verification step:** Wyatt logs in as a member, reads the experience cold, asks "would I feel ripped off?"

---

### Scenario D: "Stripe held our funds for 30 days because we were a new sole prop"

**Story:** Wyatt set up Stripe Live as a sole proprietor 3 days before launch. Did $4,000 in first-week revenue. Stripe flagged "high-velocity new account" and held all funds for 30-day review. Wyatt has to pay refunds out of pocket. Cash flow problem.

- **Probability:** MEDIUM (common with new sole-prop Stripe accounts that suddenly process)
- **Impact:** MODERATE (cash flow stress, not catastrophic)
- **Mitigation:**
  - Set up Stripe 2-3 weeks before launch if possible, not 3 days before
  - Do 5 small test transactions (with real cards, immediately refunded) in the first week to "warm" the Stripe account
  - Have $1-2k personal cushion to cover refunds while funds are held
- **Blocker?** No, but plan for it
- **Verification step:** When Stripe is set up, immediately do 3-5 small test purchases ($1-5) to demonstrate normal activity

---

### Scenario E: "Founding members hated the 30-min Zoom requirement"

**Story:** Wyatt didn't have time to do 20 × 30-min Zooms. Skipped some, rescheduled, no-showed. Founding members felt promised something that didn't materialize. 1-star reviews.

- **Probability:** MEDIUM (Wyatt has limited time, scheduling 20 calls is real work)
- **Impact:** MODERATE (reputation damage from the most-vocal customers)
- **Mitigation:** Either:
  - (a) Make the Zoom optional - "if you'd like, I'll do a 30-min call"
  - (b) Batch into group Zooms - 1 group call per week, all 20 attend together
  - (c) Skip the Zoom and replace with a "founding member private Slack/Telegram"
- **Blocker?** No, but pick the model before promising it
- **Verification step:** Wyatt commits to a calendar block for Zooms BEFORE the campaign goes out

---

### Scenario F: "Email subject lines triggered spam filters"

**Story:** Subject lines included words like "income," "make money from home," "earn $1,500." Spam filters caught them. 40% of emails landed in promotions tab or spam folder. Open rate was 12% instead of 35%.

- **Probability:** HIGH for income-claim language
- **Impact:** MODERATE (reduced reach, not catastrophic)
- **Mitigation:**
  - Avoid trigger words: "income," "earn," "make money," "$$$," excessive caps
  - Use curiosity-based subjects: "Quick question," "Are you in?," "A weird story"
  - A/B test 2 subject lines on the first send
- **Blocker?** No
- **Verification step:** Run final subject lines through a free spam-checker tool (mail-tester.com)

---

### Scenario G: "FTC came knocking about income claims"

**Story:** Email said "students earn $1,500-$3,500/month." Some did, some didn't. A consumer reported the claims to the FTC. Investigation opened. Even if dismissed, the legal stress and time cost is significant.

- **Probability:** LOW for a small early launch
- **Impact:** SEVERE if it happens
- **Mitigation:**
  - Income claims must be substantiated or "typical results" qualified
  - Add an earnings disclaimer to every email AND every landing page
  - Use language like "students who follow the course consistently for 90 days report..." not "students earn..."
  - Have attorney review the language eventually
- **Blocker?** No for first 20 founding members. Yes before scaling to 40k.
- **Verification step:** Re-read all campaign emails specifically for income-claim language. Soften every absolute statement.

---

### Scenario H: "Customers complained the course was unfinished"

**Story:** Buyers reached Module 4 of AI Side Income, found the lesson content great but no video. Or visited the eBay graduation tier and found it "coming soon." Complaints flooded support email.

- **Probability:** MEDIUM
- **Impact:** MODERATE
- **Mitigation:**
  - Foundation Pass landing page explicitly says "9 modules per course, lesson content live, videos rolling out August-September"
  - The eBay graduation page should say "applications opening Q3 2026"
  - Set expectations BEFORE they buy
- **Blocker?** No, just needs honest landing page copy
- **Verification step:** Update marketing/index.html with clear "what you get today vs. what's rolling out" sections

---

### Scenario I: "I never tested the actual flow as a customer"

**Story:** Wyatt sent the campaign without ever experiencing it as a buyer. The checkout had a bug. The welcome email had a typo. The portal navigation was confusing. First 5 buyers all hit different issues.

- **Probability:** MEDIUM
- **Impact:** MODERATE
- **Mitigation:** Wyatt does a complete dry run as a customer 24 hours before launch:
  - Receives the email (test send)
  - Clicks the link
  - Hits checkout
  - Pays $1 with real card
  - Receives welcome email
  - Logs into portal
  - Reads Module 0 of AI Side Income end-to-end
  - Confirms everything works
- **Blocker?** YES. Don't launch without this dry run.

---

### Scenario J: "I oversold and the product underdelivered"

**Story:** Email copy said "everything you need to make $1,500-$3,500/month." Founding members expected a turnkey system. Reality: it's a course requiring 60+ days of consistent work. Felt mismatched.

- **Probability:** HIGH if the copy is hype-y
- **Impact:** MODERATE (refunds + bad word-of-mouth)
- **Mitigation:** Match the email tone to the course tone:
  - Promise "the playbook + the templates + the support"
  - Acknowledge it takes 60-90 days
  - Lean into "no hype" positioning - it's an asset, not a liability for your audience
- **Blocker?** No, but a real copy guideline
- **Verification step:** Compare email copy claims to the actual course copy. Match the honesty level.

---

### Scenario K: "I burned out within 14 days"

**Story:** First-week excitement -> 50 emails to support -> 8 refund requests -> 12 Zoom requests -> Wyatt working 12 hours/day -> burnout -> course quality suffers -> launch dies.

- **Probability:** MEDIUM
- **Impact:** SEVERE long-term
- **Mitigation:**
  - Limit founding cohort to 20 max (not 30)
  - Block ZERO weekend work for first 30 days
  - Set up email auto-response for support@ that says "expect a reply within 24 business hours"
  - Pre-write FAQ doc to handle 80% of questions
- **Blocker?** No, but plan for it
- **Verification step:** Block Wyatt's calendar for "founding member support" hours BEFORE launch

---

### Scenario L: "Test purchase worked, real purchase didn't"

**Story:** Wyatt's test purchase succeeded. He sent the campaign. First real buyer tried to pay and got a Stripe error - their card type wasn't accepted, or the address validation failed, or something subtle. They emailed support. By the time Wyatt responded, they'd lost interest.

- **Probability:** LOW-MEDIUM
- **Impact:** MODERATE
- **Mitigation:**
  - Enable common payment methods: Stripe + maybe PayPal
  - Use Stripe's address validation lenient settings
  - Have an auto-reply on support@ saying "if you had a checkout issue, click here to retry or here to message us directly"
- **Blocker?** No
- **Verification step:** Test with 2-3 different cards/devices before launch

---

## Top 5 to fix BEFORE first email goes out

In priority order, the things that must be addressed:

### 1. Stripe Live mode active + tested with real $1 transaction

Set up as sole prop today. Charge yourself $1. Confirm money lands. Refund.

### 2. Customer dry-run end-to-end

Buy as a real customer (with another card, another browser, another email). See the full flow. Fix every bug found.

### 3. Send ONLY to warm 1k MailerLite list, NOT the cold 40k

Save the 40k for a re-engagement campaign in week 2-3 after the founding cohort is locked.

### 4. Set expectations clearly about videos

Landing page + email both say "lesson content live now, module videos rolling out weekly through August/September."

### 5. Cap founding cohort at 20, not 30

Lower load on you, higher attention per customer, better feedback loop.

---

## Top 3 to fix DURING the campaign (not blocking launch)

### 1. Pre-written FAQ for support questions

Write the 10 most likely questions BEFORE launch. Save them as canned responses in your email. Save 80% of your support time.

### 2. Calendar block for founding member Zooms

If you commit to the Zoom, block the calendar BEFORE the campaign. Otherwise it slips.

### 3. Cash cushion for Stripe holds

Have $1-2k available to cover refunds if Stripe holds first-week funds.

---

## Sign-off checklist before launch

Wyatt completes ALL of these before first email goes out:

- [ ] Stripe Live mode active
- [ ] Made a $1 test purchase with real card, confirmed money landed
- [ ] Completed full customer dry-run with new email/browser
- [ ] Welcome email triggers when someone buys (test verified)
- [ ] Course content visible in member portal post-purchase (verified)
- [ ] MailerLite list is the warm 1k only, NOT migrated 40k
- [ ] All campaign emails reviewed for spam-trigger words
- [ ] Landing page mentions "videos rolling out weekly through August"
- [ ] Support@ auto-responder set up
- [ ] 20-spot cap on founding offer is enforced (counter on landing page)
- [ ] Calendar blocked for first-month founding member support
- [ ] FAQ doc with top 10 questions written
- [ ] $1-2k cash cushion available
- [ ] Spam-checker run on all email copy (mail-tester.com)
- [ ] At least one human (friend, family member) read the campaign emails

When all 14 boxes are checked: SEND.

If any box is unchecked: DON'T SEND.
