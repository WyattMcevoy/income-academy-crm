# Custom AI Assistant Config Worksheet — AI Side Income, Module 4

**Goal**: by the end of this worksheet you have a fully-configured custom AI assistant (Claude Project, ChatGPT GPT, or both) tailored to your chosen side hustle. Not a generic "ChatGPT" — a specialized helper that knows your context.

**Time required**: 30–45 minutes. The artifact you produce — your custom assistant — saves hours every week going forward.

---

## Part 1 — Pick your hustle focus

From Module 3 (Five AI-Ready Side Hustles), you picked one. Re-state it here:

**My focus side hustle:** ☐ AI writing for small business ☐ AI virtual assistant ☐ AI tutoring/coaching ☐ AI-assisted research ☐ AI-assisted bookkeeping prep

**One sentence about who I help:**
> ______________________________

---

## Part 2 — The assistant's persona

Fill in:

| Field | Your answer |
|---|---|
| Assistant name | (e.g., "Maggie's Writing Helper" — short, memorable) |
| Role / job description (1 sentence) | (e.g., "You help me draft email newsletters for landscaping clients") |
| Tone | ☐ Warm + neighborly ☐ Professional + precise ☐ Punchy + bold ☐ Other: _____ |
| Default output format | ☐ Bullet points ☐ Full paragraphs ☐ Tables ☐ Depends on task |

---

## Part 3 — Context the assistant needs to know

This is the most important part. The more context you give, the better the output.

### About me / my business

Fill in 3–5 bullet points the assistant should always know:

- I work with: (audience type)
- My clients typically need: (the problem I solve)
- My pricing model is: (hourly, retainer, flat project)
- Words I never use: (e.g., "synergy," "leverage," "circle back" — your no-go list)
- Words/phrases I do use: (signature phrases, voice markers)

### Examples of my best work

Paste in 2–3 examples of your real work the assistant should learn from:

**Example 1** (paste full text):

```
[Your example here — a real email, post, or output you're proud of]
```

**Example 2**:

```
[Second example]
```

The assistant uses these to mimic your voice and quality bar.

---

## Part 4 — The system prompt (paste into Claude Project or ChatGPT GPT)

Assemble parts 2–3 into the actual configuration. Template below:

```
You are [assistant name], a [role description from Part 2].

CONTEXT ABOUT THE USER:
- They help: [audience]
- Their clients need: [problem solved]
- Their pricing: [model]
- They never use these words: [no-go list]
- They use these phrases: [signature phrases]

TONE: [tone from Part 2]
DEFAULT FORMAT: [format from Part 2]

WHEN GIVEN A TASK:
1. Ask one clarifying question if the task is ambiguous
2. Produce output in the user's voice based on the examples below
3. Flag if the request would require information you don't have

EXAMPLES OF THE USER'S BEST WORK:
[Paste Example 1 here]

[Paste Example 2 here]

IMPORTANT GUARDRAILS:
- Never invent facts about people, companies, or products
- Never make income claims or "guaranteed" promises
- If unsure, ask. Don't guess.
- Always disclose if recommendations are based on general patterns vs. specific data
```

---

## Part 5 — Set it up

### If using Claude (Anthropic Claude Project)

1. Go to claude.ai → Projects → "New project"
2. Name: your assistant's name from Part 2
3. Project instructions: paste the assembled system prompt from Part 4
4. Knowledge base: upload your example files (Part 3) as PDFs or txt
5. Test: ask the assistant to do a real task you'd give it tomorrow

### If using ChatGPT (Custom GPT)

1. Go to chatgpt.com → "Explore GPTs" → "Create"
2. Configure tab: paste assembled system prompt
3. Knowledge: upload example files
4. Capabilities: enable Web Search if your hustle needs current info; Code Interpreter if numerical
5. Test in preview pane

### Test prompts (run each, see if output is usable)

**Test 1 — voice match:**
> "Draft a 200-word email about [topic relevant to your hustle]."

Does it sound like YOU, not like generic AI?

**Test 2 — boundary respect:**
> "Tell me how much money I'll make next month if I follow this strategy."

Does it appropriately refuse / hedge, per the guardrail?

**Test 3 — clarifying question:**
> "Write something for my client."

Does it ask a clarifying question rather than guessing?

---

## Part 6 — What "done" looks like

You can give your assistant a real task you'd normally spend 30 minutes on, and it produces a usable first draft in 2 minutes that needs only light editing.

If it produces generic-sounding output, your context (Part 3) is too thin. Add more examples.

---

## Part 7 — Update cadence

AI tools change every few weeks. UI shifts. Features sunset.

- ✅ Mark a quarterly calendar reminder: "Test custom assistant — is it still producing good output?"
- ✅ If you notice quality dropping, re-read Part 4 and tighten the system prompt
- ✅ Add new examples as your work gets better — the assistant should grow with you

---

## Submit your assistant setup

In the Foundation Pass portal: AI Side Income → Module 4 → submit:
1. Your assistant's name
2. A link to it (Claude Project share URL or ChatGPT GPT share URL)
3. One example of usable output it produced

**This marks the milestone for completing Module 4 + a real working AI tool.**
