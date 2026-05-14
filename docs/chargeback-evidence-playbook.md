# Chargeback Evidence Playbook (Multi-Processor)

Kick Start runs card transactions through five rotating gateways:
**Tailored Pay, NMA Gateway, Payarc, PAS Cosmos, Nuvei**.
A dispute can land in any one of their portals. This playbook keeps the
response identical no matter where it shows up.

## When a dispute notification arrives

1. **Note the deadline.** Most of these processors give 7–14 days. Reply
   well before the deadline — most chargebacks are lost to missed windows,
   not bad evidence.
2. **Open `/admin` → Evidence tab.**
3. **Look up the customer** by email or our internal user ID. (If your
   notification includes the customer email, that's the fastest path.)
4. Choose the right output format for the portal you're in:

| Portal accepts | Use |
|---|---|
| PDF upload | **Save as PDF** button. Print-styled, one-click. |
| Image upload only | Save the PDF, then export a single page as JPG/PNG via Preview |
| Web text field only | **Copy as Plain Text** button. Paste directly. |
| API / programmatic | **Export JSON** button. Full structured data. |

## What the report contains

Every output format includes the same five evidence blocks, ordered by
importance for dispute defense:

1. **Customer identity** — name, email, internal user ID, any payment
   processor reference IDs we have on file
2. **Delivery timestamps** — registration, first login, first product
   access. **The single most important data for a "product not received"
   dispute.**
3. **Activity summary** — total logins, items completed, vendors applied
   and reporting, funding events logged, latest fundability score
4. **Full chronological activity log** — every event recorded server-side,
   with timestamp and **IP address** per event. The data is not
   user-modifiable.
5. **Vendor + funding details** — concrete proof of value delivered
   (which vendor accounts the customer applied for and which are
   reporting, what funding they logged)

The plain-text output is capped at ~10,000 characters with the 200 most
recent activity events; older events truncate gracefully. Most processor
text fields accept this size without splitting.

## What to attach alongside the report

The Evidence report covers **proof of access and use**. You should
attach two additional documents to every dispute response:

1. **Signed service agreement** — your existing document. Includes
   customer signature, timestamp, IP. Stored in your contract-signing
   platform (DocuSign, HelloSign, Kick Start's internal flow).
2. **Refund policy** — a screenshot of the checkout page showing the
   policy was disclosed before purchase, ideally with a timestamp.

## What loses these disputes (avoid)

- **Missing the response window.** Universal across processors. Set a
  3-day-out reminder when the dispute notification arrives.
- **Generic boilerplate response.** Issuers can spot copy-paste rebuttals
  and weight them less. The Evidence report includes specifics —
  use them in your cover note.
- **Editing pre-populated 3D Secure / authentication data** if your
  processor's portal shows it. Leave it alone; it's already there.
- **Anti-chargeback / non-disparagement clauses in the service agreement.**
  The FTC has called these out as Credit Repair Organizations Act (CROA)
  violations. Strip them.
- **Promising specific credit-score outcomes.** Position the product as
  education and tooling, never as a guaranteed score increase. CROA
  applies even if you don't self-identify as a "credit repair organization."

## Reason codes — universal across processors

The card networks (Visa, Mastercard, Amex, Discover) define reason codes
that every processor uses. The most common for a $300 digital credit
product:

| Code | Customer claim | Winning evidence |
|---|---|---|
| **10.4** (Visa) / **4837** (MC) — Fraud | "I didn't authorize this" | 3DS authentication record + IP history + access logs + signed agreement |
| **13.1** (Visa) / **4853** (MC) — Goods/services not received | "I paid and got nothing" | Login + first-access timestamps. **This is what the Evidence report wins definitively.** |
| **13.3** (Visa) / **4853** — Not as described | "It didn't work" | Service agreement with no-guarantee language + Evidence report showing substantive use |
| **13.5** (Visa) / **4853** — Misrepresentation | "I was promised X" | Marketing copy archive + receipt of expectations set + Evidence report |

## Visa Compelling Evidence 3.0 (applies to 10.4 fraud disputes)

CE 3.0 is a Visa rule, not a processor feature — it works through all five
processors. To trigger the liability shift back to the issuer you need:
- Two prior undisputed transactions on the same card, 120–365 days old
- 2 of 4 matching data elements across all three transactions (User ID,
  shipping, IP, Device ID) — at least one must be IP or Device ID

For a one-time $300 Kick Start customer this usually doesn't qualify
(no prior transaction history). If you want CE 3.0 protection, the
play is to add a small recurring add-on ($9-19/mo) that creates the
transaction history over time. Not in scope right now.

## Realistic win rates with this evidence package

| Type | Without Evidence report | With Evidence report |
|---|---|---|
| Product not received (13.1) | ~10% | **70–90%** |
| Not as described (13.3) | ~10% | 30–45% |
| Fraud (10.4) without 3DS | <15% | 15–25% |
| Fraud (10.4) with 3DS liability shift | n/a | 70–85% |
| **Blended** | 15–25% | **40–55%** |

The Evidence report's load-bearing function is winning 13.1 ("not
received") disputes outright, and meaningfully improving 13.3 ("not as
described") rebuttals.

## Multi-processor quick reference

Researched against vendor docs and merchant docs as of 2026-05.

| Processor | Response window | Submission | File format | Size cap | API/webhook |
|---|---|---|---|---|---|
| **Tailored Pay** | Card-network standard (7–10 biz days for representment) | The **underlying** Authorize.Net or NMI portal (Tailored Pay is a MID broker) + email | PDF / JPG / PNG typical | Portal-dependent | Real-time notifications confirmed; no public API |
| **NMA Gateway** | Per-case in portal | `portal.nationalmerchants.com` + Fraud Wrangler auto-representment | Auto-assembled by Fraud Wrangler | n/a (AI driven) | Yes — automated alerting + electronic response built in |
| **Payarc** | Per-case in portal; retrieval 10–20 days | Payarc Merchant Dashboard | PDF + images | not published | **Yes — public REST API** with `GET /disputes` + open-source SDK |
| **PAS Cosmos** (Paycosmos / Transmodus) | Not published | Merchant portal + concierge | Not published | Not published | API exists for ISO partners; chargeback webhook undocumented |
| **Nuvei** | **30 days** pre-arb, 20 days inquiry, 48 hrs collaboration | Control Panel → Case Management + Chargebacks API | **PDF only** (Case Mgmt) / PDF/DOC/DOCX/TXT (Chargebacks Report) | **10 MB × 4 files** (Case Mgmt) / **4 MB × 10 files** (Chargebacks Report). Filename ≤ 45 chars, no spaces or special chars | Yes — full Chargebacks API + webhooks |

### Lowest common denominator (what the Evidence tool targets)

Anchored to Nuvei (the strictest published spec), this packet uploads
cleanly to **all 5 portals** without rework:

- **Format:** Single PDF, flattened. No DOCX, no loose JPGs.
- **Size:** ≤ 4 MB.
- **Pages:** ≤ 19 (keeps it portable to Stripe too, if you ever add it).
- **Filename:** ≤ 45 chars, alphanumeric + underscore + hyphen, no
  spaces or special characters except the `.pdf` extension. The
  Evidence tab auto-suggests `KSC_CB_<userId>_<YYYYMMDD>.pdf`.
- **Plain-text fallback:** ≤ 1,500 chars (Copy Summary button) for any
  portal that has a free-text field instead of file upload.
- **Reason codes:** Visa/MC standard numeric — all 5 processors honor
  the same taxonomy.

### Quirks worth knowing

**Tailored Pay** isn't an acquirer — it's a high-risk MID broker that
fronts Authorize.Net or NMI. The portal you actually log into depends
on the MID. Tailored Pay charges $40 per chargeback notification.

**NMA's Fraud Wrangler** auto-pulls records and submits electronic
responses on your behalf. Means you may not need to manually upload
on NMA cases, but clean upstream evidence still helps the AI.

**Payarc** is the most developer-friendly. Public REST API with
`/disputes` endpoints — if you ever want auto-pulled dispute
notifications wired into the Admin dashboard, Payarc is the easiest
to integrate against first.

**PAS Cosmos / Paycosmos** is the most opaque. Contact their support
directly to confirm file formats, size limits, and response windows
the first time a dispute lands there.

**Nuvei** has the most precise rules. The filename constraint (no
spaces, no `@`, `.`, or `/` except for the extension dot) bites people
who use the default `Untitled.pdf` from browsers — always rename
before upload.

## Future enhancements worth building

1. **Auto-pull dispute notifications via Payarc's API** — would feed
   into the Admin dashboard's notification system and put a "Build
   Evidence" button right next to each dispute.
2. **Bundle export** — wrap PDF + plain text + JSON into a single ZIP
   per dispute response for archival.
3. **Cover-page generator** — auto-prepend a 1-paragraph rebuttal
   narrative as page 1 of the PDF, customizable per reason code.
4. **Per-processor profile** — Admin setting that adjusts the
   suggested filename and text-field length based on which processor
   handled the original charge.
