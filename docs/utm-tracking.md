# UTM Tracking Convention — Income Academy

Standard naming convention for UTM parameters across all paid ads, organic content, partnership links, and referrals. Consistency = clean attribution data.

---

## The 5 UTM parameters

Every link you put in front of a potential buyer should include these:

| Parameter | What it answers | Example |
|---|---|---|
| `utm_source` | Where the click came from (platform) | `facebook`, `google`, `linkedin`, `youtube`, `email`, `partner-johnsmith` |
| `utm_medium` | The category of traffic | `paid-social`, `paid-search`, `organic`, `email`, `referral` |
| `utm_campaign` | Which campaign the link belongs to | `foundation-pass-launch-q2-2026`, `affiliate-ebook-promo` |
| `utm_content` | Which specific creative or variant | `headline-skeptic-v1`, `image-couple-coffee`, `ad-pack-a-variant-3` |
| `utm_term` | Keyword (paid search only) | `ai+side+income+for+seniors`, `bookkeeping+course+over+50` |

---

## Naming rules

- All lowercase
- Hyphens between words (`paid-social` not `paid_social` or `paidSocial`)
- No spaces
- No special characters except hyphens
- Keep it human-readable (you'll read these in reports for the next 5 years)
- Keep `utm_source` to known platforms; don't invent new ones for one-off uses

---

## Standard `utm_source` values

| Source | Use for |
|---|---|
| `facebook` | All Meta/Facebook ads + organic posts |
| `instagram` | Instagram-specific ads + organic |
| `google` | Google Ads + Google search organic |
| `youtube` | YouTube ads + video descriptions |
| `linkedin` | LinkedIn ads + organic posts |
| `tiktok` | TikTok ads + organic |
| `pinterest` | Pinterest organic + ads |
| `reddit` | Reddit organic + sponsored posts |
| `email` | All MailerLite/GHL email campaigns |
| `partner-{name}` | Specific affiliate/partner — use partner's first name lowercase |
| `direct` | Default for organic/uncategorized |

---

## Standard `utm_medium` values

| Medium | Use for |
|---|---|
| `paid-social` | Any paid social ad (Facebook, Instagram, LinkedIn, etc.) |
| `paid-search` | Google Ads, Bing Ads |
| `paid-display` | Google Display Network, programmatic |
| `paid-video` | YouTube ads |
| `organic-social` | Unpaid posts on any platform |
| `organic-search` | SEO traffic |
| `email` | Email campaigns |
| `referral` | Other-website backlinks (not under your control) |
| `partner` | Affiliate or referral partner traffic |
| `qr-code` | Physical QR codes (events, business cards) |

---

## Standard `utm_campaign` naming

Format: `{product}-{type}-{quarter-year}`

Examples:
- `foundation-pass-launch-q2-2026`
- `foundation-pass-retargeting-q2-2026`
- `ai-course-meta-pixel-q3-2026`
- `affiliate-course-substack-cross-promo-q3-2026`
- `ebay-dwy-direct-mail-q4-2026`

Don't get cute. Future-you will thank you for boring names.

---

## Quick reference — example URLs

### Foundation Pass — Facebook ad, ad pack A variant 1
```
https://incomeacademy.biz/?utm_source=facebook&utm_medium=paid-social&utm_campaign=foundation-pass-launch-q2-2026&utm_content=ad-pack-a-variant-1
```

### AI subdomain — Google search ad, "ai side income" keyword
```
https://ai.incomeacademy.biz/?utm_source=google&utm_medium=paid-search&utm_campaign=ai-course-launch-q2-2026&utm_content=headline-anti-scam-v1&utm_term=ai+side+income+for+seniors
```

### Email campaign — Day 1 welcome email link to Members Area
```
https://incomeacademy.biz/members?utm_source=email&utm_medium=email&utm_campaign=foundation-pass-welcome-sequence&utm_content=email-1-day-0
```

### Partner referral
```
https://incomeacademy.biz/?utm_source=partner-johnsmith&utm_medium=partner&utm_campaign=foundation-pass-launch-q2-2026&utm_content=newsletter-feature-2026-04
```

### Reddit organic post (non-paid)
```
https://incomeacademy.biz/?utm_source=reddit&utm_medium=organic-social&utm_campaign=foundation-pass-launch-q2-2026&utm_content=r-sidehustle-honest-recommendation
```

---

## URL builder shortcut

Bookmark Google's free Campaign URL Builder:
**https://ga-dev-tools.google/campaign-url-builder/**

Or paste the URL with parameters into your browser to test — view the rendered link and confirm it goes to the right page.

---

## Where the data lives

Once UTMs are flowing, you'll see them in:

- **Google Analytics 4** — Acquisition reports → Traffic acquisition → Default channel grouping → drill into specific sources
- **GHL** — UTMs are stored on the Contact record (when paired with Stripe webhook + GHL contact creation)
- **Stripe** — UTMs can be passed as metadata via the Payment Link query string (configure in Payment Link settings)

To preserve UTMs through the full purchase flow:

1. Visitor lands on `incomeacademy.biz/?utm_*=...`
2. Click checkout → Stripe Payment Link with UTMs preserved as URL params
3. Stripe webhook fires → GHL receives the contact + the UTM data via metadata
4. GHL contact has full attribution chain attached

This requires a small bit of JavaScript to capture UTMs into a hidden form field or session storage on each landing page. See `marketing/index.html` head for the placeholder pattern (to be implemented when analytics are wired).

---

## Rules of thumb

- **Always use UTMs** on paid traffic. Always.
- **Don't UTM-tag your own internal links** within the site (causes weird self-referral behavior in analytics).
- **Don't UTM-tag email links to your own assets** if the email is part of an automation triggered by purchase (the user is already converted; don't bias attribution).
- **Test new UTM patterns** with a $5 ad spend before scaling — make sure they show up correctly in analytics.
- **Audit quarterly** — clean up dead campaigns, retire `utm_content` variants that didn't perform.

---

## Common mistakes to avoid

- Using uppercase: `Facebook` and `facebook` are treated as different sources
- Using spaces: `foundation pass launch` becomes `foundation%20pass%20launch` and breaks
- Inconsistent campaign names across team members (your VA tagged it `q2-launch`, you tagged it `launch-q2-2026`, now they're different campaigns)
- Forgetting UTMs on partner links (most common attribution leak)
- Putting customer PII in `utm_content` — these get logged to analytics, treat as public

---

## Future improvement: shortlink + click-tracker

When ad spend justifies it (~$2k/mo+), add a shortlink service like:
- Rebrandly (custom domain, analytics)
- Bit.ly Pro
- Or self-hosted shlink

Lets you swap the destination URL without re-running ads, A/B test landing pages, and get cleaner click data than UTM-only.
