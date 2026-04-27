# Reseller Pricing Calculator

Build this in a Google Sheet. Each sold item gets a row. Update monthly to see your real margins.

---

## Column structure (spreadsheet)

| Col | Field | Formula / Notes |
|---|---|---|
| A | Date purchased | — |
| B | Source (sale name) | — |
| C | Item description | — |
| D | Purchase price | $$ spent |
| E | Sales tax at source | Usually 0 (estate sales often exempt), but track in states where applicable |
| F | Cost basis (D + E) | `=D+E` |
| G | Listing date | When you listed it on eBay |
| H | Days in inventory | `=IF(listing date filled, DATE()-G, "pending")` |
| I | Listed price | Your "Buy It Now" price |
| J | Sold price | What it actually sold for (could be lower via Best Offer) |
| K | Ship cost (what I paid) | Label cost on USPS etc. |
| L | Ship cost (what buyer paid) | Usually $0 if I offered free shipping |
| M | Ship profit/loss | `=L-K` (negative when I eat shipping) |
| N | eBay fee | Typically 13.25% of (J + L) for eBay Standard |
| O | PayPal/Payment fee | ~2.9% + $0.30 if external — eBay Managed Payments bakes this into N |
| P | Net revenue | `=J+L-K-N-O` |
| Q | Net profit | `=P-F` |
| R | Profit % | `=Q/F` (as percentage) |

---

## Target thresholds

A healthy reseller looks like:

- **Average Q (net profit per item)**: $25-$75 for entry-level, $75-$200 for experienced
- **Average R (profit %)**: 80-150% (i.e., you nearly double your money after fees)
- **Median H (days to sell)**: under 45 for vintage categories; under 90 for slow-moving
- **Sell-through rate** (% of inventory sold within 90 days): 60%+

If any of these are underperforming, that's your leak.

---

## Per-item quick calc (at the estate sale)

Use this WHEN you're holding an item and not sure what to pay.

Goal: **Pay no more than 40% of expected sold price, to net ~30% profit**

```
Expected sold price:        $____  (from eBay sold listings check)
× 0.40 (40% rule)           $____  ← THIS IS YOUR MAX PAY PRICE

So if expected to sell for: $50 → pay no more than $20
                            $100 → pay no more than $40
                            $200 → pay no more than $80
```

If the asking price is HIGHER than your 40% max, either:
- Negotiate down to your 40% point
- Walk away
- Wait for half-price day if applicable

---

## Worked example

**Vintage Pyrex Snowflake Blue casserole**
- Sold listings median: $75 (3-month average)
- Your 40% rule: max $30
- Estate sale asking: $18
- Estate sale result: paid $15 (bundled with another item)

Cost basis: $15
Listed at: $79
Sold at: $72 (via Best Offer accepted)
Ship cost (you paid, buyer paid free shipping): $9 out
eBay fee (13.25% of $72): ~$9.54

Net revenue: $72 - $9 - $9.54 = **$53.46**
Net profit: $53.46 - $15 = **$38.46**
Profit %: $38.46 / $15 = **256%**

That's a great flip. Track dozens of these and your instincts sharpen.

---

## Monthly review (last Sunday of each month)

Open the sheet, look at:
- Top 5 profit items — what category? More of these?
- Bottom 5 (losses or 1%-margin sales) — why? Sourcing mistake? Pricing mistake?
- Inventory aging — anything 120+ days? Time to discount, relist with new photos, or return to estate sale consignment.
- Total revenue, total profit, effective hourly rate (profit ÷ hours worked)

This is the feedback loop that makes you better over time.
