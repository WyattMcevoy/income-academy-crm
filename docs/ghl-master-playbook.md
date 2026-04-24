# GHL Master Playbook — Complete Launch Setup

The single document that walks you end-to-end through every GHL task for the Foundation Pass launch, in the right order. Consolidates and sequences the work that's broken across the other GHL docs.

**Total time**: ~10-14 hours of focused work, spread across multiple sessions. You do NOT need to finish this in one sitting. Each phase is a natural stopping point.

**Prerequisites checked**:
- [x] GHL sub-account "Income Academy" exists (location ID `c3HSS74ILjGye3pvGsHg`)
- [x] GHL API key + location ID already in Render env vars
- [x] Stripe → GHL auto-provisioning workflow is wired
- [x] Dedicated sending subdomain `go.incomeacademy.biz` configured
- [ ] All of the below — this playbook

---

## Phase order + time estimates

| # | Phase | Time | Can happen in parallel with… | Output |
|---|---|---|---|---|
| 1 | Branding Foundation | 30 min | AI asset generation | Logo, colors, favicon in GHL |
| 2 | Custom Domain Setup | 20 min + DNS wait | Phase 3 | `portal.incomeacademy.biz` live |
| 3 | Course Content Upload | 6-8 hrs | Phase 2 DNS propagation | 4 real courses in portal |
| 4 | AI Assistant Setup | 45 min | Phase 3 | Claude Project + GPT live |
| 5 | Welcome Email | 30 min | Phase 3 | Branded welcome email |
| 6 | Chat Widget | 15 min | Any | Widget on all landing pages |
| 7 | Apply-eBay Form | 15 min | Any | Qualifying form capturing leads |
| 8 | Grab URLs + Send to Me | 5 min | End of sequence | Members dashboard fully wired |

---

## Phase 1 — Branding Foundation (30 min)

**Why first**: everything after this benefits from the portal looking on-brand.

### 1.1 — Logo upload

Source assets: you'll create these per [asset-generation-prompts.md](asset-generation-prompts.md). If not yet created, use the SVG from `marketing/favicon.svg` as a temporary stand-in.

1. GHL → Settings (gear icon) → **Company Billing** → **Business Profile**
2. Upload:
   - **Logo (full color)**: `marketing/brand/logos/ia-horizontal-color.svg` (or temporary: take a screenshot of your site's top nav showing "IA Income Academy")
   - **Square icon**: `marketing/brand/logos/ia-mark-color.svg` (or temporary: the gold IA badge from your site)

### 1.2 — Brand colors

1. Same area → **Brand Settings** (or **Theme**)
2. Primary color: `#f59e0b` (Income Academy gold)
3. Secondary: `#0f172a` (navy)
4. Accent: `#1e293b` (navy-light)
5. Background: `#f8fafc` (cream)

### 1.3 — Favicon + browser title

1. Settings → **Company** → **General**
2. Browser title: `Income Academy — Members`
3. Favicon: upload `marketing/favicon.svg`

✅ **Done when**: you can see your logo in the GHL top-left and colors look right in the members area preview.

---

## Phase 2 — Custom Domain (20 min + DNS wait)

**Why second**: start DNS propagation early so it's ready when you need it in Phase 8.

### 2.1 — Add domain in GHL

1. GHL → Settings → **Domains** → **+ Add Domain**
2. Enter: `portal.incomeacademy.biz`
3. GHL displays a CNAME target (usually `systems.leadconnectorhq.com` or similar)
4. **Copy the CNAME target** — you'll paste it into Namecheap next

### 2.2 — Add DNS record at Namecheap

1. Namecheap → Domain List → Manage `incomeacademy.biz` → **Advanced DNS**
2. Add new record:
   - Type: `CNAME Record`
   - Host: `portal`
   - Value: *(the CNAME target GHL gave you)*
   - TTL: Automatic
3. Save

### 2.3 — Verify in GHL

1. Wait 10-30 min for DNS propagation
2. Return to GHL Domains page → click **Verify**
3. SSL cert auto-issues within another 5-10 min
4. Test: visit `https://portal.incomeacademy.biz` → should redirect to/load the GHL portal

✅ **Done when**: `portal.incomeacademy.biz` loads the GHL login screen with a valid SSL certificate.

---

## Phase 3 — Course Content Upload (6-8 hours, largest phase)

**This is the main lift.** Do this in chunks — one course per session or even one module per session.

Reference doc with step-by-step details: [ghl-upload-guide.md](ghl-upload-guide.md)

### 3.1 — Remove placeholder course

1. GHL → **Memberships** → find existing placeholder course → Delete or Archive

### 3.2 — Create all 4 courses

For each of the 4 courses, create a new course in GHL:

| Course # | Title | Source folder |
|---|---|---|
| 1 | AI Side Income Starter Kit | `docs/courses/ai-side-income/` |
| 2 | Honest Affiliate Marketing Starter | `docs/courses/affiliate-marketing/` |
| 3 | Estate Sale & Garage Sale Sourcing Academy | `docs/courses/estate-sale-sourcing/` |
| 4 | Bookkeeping From Home for Over-55s | `docs/courses/bookkeeping-from-home/` |

For each course:
1. **+ Create Course** in GHL Memberships
2. Title + description (from the course's `README.md`)
3. Upload the 1280×720 thumbnail (see Phase 3.4 below)
4. Pricing: bundle with existing Foundation Pass product (don't create separate checkout)

### 3.3 — Upload modules and lessons per course

For each course, open `docs/courses/<slug>/curriculum.md` and:

1. Each `## Module N — Title` becomes a GHL **Module**
2. Each subsection within a module becomes a **Lesson**
3. Paste the lesson body into GHL's rich-text editor (convert markdown → GHL formatting)
4. Video placeholder for now — upload real videos when recorded (can be done in a separate pass)
5. Attach downloadable resources (convert MD files to PDF via pandoc, Word, or Google Docs → Download as PDF):
   - AI course: prompt library PDFs (8 category files), templates (cold outreach, proposal, etc.)
   - Affiliate course: niche evaluation worksheet, FTC disclosure library, content templates
   - Estate Sale course: route planner, category cheat sheets, negotiation scripts (add these as you write them)
   - Bookkeeping course: engagement letter, pricing calculator, client intake form (add these as you write them)

### 3.4 — Course thumbnails (1280×720)

You can do these quickly in Canva. Pattern per course:

- **Background**: navy gradient (`#0f172a` → course-specific accent)
  - AI: navy → deep blue (`#1e40af`)
  - Affiliate: navy → emerald (`#065f46`)
  - Estate: navy → amber-brown (`#7c2d12`)
  - Bookkeeping: navy → deep purple (`#581c87`)
- **Foreground**: 2-letter abbreviation (AI, AM, ES, BK) in gold `#f59e0b`, huge (200+ pt), centered
- **Bottom strip**: "COURSE 1" / "COURSE 2" / etc. in small white letter-spaced uppercase

Canva workflow: design once, duplicate 4 times, swap accent + abbreviation. ~30 min for all 4.

### 3.5 — Checkpoint

After Phase 3, a test buyer who logs in should see:
- 4 courses listed in their member area
- Each course has modules + lessons (even if lessons are text-only for now)
- Downloadable resources attached to relevant modules
- Course thumbnails look branded

✅ **Done when**: you can log into GHL as a test member and navigate through all 4 courses.

---

## Phase 4 — AI Assistant Setup (45 min)

Reference: [ghl-upload-guide.md](ghl-upload-guide.md) Part 4

### 4.1 — Claude Project (recommended primary)

1. Go to `claude.ai` → Projects → **+ New Project**
2. Name: `Income Academy AI Assistant`
3. Upload project knowledge:
   - All files from `docs/courses/ai-side-income/` (curriculum, all prompts, all templates)
   - All files from `docs/courses/affiliate-marketing/` (curriculum, templates)
   - `docs/courses/estate-sale-sourcing/curriculum.md` + any templates you've written
   - `docs/courses/bookkeeping-from-home/curriculum.md` + any templates you've written
4. Custom instructions (use the course's persona — skeptical-audience-friendly, no hype, references modules by number)
5. Test with a sample question from the FAQ
6. Click **Share** → Anyone with link can chat → **Copy link**

### 4.2 — Custom GPT (optional, for ChatGPT users)

1. `chatgpt.com/gpts/editor` → **Create**
2. Name: `Income Academy AI Assistant`
3. Description: `Your personal AI assistant for the Income Academy Foundation Pass`
4. Instructions: same system prompt as Claude Project
5. Knowledge: upload same course files (GPTs accept up to 20 files, 512MB total — should fit)
6. Publish with link

### 4.3 — Link from member portal

In GHL Memberships → Create a top-level "Resources" or "Tools" section:
1. Add resource tile: **"AI Writing Assistant (Claude)"** → link to Claude Project URL
2. Add resource tile: **"AI Writing Assistant (ChatGPT)"** → link to GPT URL (if created)
3. Description for each: "Pre-loaded with every module and prompt. Ask it anything."

✅ **Done when**: clicking the tile from inside GHL opens Claude or ChatGPT with the assistant ready to go.

---

## Phase 5 — Welcome Email (30 min)

**Why it matters**: this is the FIRST thing a buyer sees after purchase. It sets the tone.

### 5.1 — Email service settings

1. GHL → Settings → **Email Services** (or **Email**)
2. **From name**: `Income Academy`
3. **From email**: `hello@incomeacademy.biz` (or `welcome@go.incomeacademy.biz` if using the dedicated sending subdomain)
4. **Reply-to**: `support@incomeacademy.biz`

### 5.2 — Customize welcome email template

1. GHL → Automations (or Workflows) → find the "Starter Program Buyers" automation (per primer, this already exists)
2. Open the first email in the sequence
3. Replace with:

**Subject**: `Welcome to the Foundation Pass — here's how to log in`

**Body** (paste this):

```
Hi {{first_name}},

Welcome to the Income Academy Foundation Pass.

Your 7-day free trial on the $19/mo membership has started. You have
full access to all 4 courses, the AI Writing Assistant, and the
community — starting right now.

Log in to your portal:
https://portal.incomeacademy.biz/

Your email: {{email}}
Your temporary password: {{password}}
(you'll be asked to set your own on first login)

Quick orientation:
1. Bookmark this email — it's your login link
2. Visit your Members Area at https://incomeacademy.biz/members for
   a pretty overview of all 4 courses
3. Start with whichever course feels right (most pick AI Side Income)
4. The AI Writing Assistant is in your portal's "Resources" section
5. Join the community from the sidebar

Questions? Just reply to this email — we actually read replies.

Welcome aboard,
The Income Academy team

---
7-day refund policy: https://incomeacademy.biz/refund
Cancel $19/mo membership anytime: one click from Account page
Earnings Disclaimer: https://incomeacademy.biz/disclaimer

Income Academy LLC · [YOUR MAILING ADDRESS — required by CAN-SPAM]
```

### 5.3 — Upload email header banner

Use `marketing/brand/emails/email-banner-600.png` (to be generated per asset-generation-prompts.md) as the header image.

✅ **Done when**: a test purchase triggers this email landing in your inbox, looking on-brand.

---

## Phase 6 — Chat Widget (15 min)

Reference: [chat-widget-setup.md](chat-widget-setup.md)

### 6.1 — Configure widget in GHL

1. GHL → **Sites** → **Chat Widget** → **+ Create** (or edit existing)
2. Settings:
   - Name: `Income Academy Main Site`
   - Header title: `Income Academy`
   - Welcome message: `Hi — questions about the starter training? I reply within an hour during business hours.`
   - Brand color: `#f59e0b`
   - Icon color: `#0f172a`
   - Position: Bottom-right
   - Fields to collect: Name + Email (required), Phone (optional)
   - Offline: "Collect email and reply later"
3. Save → **Install** → **Copy embed code**

### 6.2 — Paste back to me in chat

The embed looks like:
```html
<script src="https://widgets.leadconnectorhq.com/loader.js"
  data-resources-url="..."
  data-widget-id="YOUR_WIDGET_ID">
</script>
```

Paste the whole `<script>` block into chat here. I'll swap it into all 3 landing pages + the members dashboard + apply-eBay page in ~60 sec.

✅ **Done when**: visiting `incomeacademy.biz` shows a chat bubble bottom-right.

---

## Phase 7 — Apply-eBay Form (15 min)

Reference: [ebay-apply-setup.md](ebay-apply-setup.md)

### 7.1 — Create GHL form

1. GHL → **Sites** → **Forms** → **+ Create form**
2. Name: `eBay Done-With-You Application`
3. Add fields (names must match exactly):
   - `full_name` (Text, Required)
   - `email` (Email, Required)
   - `phone` (Phone, Required)
   - `experience_level` (Dropdown, Required): "Brand new — I haven't sold on eBay yet" / "Hobbyist — I sell a few items per month" / "Part-time — I sell $500-$1,500/mo" / "Serious — I sell $1,500-$5,000+/mo" / "Full-time — this is my main income"
   - `monthly_sourcing` (Text, Optional)
   - `fit_reason` (Text Area, Required)
   - `current_member` (Dropdown, Optional): "Not yet — applying as a prospect" / "Yes — active member" / "I'm in my 7-day free trial"
4. Save

### 7.2 — Get form endpoint URL

1. In the form editor → **Integrate** (or **Share**)
2. Copy the **API / Webhook URL** (looks like `https://api.leadconnectorhq.com/widget/form/XXXX`)

### 7.3 — Configure notifications + workflow

1. Form settings → **Notifications** → send yourself an email when an application arrives
2. Automations → Create workflow:
   - Trigger: new submission on this form
   - Action 1: tag contact `ebay-apply`
   - Action 2: add to pipeline stage "eBay Applicants"
   - Action 3 (optional): auto-reply email "Thanks, we'll review in 1-2 days"

### 7.4 — Paste endpoint URL back to me

Paste the form's API/webhook URL into chat. I'll swap `FORM_ID_PLACEHOLDER` in `marketing/apply-ebay/index.html` → ship in ~60 sec.

✅ **Done when**: a test submission from `/apply-ebay` creates a GHL contact + sends you an email.

---

## Phase 8 — Grab URLs + Send to Me (5 min)

The final step — wire the members dashboard to the real GHL.

### 8.1 — Copy course URLs (4 total)

For each of the 4 courses in GHL Memberships:
1. Open the course
2. Click **Share** (or **View as Member**)
3. Copy the URL (should be under `portal.incomeacademy.biz/library/...` or similar)

Paste all 4 URLs back to me in chat, labeled which is which. I'll swap:
- `GHL_COURSE_URL_AI` → AI Side Income URL
- `GHL_COURSE_URL_AFFILIATE` → Affiliate Marketing URL
- `GHL_COURSE_URL_ESTATE` → Estate Sale Sourcing URL
- `GHL_COURSE_URL_BOOKKEEPING` → Bookkeeping URL

### 8.2 — Copy portal base URL

After Phase 2 is complete, your portal base URL is `https://portal.incomeacademy.biz/` (or whatever GHL gave you).

Paste that too. I'll swap `GHL_PORTAL_BASE_URL` in the members dashboard nav + account row.

✅ **Done when**: clicking course tiles on `incomeacademy.biz/members` takes you into the GHL portal to watch lessons.

---

## Full end-to-end test after all phases

1. Buy the Foundation Pass with a test Stripe card
2. Receive welcome email within 2 minutes (branded, with your logo)
3. Click login link → land on `portal.incomeacademy.biz/login`
4. Set your password on first login
5. See 4 branded course tiles in your member area
6. Click into a course → modules + lessons load
7. Resources section shows AI Writing Assistant link
8. Click AI Assistant → Claude Project opens pre-loaded
9. Visit `incomeacademy.biz/members` → branded dashboard loads
10. Click a course tile → redirects into GHL portal
11. Cancel subscription test → confirms cancel works in one click

If all 11 steps work, your Foundation Pass is live-ready (pending real Stripe + LLC).

---

## Stuck on anything?

Each phase has its own dedicated doc for deeper detail:
- [ghl-portal-customization.md](ghl-portal-customization.md) — Phase 1 + 2 detail
- [ghl-upload-guide.md](ghl-upload-guide.md) — Phase 3 + 4 detail
- [chat-widget-setup.md](chat-widget-setup.md) — Phase 6 detail
- [ebay-apply-setup.md](ebay-apply-setup.md) — Phase 7 detail
- [asset-generation-prompts.md](asset-generation-prompts.md) — brand assets you'll need along the way

Ask me in chat — I can walk through specific screens or troubleshoot any step.
