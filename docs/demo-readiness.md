# Demo readiness — Foundation Pass

What's wired, what's automated, what's blocking the first walkthrough.

## One-command runner

```bash
GHL_API_KEY=pit-xxx \
HEYGEN_API_KEY=hg-xxx \
HEYGEN_VIDEO_ID=be490f1bcc8e4f9cbd0f17d16dd2f561 \
  node server/src/tools/wire-demo.js
```

The runner skips any step whose required env var is missing — partial runs are fine. It does:

1. SVG → PNG (course thumbnails, 1280×720)
2. Fetch GHL course URLs + portal base → write `marketing/members/ghl-config.js`
3. Upload thumbnails to GHL (API; UI fallback if API rejects)
4. Poll + download HeyGen Video 1 (only if `HEYGEN_VIDEO_ID` set)
5. E2E smoke test (14 checks)

## Members dashboard wiring

`/members` reads URLs from [ghl-config.js](../marketing/members/ghl-config.js) at runtime. Until populated, all CTAs show a graceful "lessons portal is being set up" alert instead of broken links.

To populate by hand instead of by API:

1. Open each course in GHL → Memberships → click **Share** / **View as Member**
2. Paste the URL into the matching slot in `marketing/members/ghl-config.js`
3. Commit + push — Vercel rebuilds in ~90s

## What I need from you to finish the demo

| # | Item | Why | Where to paste |
|---|---|---|---|
| 1 | New HeyGen API key | old one was leaked in chat — regenerate at app.heygen.com | tell me in chat, I'll set in `.env` |
| 2 | GHL API key with `courses:read` + `products:read` | so `fetch-ghl-config.js` can resolve URLs without UI | tell me in chat |

Once both are in, I run `wire-demo.js` and the demo flow goes live end-to-end.

## Demo flow (what your friends will see)

1. Visit `incomeacademy.biz` → Foundation Pass landing page (Linda hero)
2. Click "Get Access" → checkout page
3. Buy with Stripe test card `4242 4242 4242 4242`
4. Land at `/members` → 4 branded course tiles
5. Click any course → into GHL portal → Module 0 with Linda's video
6. Inside lesson: AI Writing Assistant link in Resources

## Files added this session

- [marketing/members/ghl-config.js](../marketing/members/ghl-config.js) — single config block
- [server/src/tools/fetch-ghl-config.js](../server/src/tools/fetch-ghl-config.js) — auto-populates ghl-config.js
- [server/src/tools/svg-to-png-playwright.js](../server/src/tools/svg-to-png-playwright.js) — Playwright-based PNG converter
- [server/src/tools/upload-ghl-thumbnails.js](../server/src/tools/upload-ghl-thumbnails.js) — API upload + UI fallback guide
- [server/src/tools/heygen-fetch-video.js](../server/src/tools/heygen-fetch-video.js) — poll + download by video ID
- [server/src/tools/wire-demo.js](../server/src/tools/wire-demo.js) — one-shot orchestrator

E2E smoke test now has 14 checks (added `ghl-config.js` reachability + dashboard config script load).
