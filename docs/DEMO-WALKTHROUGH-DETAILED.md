# Foundation Pass — Detailed Demo Walkthrough

**Read this top-to-bottom while doing it. Each step takes 30-60 sec.**

If anything looks different than described, screenshot it and tell me — don't guess.

---

# PART 1 — Open the right pages

Before starting, you'll need 3 windows open. Set them up first so you don't lose your spot.

## A. Open the GHL Branding page

1. Click on Chrome (the browser icon)
2. Open a new tab (Cmd+T)
3. Paste this URL into the address bar and hit Enter:
   ```
   https://app.gohighlevel.com/v2/location/c3HSS74ILjGye3pvGsHg/memberships/client-portal/branding
   ```
4. **What you should see**: a page titled "Branding" with a section called "Details" — fields for Portal Name, Description, Brand Color One, Brand Color Two, etc. Portal Name should already say "Income Academy".

## B. Open Finder to the assets folder

1. Click anywhere on your desktop
2. Press Cmd+Shift+G (or in Finder menu: Go → Go to Folder)
3. Paste this path and hit Enter:
   ```
   /Users/wyattsmac/Documents/Income Academy CRM/marketing/brand
   ```
4. **What you should see**: a Finder window with folders like `course-thumbs`, `email`, `hero`, `logos`, `og`, `png-exports`.

## C. Open Finder to the videos folder (separate window)

1. In Finder, **File → New Finder Window** (or Cmd+N)
2. Cmd+Shift+G
3. Paste:
   ```
   /Users/wyattsmac/Documents/Income Academy CRM/marketing/videos/heygen
   ```
4. **What you should see**: one file — `be490f1bcc8e4f9cbd0f17d16dd2f561.mp4` (the Linda video).

You now have:
- Chrome with GHL Branding page
- Finder window 1 → brand folder
- Finder window 2 → videos folder

---

# PART 2 — GHL Branding (the colors + logo)

You're on the GHL Branding page in Chrome.

## Step 1 — Set Brand Color One to GOLD (#f59e0b)

This is the primary CTA button color customers see.

1. **Scroll down** on the Branding page until you can see "Brand Color One" on the left and a small **blue square** on the right
2. **Click the blue square once** — a color picker popup opens
3. In the popup, you'll see:
   - A big rainbow-gradient square at the top
   - A horizontal rainbow strip below it
   - A field labeled "HEXA" with a value like `#004EEBFF`
   - 5 colored swatches at the very bottom (blue, black, green, red, gray)
4. **Click directly inside the HEXA value field** (the part that says `#004EEBFF`)
5. Press **Cmd+A** to select all the text in the field
6. Press **Delete** (or Backspace)
7. Type exactly: `f59e0b`
8. Press **Tab** (NOT Enter — Enter sometimes closes the picker without saving)
9. **What you should see**: the small color square next to "Brand Color One" should now be GOLD/AMBER (a warm orange-yellow), and the popup should still show the HEXA field with your gold value
10. **Click anywhere on the page outside the popup** to close it

**If the square is still blue**: the picker rejected your typed value. Try this instead:
- Click the swatch again to reopen the picker
- In the rainbow strip (the horizontal one), click somewhere on the gold/orange section
- Then in the big gradient square, click roughly in the middle-bottom area
- The HEXA field will update to a value close to `#f59e0b` — close enough is fine
- Click outside to close

## Step 2 — Set Brand Color Two to NAVY (#0f172a)

Same process, the swatch right below.

1. Click the second blue square (Brand Color Two)
2. Click into the HEXA field
3. Cmd+A → Delete → type: `0f172a`
4. Press Tab
5. The square should now be **dark navy blue** (almost black with a blue tint)
6. Click outside the popup

**If stuck**: in the rainbow strip click the dark blue/black area, then in the gradient square click the bottom-left corner.

## Step 3 — Upload your Logo

1. Switch to your Finder window showing the `brand` folder
2. **Double-click** the `logos` folder to open it
3. You'll see SVG files like `logo-mark-color.svg`, `logo-horizontal-color.svg`, etc.
4. Switch back to Chrome
5. On the Branding page, scroll down until you see **"Logo"** with a drop zone that says "Click or drag a file to this area to upload, SVG, PNG, JPG (max 200×200 px)"
6. Switch back to Finder, **click and HOLD** on `logo-mark-color.svg`, **drag** it to Chrome (Chrome will become the active window) and drop it on the Logo drop zone
7. **What you should see**: the drop zone now shows a tiny preview of your logo (the colored "IA" mark)

**If GHL rejects the SVG** ("File type not supported" or similar):
1. Open Terminal (Cmd+Space, type "Terminal", Enter)
2. Paste this command and hit Enter:
   ```bash
   node "/Users/wyattsmac/Documents/Income Academy CRM/server/src/tools/svg-to-png-playwright.js"
   ```
3. Wait ~10 seconds. It'll print "Done."
4. In Finder, navigate to `marketing/brand/png-exports/` (one level up from where you were, then into png-exports)
5. Drag the PNG version onto the Logo drop zone

## Step 4 — Upload Favicon (browser tab icon)

Same logo, smaller drop zone.

1. Just below the Logo drop zone, find **"Favicon"** (also says max 16×16 px — that's fine, GHL will auto-resize)
2. Drag the same `logo-mark-color.svg` from Finder onto the Favicon drop zone

## Step 5 — Save it all

1. Scroll all the way to the bottom of the Branding page
2. **Click the blue "Save Settings" button** in the bottom right
3. **What you should see**: a small notification in the top right that says "Brand Setting Updated!" or similar

---

# PART 3 — Linda Video into Module 1

## Step 6 — Navigate to AI Side Income → Module 1

1. In Chrome, paste this URL and hit Enter:
   ```
   https://app.gohighlevel.com/v2/location/c3HSS74ILjGye3pvGsHg/memberships/courses/course-creator-studio?view=manager&sub_view=outline&product_id=d4c2b0c2-dee8-4ccf-8d5b-cd37e1eef075
   ```
2. **What you should see**: AI Side Income Starter Kit page with a list of 9 modules — Module 0 (Welcome + Setup), Module 1 (Your AI Assistants, Explained), Module 2, etc. Each module is collapsed.

## Step 7 — Open the Module 1 lesson

1. Find **"Module 1 — Your AI Assistants, Explained"** in the list
2. Click the small arrow on its right (or click the module title) to expand it
3. You'll see one lesson under it: also called **"Your AI Assistants, Explained"**
4. Click on the lesson name (NOT on the "Draft" dropdown beside it — click the lesson title text)
5. **What you should see**: a lesson editor with sections for video, content/description, etc.

## Step 8 — Drop the video

1. Switch to your second Finder window (the `marketing/videos/heygen` folder)
2. Find the video file: `be490f1bcc8e4f9cbd0f17d16dd2f561.mp4`
3. In Chrome, find the **video upload area** in the lesson editor (it'll say something like "Drop video here" or have a cloud-upload icon)
4. Drag the MP4 from Finder onto that area
5. **What you should see**: an upload progress bar. The video is 7.6 MB so upload takes ~30 seconds depending on your internet
6. After upload, the editor will show a video player preview

## Step 9 — Save and Publish

1. Look for a **Save** button (usually top-right of the lesson editor)
2. Click Save
3. Look for a **Status** dropdown that says "Draft"
4. Click it and change to **"Published"**
5. Click Save again if needed

---

# PART 4 — Test the demo (THE FUN PART)

## Step 10 — Open incognito window (so you're a fresh visitor)

1. In Chrome, **File → New Incognito Window** (or Cmd+Shift+N)
2. **What you should see**: a dark-themed Chrome window with "You've gone Incognito" message

## Step 11 — Visit your site

1. In the address bar, paste: `https://incomeacademy.biz`
2. Hit Enter
3. **What you should see**: the Foundation Pass landing page with your hero image, pricing block, 4 course tiles in the Members Area section

## Step 12 — Click through to checkout

1. Click any "Get Access" button or the blue checkout button in the pricing area
2. You should land on a checkout page showing the Foundation Pass at $47 + $19/mo

## Step 13 — Pay with the Stripe test card (sandbox mode)

These card details are FAKE and only work in test mode — they don't charge anything:

- **Card number**: `4242 4242 4242 4242`
- **Expiry**: any future date, e.g. `12 / 30`
- **CVC**: any 3 digits, e.g. `123`
- **Name on card**: anything, e.g. `Test User`
- **ZIP**: any 5 digits, e.g. `84770`

Submit. **What you should see**: a success/thank-you page.

## Step 14 — Visit the members dashboard

1. Paste in the address bar: `https://incomeacademy.biz/members`
2. **What you should see**: branded dashboard with 4 course tiles (AI Side Income, Affiliate, Estate Sale, Bookkeeping) plus a locked eBay tile

## Step 15 — Click into a course

1. On the AI Side Income tile, click "Continue Learning →"
2. **What you should see**: redirect to `c3hss74iljgye3pvgshg.app.clientclub.net/login`
3. Log in with your test account (or sign up — depending on whether GHL auto-created an account from the test purchase)
4. After login: you should see your branded portal (gold/navy if Steps 1-2 worked) with the course
5. Click into Module 1 → see Linda's video

**If you see Linda's video at the end of this — the demo works.** Show your friends.

---

# PART 5 — Fix the slow CRM login

## Step 16 — Sign up for UptimeRobot (free, 2 min, permanent fix)

1. Go to: `https://uptimerobot.com/signUp`
2. Enter your email + password (use Wyatt@incomeacademy.biz so it lives at the right place)
3. Verify the email they send you
4. After login, click **"+ Add New Monitor"**
5. Settings:
   - **Monitor Type**: HTTP(S)
   - **Friendly Name**: Income Academy API
   - **URL (or IP)**: `https://income-academy-crm.onrender.com/api/health`
   - **Monitoring Interval**: 5 minutes
6. Click **Create Monitor**
7. **Done.** From now on, your CRM login will always be fast — the monitor pings Render every 5 minutes which keeps the server warm.

---

# PART 6 — Where to put NEW pics or videos (when you have them)

When you have new images or videos to add, drop them in these exact paths:

## New AI subdomain hero image
**Path**: `/Users/wyattsmac/Documents/Income Academy CRM/marketing/ai/img/hero.jpg`
- Replace the existing `hero.jpg`
- Recommended: 1200×800 pixels, woman at kitchen table with laptop/AI vibe

## New Affiliate subdomain hero image
**Path**: `/Users/wyattsmac/Documents/Income Academy CRM/marketing/affiliate/img/hero.jpg`
- Replace the existing `hero.jpg`

## New hero videos (looping background)
**Paths**:
- `/Users/wyattsmac/Documents/Income Academy CRM/marketing/ai/video/hero.mp4`
- `/Users/wyattsmac/Documents/Income Academy CRM/marketing/affiliate/video/hero.mp4`
- 5-10 sec loops, no audio, MP4, 1080p

## Your bio photo (for landing pages + emails)
**Path**: `/Users/wyattsmac/Documents/Income Academy CRM/marketing/brand/avatars/wyatt.jpg`
- Make this folder if it doesn't exist (right-click in Finder → New Folder)
- 400×400 square JPG

## More HeyGen Linda videos (after capturing the look_id)
**Path**: `/Users/wyattsmac/Documents/Income Academy CRM/marketing/videos/heygen/<video-id>.mp4`
- Auto-generated by my script once you give me the look_id
- Each maps to one of the 36 modules (4 courses × 9 modules)

## Videos of YOU (your face/voice)
**Path**: `/Users/wyattsmac/Documents/Income Academy CRM/marketing/videos/wyatt/module-X-lesson-name.mp4`
- Make this folder if it doesn't exist
- Drag from this folder into corresponding GHL lesson

## How to push new files to the live site

After dropping files, paste this into Terminal:
```bash
cd "/Users/wyattsmac/Documents/Income Academy CRM" && git add marketing/ && git commit -m "Add new assets" && git push
```

Vercel auto-rebuilds in ~90 seconds. Then refresh the site.

If you don't want to use Terminal, just tell me "I dropped new pics in marketing/ai/img/" and I'll commit + push for you.

---

# IF SOMETHING DOESN'T WORK

Screenshot what you see and tell me. Don't try to fix it yourself if it doesn't match what's described above — odds are GHL changed its UI or something else, and I can adapt.

Specifically tell me:
- What step number you're on
- What the screen looks like (screenshot)
- What you expected vs what happened

I'll get you unstuck.

---

# WHAT TO SAY TO YOUR FRIENDS WHEN YOU SHOW THEM

> "I built an online business education company for adults 50-75. Four courses bundled — AI Side Income, Affiliate Marketing, Estate Sale Sourcing, and Bookkeeping — for $47 plus $19/month with a 7-day free trial. There's also a high-touch eBay reselling program by application.
>
> Watch — I go to incomeacademy.biz, click 'Get Access', enter a test card. Boom — branded member portal. Each course has 9 modules, video lessons with our presenter Linda, downloadable templates, and an AI Writing Assistant.
>
> The whole thing took about a week of building with Claude as my engineer. We're soft-launching once I file the LLC. Want to be on the early list?"
