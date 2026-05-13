# AI Side Income — Stale-Risk Audit List

AI tools change every 4–8 weeks. UI shifts, features sunset, model names change, pricing tiers shuffle. This list ranks each module by how fast it will go stale, so quarterly reviews can prioritize the riskiest content first.

**Last reviewed:** 2026-05-12
**Next review:** 2026-08-12 (set calendar reminder)

---

## Review cadence

Quarterly (Jan / Apr / Jul / Oct). 90 minutes total.

For each module marked **HIGH-RISK** below:
1. Open the lesson
2. Verify every UI screenshot is still accurate (open the actual tool, compare)
3. Verify every model name + feature mention still exists
4. If anything has changed: update the lesson AND the "Last Reviewed" stamp at the top
5. If something changed but you can't update it today: add `> ⚠️ Outdated — pending update` callout at the top of the section

For each **MEDIUM-RISK** module: skim, spot-check 1–2 screenshots, full review only if something obvious looks off.

For each **LOW-RISK** module: every other quarter only.

---

## Risk-ranked module list

### 🔴 HIGH-RISK (re-review every quarter)

| Module | What's risky | Most likely to break |
|---|---|---|
| **Module 1** — Your AI Assistants, Explained | Lists current tools (ChatGPT, Claude, Gemini), references model names | Tool gets renamed/sunsetted (e.g., Bard → Gemini); side-by-side comparison images become outdated |
| **Module 2** — Talking to AI | Demonstrates UI screenshots of prompt entry, conversation interfaces | Both ChatGPT and Claude redesign their UIs roughly every 6 months |
| **Module 4** — Landing Your First 3 Clients (Custom Assistant Config) | References Claude Project setup OR ChatGPT custom GPT setup with specific UI steps | Both Anthropic and OpenAI have changed the "Create" flow multiple times |
| **Module 5** — Doing the Work with AI | Workflow demos using specific features (e.g., file uploads, web search, code interpreter) | Features get renamed, moved to different tiers, or paywalled |

### 🟡 MEDIUM-RISK (spot-check quarterly, full review semi-annually)

| Module | Why medium |
|---|---|
| **Module 3** — Five AI-Ready Side Hustles | Pricing on freelance platforms (Upwork rates, Fiverr) shifts but slowly; concept is durable |
| **Module 6** — Pricing Your Time | Market rates change yearly, not quarterly; framework is durable |

### 🟢 LOW-RISK (review semi-annually)

| Module | Why low |
|---|---|
| **Module 0** — Welcome + Setup | Mostly evergreen tone-setting; account-setup steps drift but slowly |
| **Module 7** — Boundaries + Scheduling | Time-management content; not tool-dependent |
| **Module 8** — Your 90-Day Plan | Framework content; durable |

---

## How to mark a lesson as reviewed

Add this block at the very top of the lesson `.md` file (and the `.html` version):

```markdown
> **Last reviewed:** 2026-05-12
> **Next review due:** 2026-08-12
> If you spot something outdated — a screenshot that doesn't match what you see, a feature that's been removed — email support@incomeacademy.biz and we'll update fast.
```

---

## Quarterly review checklist

Run through this every 3 months:

- [ ] Re-read Module 1 — are the 3 tools listed still the top 3? Any new ones (e.g., a new entrant from xAI, Meta, etc.) that need adding?
- [ ] Open Claude, ChatGPT, and Gemini side-by-side — do the demo screenshots in Module 1 still match?
- [ ] Open the "Create new Project" flow in Claude and "Create new GPT" in ChatGPT — do the steps in Module 4 still match the current UI?
- [ ] Spot-check 3 random screenshots in Module 5 — do they match current UI?
- [ ] Update the "Last Reviewed" date in each module file
- [ ] Update the date at the top of THIS file (`STALE-RISK-LIST.md`)
- [ ] If anything is outdated AND can't be fixed today: add `> ⚠️ Outdated — pending update` callout, then add to your to-fix list

---

## When to do an emergency review (out of cadence)

Trigger an emergency review if any of these happen:

- Anthropic launches a major Claude UI redesign
- OpenAI sunsets a feature mentioned in the course
- A major model deprecation announcement (e.g., GPT-4 retiring)
- A pricing tier change that affects what the lessons recommend
- A member emails saying "this doesn't match what I see"

In all of those cases: schedule a 60-minute review block within 7 days. Don't let stale content sit — it's the #1 reported cancel reason for the AI course.

---

## Member-facing trust signal

The "Last Reviewed" stamp at the top of each lesson signals to members that you maintain the content. This matters more than the actual freshness — it's a trust marker. Members forgive a 2-month-old screenshot if they see you reviewed the lesson last quarter. They cancel over a 12-month-old screenshot with no review date.

Even on quarters where nothing changed: update the "Last Reviewed" date. The signal of "we checked" is the asset.
