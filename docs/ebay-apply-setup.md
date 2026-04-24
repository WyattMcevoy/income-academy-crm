# eBay Apply-to-Unlock Form Wiring (GHL)

The `/apply-ebay` landing page ships with a submit-intercept placeholder: submissions currently just show a "thank you" screen without actually saving the lead anywhere. Wire to GHL to capture real applications.

## Part 1: Create the form in GHL

1. Log into `app.gohighlevel.com`, switch to the Income Academy sub-account (`c3HSS74ILjGye3pvGsHg`)
2. Sidebar → **Sites** → **Forms**
3. **+ Create form** (use the form builder, not the funnel template)
4. Name: `eBay Done-With-You Application`
5. Add fields matching the HTML:

| Field label | Field name | Type | Required |
|---|---|---|---|
| Full name | `full_name` | Text | Yes |
| Email | `email` | Email | Yes |
| Phone | `phone` | Phone | Yes |
| Reselling experience | `experience_level` | Dropdown | Yes |
| Estimated inventory sourced per month (USD) | `monthly_sourcing` | Text | No |
| Why a fit? | `fit_reason` | Text area | Yes |
| Current Foundation Pass member? | `current_member` | Dropdown | No |

The field *names* (not labels) must match the HTML form's `name="..."` attributes exactly, or GHL will ignore the data.

6. Dropdown options for `experience_level`:
   - Brand new — I haven't sold on eBay yet
   - Hobbyist — I sell a few items per month
   - Part-time — I sell $500-$1,500/mo
   - Serious — I sell $1,500-$5,000+/mo
   - Full-time — this is my main income
7. Dropdown options for `current_member`:
   - Not yet — applying as a prospect
   - Yes — active member
   - I'm in my 7-day free trial
8. Save form.

## Part 2: Get the form endpoint URL

1. In GHL form editor → **Integrate** (or "Share" / "Embed")
2. Look for **API / Webhook URL** or **Form submission URL** — should look like:
   `https://api.leadconnectorhq.com/widget/form/ABC123DEF456`
3. Copy it.

## Part 3: Paste into the HTML

Open [marketing/apply-ebay/index.html](marketing/apply-ebay/index.html). Find this line (around the `<form>` tag):

```html
<form class="apply-form" id="apply-form" method="post" action="https://api.leadconnectorhq.com/widget/form/FORM_ID_PLACEHOLDER">
```

Replace `FORM_ID_PLACEHOLDER` (or the whole action URL) with your GHL endpoint. Commit → Vercel auto-deploys → form goes live.

The JS at the bottom of the file auto-detects placeholder and disables real submission. Once you replace, the script sees a real URL and lets the browser submit normally.

## Part 4: Configure GHL to route applications

1. In GHL form settings → **Notifications**:
   - Send yourself an email when an application arrives
   - Or auto-create a task in the Pipeline for the phone sales team
2. In GHL **Workflows** → new workflow:
   - Trigger: form submission (eBay Apply form)
   - Action 1: tag contact with `ebay-apply`
   - Action 2: add to "eBay Applicants" pipeline stage
   - Action 3 (optional): auto-respond with confirmation email ("Thanks, we'll review in 1-2 days")
   - Action 4 (optional): after 24 hours, notify Wyatt if not yet reviewed
3. Action for the phone sales team: review application, decide fit, email with consultation slots (or reject politely)

## Part 5: Test

1. Visit `https://incomeacademy.biz/apply-ebay`
2. Submit a test application with your own email
3. Verify:
   - Success message appears after submit
   - GHL contact is created with all fields captured
   - Notification email arrives
   - Workflow tags applied correctly

## Rollback

If the form is causing issues:
1. Replace the action URL back to `FORM_ID_PLACEHOLDER` (the intercept JS will take over again)
2. Or delete the `/apply-ebay` page entirely — the locked eBay tile on the main site's Members Area just 404s, which is better than broken form submissions

## Notes

- The GHL form endpoint is **public** (it's the URL anyone's browser POSTs to). Not a secret — safe to commit.
- Do NOT put any GHL API key in the HTML. GHL form submission is unauthenticated by design (spam protection is server-side).
- For spam protection: add reCAPTCHA or honeypot field later (not needed for v1 given low expected volume).
