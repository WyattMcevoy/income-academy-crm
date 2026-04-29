# Foundation Pass — Demo Walkthrough

**Goal**: in ~10 minutes of clicking, get from current state to "show this to a friend and they can buy → log in → see Linda's video".

---

## Status of everything (April 29, 2026)

### ✅ DONE — no action needed

- Foundation Pass site live at `incomeacademy.biz`
- 4 hero images on landing pages (AI/Affiliate/Estate Sale/Bookkeeping)
- All 4 GHL courses with 9 modules + 9 lessons each
- Members dashboard wired with real GHL course URLs (clicking "Continue Learning" → goes into GHL portal)
- 4 course thumbnails uploaded to GHL ✓
- HeyGen Video 1 (Linda) downloaded — `marketing/videos/heygen/be490f1bcc8e4f9cbd0f17d16dd2f561.mp4`
- 5 SaaS expenses logged in CRM Expenses page (GHL, Workspace, HeyGen, both Namecheap)
- GHL portal **Branding** saved: Portal Name "Income Academy", Description, Support Email, Copyright, Custom CSS (navy + gold injected)
- Smoke test 14/14 green
- Admin CLI shipped — direct DB access, no token dance
- OpenClaw handoff doc written for future agents

### ⏳ YOUR 8 STEPS to complete the demo

Each step takes 30-60 seconds. Do them in order in Chrome (tab is already open to the GHL Branding page):

---

## Step 1 — Set Brand Color One = gold (#f59e0b) [30s]

Why: this is the primary CTA button color customers see in the portal.

1. Scroll up on the current Branding page until you see "Brand Color One"
2. Click the small **blue square** next to it
3. In the popup, click into the **HEX** input field (currently shows `#004EEBFF`)
4. Triple-click to select all → type `f59e0b` → press **Enter**
5. Click anywhere outside the popup to close it

The square should turn gold/amber. If it stays blue, click the swatch again, click directly in the rainbow gradient strip, drag your mouse to the gold zone (yellow-orange area), release.

## Step 2 — Set Brand Color Two = navy (#0f172a) [30s]

Same pattern, lower swatch. HEX value: `0f172a`

## Step 3 — Upload Logo [45s]

1. Open Finder to: `/Users/wyattsmac/Documents/Income Academy CRM/marketing/brand`
   - (Or run in Terminal: `open "/Users/wyattsmac/Documents/Income Academy CRM/marketing/brand"`)
2. You'll see SVG logo files. The one to use: `logos/logo-mark-color.svg` (square, 1:1 ratio)
3. Drag it onto the **Logo** drop zone on the GHL Branding page (the box that says "Click or drag a file to this area to upload, max 200×200 px")

If GHL rejects the SVG, convert to PNG first by running:
```bash
node "/Users/wyattsmac/Documents/Income Academy CRM/server/src/tools/svg-to-png-playwright.js"
```
Then drag from `marketing/brand/png-exports/`.

## Step 4 — Upload Favicon [30s]

Same process, smaller image. Drag the same `logo-mark-color.svg` onto the **Favicon** drop zone (16×16 px max).

## Step 5 — Click "Save Settings" at the bottom [5s]

Bottom-right of the Branding page. You should see "Brand Setting Updated!" toast.

## Step 6 — Upload Linda Video 1 to AI Side Income Module 1 [2 min]

1. In GHL go to: **Memberships → Courses → AI Side Income Starter Kit → Outline**
2. Click into **Module 1 — Your AI Assistants, Explained**
3. Click into the lesson (also titled "Your AI Assistants, Explained")
4. Find the video upload area
5. Open Finder: `open "/Users/wyattsmac/Documents/Income Academy CRM/marketing/videos/heygen"`
6. Drag `be490f1bcc8e4f9cbd0f17d16dd2f561.mp4` onto the video upload area
7. Wait for upload (~30s for 7.6 MB)
8. Click **Save**, then change status from **Draft** → **Published**

## Step 7 — Capture Saffron's workspace look_id (only if you want the next 35 videos auto-generated) [2 min]

1. Open `https://app.heygen.com` in a new tab (already logged in)
2. Press **F12** → click the **Network** tab
3. Click the filter box, type `look`
4. Click **Create Video** with Saffron avatar
5. Look at the network requests that appear — find one with `look_id` in the request payload
6. Copy the `look_id` value (a long hex string)
7. Paste it back to me in chat — I'll build the batch generator and run it overnight

## Step 8 — Test the demo flow yourself [1 min]

1. **New incognito window** (Cmd+Shift+N — bypasses your logins)
2. Visit `https://incomeacademy.biz`
3. Click "Get Access" or scroll to pricing → click bundle button
4. On the checkout page, use Stripe test card: **4242 4242 4242 4242**, any future date, any CVC, any zip
5. After purchase you should land somewhere (test, may need adjustment)
6. Open `https://incomeacademy.biz/members` directly to see the branded dashboard
7. Click "Continue Learning →" on AI Side Income — should redirect into the GHL portal login
8. Log in with the test account → see your branded portal with Income Academy name, gold/navy theme
9. Navigate into AI Side Income → Module 1 → see Linda video

**That's the demo your friends will see.**

---

## Where to put OTHER pics/videos you have

| Asset type | Where to put it | Notes |
|---|---|---|
| **Hero images for AI subdomain** | `marketing/ai/img/hero.jpg` | 1200×800ish, woman at kitchen table with AI |
| **Hero images for Affiliate subdomain** | `marketing/affiliate/img/hero.jpg` | Man at desk affiliate marketing |
| **Hero videos (loop)** | `marketing/ai/video/hero.mp4` and `marketing/affiliate/video/hero.mp4` | Optional — Sora/Runway/Veo loops, ~5-10 sec, no audio |
| **Course thumbnails (NEW custom)** | Replace files in `marketing/brand/course-thumbs/` then run `node server/src/tools/svg-to-png-playwright.js` then re-upload to GHL | Currently using SVG-generated branded thumbs |
| **Module videos (HeyGen Linda)** | `marketing/videos/heygen/<video_id>.mp4` | Once look_id captured, runs automatically. 36 module videos total. |
| **Module videos (your face/voice)** | `marketing/videos/wyatt/module-N-lessonName.mp4` | Drop here, then drag into corresponding GHL lesson |
| **Profile pic (Wyatt's bio)** | `marketing/brand/avatars/wyatt.jpg` | 400×400 square, used in landing copy + emails |
| **Logo variants** | `marketing/brand/logos/` | 5 SVGs already there — replace any if you want different |
| **OG / social share images** | `marketing/brand/og/*.svg` | 1200×630 — shows when site is shared on Facebook/Twitter |
| **Email graphics (header banner)** | `marketing/brand/email/banner.svg` | Used in MailerLite welcome sequence |

After dropping new files, run the smoke test:
```bash
node "/Users/wyattsmac/Documents/Income Academy CRM/server/src/tools/e2e-smoke-test.js"
```

Should stay 14/14. Then commit + push:
```bash
cd "/Users/wyattsmac/Documents/Income Academy CRM"
git add marketing/
git commit -m "Add new brand assets"
git push
```

Vercel auto-redeploys in ~90 seconds.

---

## What's STILL pending (not blocking demo)

- **Stripe live mode** — gated by Utah LLC → EIN → Mercury/Relay bank → iPostal1 mailbox (your action)
- **portal.incomeacademy.biz custom domain** — Namecheap CNAME + GHL config (~10 min, can do later)
- **GHL chat widget** — paste embed snippet into landing pages (replaces `GHL_CHAT_WIDGET_PLACEHOLDER`)
- **eBay apply form / quiz form** — wire GHL form endpoints into the placeholders
- **Welcome email** — customize template in GHL using copy from `docs/email-sequences/foundation-pass-welcome.md`
- **AI Writing Assistant Claude Project** — upload bundle from `tools/claude-project-bundle/` to claude.ai
- **Replace placeholders** in landing copy: `[YOUR_NAME]`, `[YOUR_STORY]`, `[BUSINESS_ADDRESS]`
- **Attorney review** — refund policy, terms, disclaimer, FTC compliance
- **Rotate API keys** — both HeyGen + GHL keys were pasted in chat, should be rotated
- **The other 35 module videos** — need workspace look_id (Step 7) to batch-generate

---

## Demo script (what to say to friends)

> "I built an online business education company for adults 50-75. Four courses bundled together for $47 + $19/month — AI Side Income, Affiliate Marketing, Estate Sale Sourcing, and Bookkeeping. Plus a graduation tier where I do eBay reselling for them.
>
> Watch — I go to the site, click 'Get Access', use a test card, and land in my branded member portal. Each course has 9 modules, video lessons with our presenter Linda, downloadable templates, and an AI Writing Assistant. The whole thing took me a week with Claude Code as my engineer.
>
> Right now it's in soft-launch — Stripe is in sandbox until I file the LLC next week. Want to be on the early list?"

---

## CRM login slowness — diagnosis

I'll dig into this next and send a separate report. Strong hypothesis: **Render free tier auto-spins down the API server after 15 min of no traffic, then takes ~50s to cold-start on the next request**. That's exactly what would cause a slow first login but fast subsequent ones. Fix: $7/mo Render Starter tier removes the spin-down.

Will confirm + report shortly.
