# Brand Assets — Income Academy

Single source of truth for Income Academy visual identity. Anything referenced by `marketing/`, email templates, or GHL portal should live here (or be copied here alongside the product-specific location).

## Color palette (locked)

Matches `marketing/styles.css` CSS variables.

| Name | Hex | Usage |
|---|---|---|
| Navy | `#0f172a` | Primary bg, nav, headlines |
| Navy-light | `#1e293b` | Gradient end, surface |
| Gold | `#f59e0b` | Primary accent, CTAs |
| Gold-hover | `#d97706` | Hover state |
| Cream | `#f8fafc` | Alt section bg |
| White | `#ffffff` | Cards, text surfaces |
| Gray | `#64748b` | Body secondary |
| Gray-light | `#94a3b8` | Muted text |
| Success | `#10b981` | Positive states |

## Typography

System font stack (no custom font files needed):
`-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

Headlines: 800 weight. Body: 400. Eyebrows: 700 uppercase + letter-spacing 0.5-1.5px.

## Folder structure

```
marketing/brand/
├── README.md                   (this file)
├── logos/                      (IA mark variants — all missing until created)
├── og-images/                  (social share 1200×630 — all missing)
├── hero/                       (product hero stills + video masters)
└── emails/                     (email header banners + footer graphics)
```

## Files currently missing (drop them in as you generate / source them)

### Logos (`logos/`)
Currently the "IA" mark is CSS-rendered in `marketing/styles.css` (`.logo-mark` class). That's fine for v1 but these files enable proper email/social use:

- [ ] `ia-mark-color.svg` — gold on navy, 512×512
- [ ] `ia-mark-mono-dark.svg` — navy-only for light backgrounds
- [ ] `ia-mark-mono-light.svg` — white-only for dark backgrounds
- [ ] `ia-horizontal-color.svg` — "IA" mark + "Income Academy" wordmark, horizontal lockup
- [ ] `favicon-32.png` — 32×32 browser tab
- [ ] `favicon-192.png` — 192×192 PWA
- [ ] `apple-touch-icon-180.png` — 180×180 iOS home screen

### Social share images (`og-images/`)
Each is 1200×630 JPG, under 300KB, referenced via `<meta property="og:image">`:

- [ ] `main-og.jpg` — for `incomeacademy.biz` share preview
- [ ] `ai-og.jpg` — for `ai.incomeacademy.biz`
- [ ] `affiliate-og.jpg` — for `affiliate.incomeacademy.biz`

### Product hero (`hero/`)
Master files. Copies also live at `marketing/ai/img/`, `marketing/ai/video/`, and affiliate equivalents.

- [ ] `ai-hero.jpg` — 1600×900, already referenced by `/marketing/ai/index.html`
- [ ] `ai-hero.mp4` — 1920×1080 H.264, 30-90 sec, referenced by ai page founder section
- [ ] `affiliate-hero.jpg` — 1600×900
- [ ] `affiliate-hero.mp4` — 1920×1080 H.264

### Email assets (`emails/`)
For MailerLite welcome sequence + GHL auto-emails + Stripe receipts:

- [ ] `email-banner-600.png` — 600×200, header banner with IA logo on navy
- [ ] `email-footer-200.png` — 200×80, small logo for footer
- [ ] `welcome-hero.jpg` — 600×300, warm welcome image for "Thanks for buying" email

## Generation prompts

See `docs/asset-generation-prompts.md` for ChatGPT/DALL-E/Sora/Runway prompts for the hero images and videos, per-brand guidance, and output specs.

## Workflow for replacing AI-generated placeholders with real photography

1. Record/commission real photo or video
2. Export to the same dimensions as the placeholder (see specs in asset-generation-prompts.md)
3. Drop into `marketing/brand/hero/` with the same filename
4. Copy into per-product location: `marketing/ai/img/hero.jpg` (or `video/hero.mp4`)
5. Commit — no HTML changes needed, filenames are stable
