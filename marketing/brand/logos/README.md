# Income Academy — Logo System

Five SVG logo files covering every common use case. SVG scales perfectly from favicon (16×16) to billboard (any size) without quality loss.

## The files

| File | When to use |
|---|---|
| [ia-mark-color.svg](ia-mark-color.svg) | **Primary** mark — gold "IA" on navy badge. Default for most uses on light OR dark backgrounds. Social avatars, app icons, email headers. |
| [ia-horizontal-color.svg](ia-horizontal-color.svg) | Horizontal lockup — mark + "Income Academy" wordmark + tagline. Use when you have horizontal space (website nav, email signatures, business cards, sales deck headers). |
| [ia-mark-reverse.svg](ia-mark-reverse.svg) | Reverse — navy "IA" on gold badge. Accent use: stickers, call-out labels, when you want maximum brand pop. |
| [ia-mark-mono-dark.svg](ia-mark-mono-dark.svg) | Monochrome navy, transparent background. For printing on light-colored merchandise, watermarks, single-color contexts. |
| [ia-mark-mono-light.svg](ia-mark-mono-light.svg) | Monochrome white, transparent background. For embossing/printing on dark-colored merchandise, faint watermarks on dark photos. |

## Typography

All marks use the system-font stack (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `Arial`) at weight 900. This renders nearly identically across Mac, Windows, Linux, iOS, Android, so the logo looks consistent everywhere without shipping a custom font file.

When you want the design 100% frozen (printing, merch, etc.), open the SVG in Figma or Illustrator → "Outline" or "Convert to Paths" → re-export. That bakes the letter shapes as vector paths, independent of fonts installed on the viewer's device.

## Brand colors (locked)

- **Navy**: `#0f172a` (primary dark)
- **Navy-light**: `#1e293b` (gradient end)
- **Gold**: `#f59e0b` (primary accent)
- **Gold-hover**: `#d97706` (interaction state)
- **Cream**: `#f8fafc` (light surface)
- **White**: `#ffffff`

## Common exports you'll need

### Favicon set (browser tabs, iOS home screens)

Export `ia-mark-color.svg` to these sizes as PNG:
- 16×16 (`favicon-16.png`)
- 32×32 (`favicon-32.png`) — main browser tab
- 180×180 (`apple-touch-icon.png`) — iOS home screen
- 192×192 (`icon-192.png`) — Android / PWA
- 512×512 (`icon-512.png`) — PWA high-res

Free converters: [cloudconvert.com/svg-to-png](https://cloudconvert.com/svg-to-png) or [squoosh.app](https://squoosh.app) after using a tool like [svgomg.net](https://jakearchibald.github.io/svgomg/) to open the SVG.

### Social share image / OG image

1200×630 PNG for social previews. Combine `ia-mark-color.svg` on a navy background with a tagline. Canva template works great here — use the horizontal lockup as the base.

### Email header

600×200 PNG with the horizontal lockup centered on a navy background. See `marketing/brand/emails/` folder (to be populated).

### GHL platform uploads

- GHL Business Profile → Logo: upload `ia-horizontal-color.svg` (or converted PNG at 600×200)
- GHL Business Profile → Icon: upload `ia-mark-color.svg` (or converted PNG at 512×512)

## How to view these locally

Open any `.svg` file directly in Chrome/Safari/Firefox to see the rendered logo at any size (zoom in/out with Cmd+/- to confirm scaling). Or drag into Figma/Illustrator to edit.

## Future evolution

This logo system is good for v1-v3 of the brand. Things you might add later as the brand matures:

- **Proper custom wordmark**: hire a designer to draw "Income Academy" as a bespoke letterform instead of system font
- **Icon variants per course**: small iconographic marks for AI/Affiliate/Estate/Bookkeeping in the gold/navy palette
- **Graduation tier mark**: a separate, slightly more elevated mark for the eBay Done-With-You tier
- **Merch treatments**: embroidery-safe versions, one-color print versions, holographic treatments for premium swag

Don't do any of those until you have real revenue and a reason. This system is professional enough for launch.
