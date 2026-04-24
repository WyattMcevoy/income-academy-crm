# GHL Portal Customization Guide

How to make the GoHighLevel member portal look as on-brand as possible while we're still using it as the course-content host. Settings to max out before going live.

**Strategy**: pair this with the custom `/members` landing page on our own site. Members land at `incomeacademy.biz/members` (beautiful, on-brand), see course tiles, click into GHL to watch lessons. The GHL portal handles content delivery; the custom landing handles first impressions.

---

## Part 1: Brand settings in GHL

### 1a. Company logo

1. GHL → **Settings** → **Company** / **Business Profile**
2. Upload **`marketing/brand/logos/ia-horizontal-color.svg`** (create per [asset-generation-prompts.md](asset-generation-prompts.md) if you haven't yet)
3. Also upload the square icon: **`marketing/brand/logos/ia-mark-color.svg`**

### 1b. Brand colors

1. GHL → **Settings** → **Company** → **Brand**
2. Primary color: `#f59e0b` (Income Academy gold)
3. Secondary color: `#0f172a` (navy)
4. Accent color: `#1e293b` (navy-light)
5. Background: `#f8fafc` (cream) or white

These colors flow through to the member portal nav, buttons, and highlights. Not every GHL screen respects them, but most do.

### 1c. Favicon + browser title

1. GHL → **Settings** → **Company** → **General**
2. Upload **`marketing/favicon.svg`** (or the 32px PNG version)
3. Set browser title: `Income Academy — Members`

---

## Part 2: Custom domain for the portal

Instead of `app.gohighlevel.com/xxx` or `clientclub.net/xxx`, use a branded subdomain.

### 2a. Add the subdomain at Namecheap

Domain: `incomeacademy.biz` → Advanced DNS → add:

| Type | Host | Value | TTL |
|---|---|---|---|
| CNAME | `portal` | (value from GHL — see 2b) | Automatic |

Wait, don't add yet — GHL will give you the target value. See 2b first.

### 2b. Configure custom domain in GHL

1. GHL → **Settings** → **Domains** → **+ Add Domain**
2. Enter: `portal.incomeacademy.biz`
3. GHL will display DNS records to add at your registrar — usually a CNAME pointing to something like `systems.leadconnectorhq.com`
4. Go back to Namecheap, add the CNAME with that target
5. Wait ~10-30 min for DNS propagation
6. Return to GHL, click **Verify**
7. SSL cert auto-issues within another 5-10 min

### 2c. Update the custom Members Dashboard

Once `portal.incomeacademy.biz` is live, replace `GHL_PORTAL_BASE_URL` in [marketing/members/index.html](marketing/members/index.html) with `https://portal.incomeacademy.biz/`.

---

## Part 3: Course thumbnails (matters more than you think)

Ugly default GHL thumbnails = portal feels amateur. Custom thumbnails = portal feels professional.

### Specs per course

- **Size**: 1280×720 (16:9 aspect ratio)
- **Format**: JPG or PNG
- **File size**: under 500KB

### Brand direction

Consistent treatment across all 4:
- **Background**: navy gradient (`#0f172a` to course-specific accent)
  - AI: navy + deep blue (`#1e40af`)
  - Affiliate: navy + emerald (`#065f46`)
  - Estate Sale: navy + amber-brown (`#7c2d12`)
  - Bookkeeping: navy + deep purple (`#581c87`)
- **Foreground**: 2-letter abbreviation in gold (`#f59e0b`), 200pt+, centered
- **Bottom strip**: small uppercase label "COURSE 1", "COURSE 2", etc. in white

**Quickest way to make these**: Canva template, apply once, duplicate 4 times with different accents. ~30 min total.

### Upload path

1. GHL → **Memberships** → click each course → **Settings** → **Cover Image**
2. Upload the 1280×720 thumbnail
3. Also set it for **Listing Image** if that's a separate field

---

## Part 4: Member portal navigation

Clean up the sidebar/header that members see when logged in.

1. GHL → **Memberships** → **Portal Settings** (or **Client Portal** if on newer UI)
2. Disable anything you don't need in the sidebar:
   - Gift Cards (no)
   - Affiliate Portal (unless you actually want members to affiliate for you — probably not yet)
   - Invoice/Payments (keep — they'll use this to cancel)
   - Messaging (keep if using the inbox feature)
3. Rename sections if needed:
   - "My Courses" → "My Foundation Pass"
   - "My Account" → "My Account & Billing"

---

## Part 5: Welcome email branding

New members get an auto-email from GHL with login instructions. Make it look like yours, not GHL's.

### 5a. Email settings

1. GHL → **Settings** → **Email Services** (or **Email Settings**)
2. **From name**: `Income Academy`
3. **From email**: `hello@incomeacademy.biz` (must be a verified domain — `go.incomeacademy.biz` is already configured per primer)

### 5b. Welcome email template

1. GHL → **Memberships** → **Email Templates** → **Welcome Email**
2. Replace default template with:
   - Subject: `Welcome to the Foundation Pass — here's how to log in`
   - Body: use the template below
3. Upload **`marketing/brand/emails/email-banner-600.png`** as the header banner
4. Footer includes **`marketing/brand/emails/email-footer-200.png`** + mailing address (CAN-SPAM requirement)

#### Welcome email template (paste in)

```
Hi {{first_name}},

Welcome to the Income Academy Foundation Pass.

Your 7-day free trial on the $19/mo membership has started. You have
full access to all 4 courses, the AI Writing Assistant, and the
community starting right now.

Log in here: https://portal.incomeacademy.biz/

Your username: {{email}}
Your temporary password: {{password}} (you'll be asked to set your own)

Quick orientation:
1. Bookmark this email — it's your login link
2. Start with whichever course feels right (most pick AI Side Income)
3. The AI Writing Assistant is in "My Resources"
4. Join the community from the sidebar

Questions? Just reply to this email — we actually read replies.

Welcome aboard,
The Income Academy team

---
Refund policy: https://incomeacademy.biz/refund
Cancel $19/mo anytime in one click from your Account page
Earnings Disclaimer: https://incomeacademy.biz/disclaimer
Income Academy LLC · [YOUR BUSINESS ADDRESS]
```

---

## Part 6: Custom CSS (if on a plan that allows it)

GHL's Pro+ plans allow custom CSS injection in some places. Free/lower plans do not. Check your plan.

If available, inject this at **Settings** → **Custom CSS**:

```css
/* Income Academy portal polish */

/* Member dashboard cards — rounder, softer */
.member-dashboard .course-card,
.client-portal .course-card {
  border-radius: 14px !important;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06) !important;
  transition: transform 150ms, box-shadow 150ms !important;
}
.member-dashboard .course-card:hover {
  transform: translateY(-3px) !important;
  box-shadow: 0 16px 40px rgba(0,0,0,0.1) !important;
}

/* Primary CTA buttons — Income Academy gold */
.btn-primary,
.member-portal .btn-primary {
  background: #f59e0b !important;
  color: #0f172a !important;
  border-color: #f59e0b !important;
  font-weight: 700 !important;
}
.btn-primary:hover {
  background: #d97706 !important;
}

/* Remove default GHL branding watermarks */
.ghl-watermark,
.powered-by-ghl {
  display: none !important;
}

/* Navigation active state */
.sidebar-nav .active {
  background: rgba(245, 158, 11, 0.1) !important;
  color: #f59e0b !important;
}
```

---

## Part 7: Final polish checklist

- [ ] Logo uploaded (full + mark)
- [ ] Favicon set
- [ ] Brand colors in GHL settings
- [ ] Custom domain `portal.incomeacademy.biz` live + SSL verified
- [ ] Custom course thumbnails uploaded (4 courses)
- [ ] Welcome email customized + branded
- [ ] Sidebar navigation cleaned up (unused modules hidden)
- [ ] Custom CSS applied if on eligible plan
- [ ] GHL_* placeholders replaced in [marketing/members/index.html](marketing/members/index.html)
- [ ] Test full flow: buy with test card → receive welcome email → log in → see 4 courses → watch a lesson → cancel subscription → verify cancel works

---

## What GHL still won't let you do (the native-portal case)

Even with all of the above, GHL's portal will still:
- Have slightly off-brand UI elements you can't override
- Show GHL-branded loading screens and error pages in some places
- Feel like "a GHL site with your logo" rather than "an Income Academy site"

That's the ceiling on customization. When it becomes the bottleneck for member retention or word-of-mouth, we build native. Until then, this customization gets you 80% of the way there with 20% of the engineering cost.
