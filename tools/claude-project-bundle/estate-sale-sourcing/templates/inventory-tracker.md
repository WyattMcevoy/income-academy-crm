# Inventory Tracker — Spreadsheet Structure

Track every item from buying to selling. Build this in Google Sheets or Excel.

---

## Column structure

Row 1 = headers. Freeze row 1.

| Col | Header | Data type | Notes |
|---|---|---|---|
| A | SKU | Text | Short unique ID: "2026-03-001", "2026-03-002"... |
| B | Purchase date | Date | |
| C | Source | Text | Estate sale company or address |
| D | Item description | Text | Brief: "Vintage Pyrex Snowflake Blue casserole 1.5qt" |
| E | Category | Text | Dropdown: Pyrex / Tools / Books / Electronics / Jewelry / Misc |
| F | Condition | Text | Dropdown: Excellent / Good / Fair / For Parts |
| G | Cost | Currency | What you paid |
| H | Listed? | Text/Check | Y/N |
| I | Platform | Text | eBay / Facebook / Mercari / Etsy |
| J | Listed date | Date | |
| K | List price | Currency | |
| L | Sold? | Text/Check | Y/N |
| M | Sold date | Date | |
| N | Sold price | Currency | |
| O | Ship cost | Currency | |
| P | Fee (eBay + payments) | Currency | Usually 13.25% of (sale + ship) |
| Q | Net revenue | Formula | `=N-O-P` |
| R | Net profit | Formula | `=Q-G` |
| S | Profit % | Formula | `=R/G` (format as percent) |
| T | Days to sell | Formula | `=IF(L="Y", M-J, "pending")` |
| U | Notes | Text | Any context: "buyer haggled $5 off list", "shipped double-boxed" |

---

## Useful formulas for summary (separate tab)

### Monthly metrics
```
Items sold this month:     =COUNTIFS(L:L, "Y", M:M, ">="&DATE(2026,3,1), M:M, "<"&DATE(2026,4,1))
Revenue this month:        =SUMIFS(N:N, L:L, "Y", M:M, ">="&DATE(2026,3,1), M:M, "<"&DATE(2026,4,1))
Profit this month:         =SUMIFS(R:R, L:L, "Y", M:M, ">="&DATE(2026,3,1), M:M, "<"&DATE(2026,4,1))
Average margin %:          =AVERAGEIFS(S:S, L:L, "Y", M:M, ">="&DATE(2026,3,1), M:M, "<"&DATE(2026,4,1))
```

### Inventory aging
```
Items unsold > 60 days:    =COUNTIFS(H:H, "Y", L:L, "N", J:J, "<"&TODAY()-60)
Items unsold > 120 days:   =COUNTIFS(H:H, "Y", L:L, "N", J:J, "<"&TODAY()-120)
Total capital tied up:     =SUMIFS(G:G, L:L, "N")
```

### Category performance
```
Pyrex profit (YTD):        =SUMIFS(R:R, E:E, "Pyrex", L:L, "Y", M:M, ">="&DATE(2026,1,1))
Tools profit (YTD):        =SUMIFS(R:R, E:E, "Tools", L:L, "Y", M:M, ">="&DATE(2026,1,1))
```

---

## Monthly review ritual (last Sunday of each month)

1. **Total profit** — hit your target? If not, what's the constraint?
2. **Profit per hour** — revenue ÷ hours worked. Sanity check your hourly rate.
3. **Top 5 profit items** — what category? Can I source more of these?
4. **Bottom 5** (break-even or loss) — why? Pricing or sourcing mistake?
5. **Inventory aging** — anything 120+ days unsold?
   - Options: discount 30-40%, relist with new photos, bundle with other slow items, donate (write off)
6. **Category leaders** — shift sourcing focus toward highest-margin category
7. **Days-to-sell median** — under 45 days for vintage? Under 90 for slow movers?

---

## Quarterly deep review

Every 3 months, look for:
- Category specialization opportunity (highest $ per hour should get more attention)
- Categories to drop (consistent < 50% margin after 90 days)
- Platform performance (eBay vs FB Marketplace vs Mercari — which moves your inventory fastest?)
- Reinvestment decisions based on cash flow

This is the data that turns hobby reselling into a real business. Without it, you're flying blind.
