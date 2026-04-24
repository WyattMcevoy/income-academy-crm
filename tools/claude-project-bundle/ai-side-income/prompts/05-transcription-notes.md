# Prompts — Transcription, Meeting Notes, & Summaries

For freelancers offering transcription and note organization for realtors, therapists, consultants, coaches, course creators.

## Pre-processing transcripts

### TR-01: Clean up a raw transcript
```
Below is a raw transcript from a meeting. It has:
- Filler words (um, uh, like, you know)
- Repeated phrases
- False starts
- Possibly misattributed speakers

Clean it into a readable transcript. Rules:
- Remove filler words unless they convey meaning
- Keep the speaker's voice intact — don't paraphrase or "improve" their phrasing
- Preserve all substantive content
- Mark speakers clearly [SPEAKER NAME]:
- Mark time if timestamps present

Don't summarize. Give me a clean, readable version.

Transcript:
[PASTE]
```

### TR-02: Fix speaker attribution
```
This transcript has ambiguous speaker labels. Based on context clues (names mentioned, topics owned, speaking style), identify who's speaking in each unclear segment and fix the labels.

Known speakers: [NAME 1 — ROLE], [NAME 2 — ROLE], etc.

Transcript:
[PASTE]

Return the corrected transcript with any speaker-identification reasoning noted in [BRACKETS] for the ambiguous parts.
```

## Meeting notes (structured output)

### TR-03: Standard meeting notes
```
Turn this meeting transcript into structured notes.

Attendees: [LIST]
Meeting purpose: [WHAT]
Date: [DATE]

Output format:
**Summary** (3-5 sentences covering main topics and decisions)

**Key discussion points** (bullet list, 1 line each)

**Decisions made** (bullet list — clear, actionable)

**Action items**
| Owner | Task | Due date |
|---|---|---|

**Open questions / parking lot** (bullet list)

**Next meeting**: [DATE if mentioned, otherwise "TBD"]

Transcript:
[PASTE]
```

### TR-04: Sales call notes for CRM entry
```
Turn this sales call transcript into CRM-entry format.

Prospect: [NAME + COMPANY]
Call date: [DATE]

Extract:
- Budget (if mentioned)
- Decision timeline
- Pain points (list, max 5)
- Objections raised (list with how we addressed each)
- Key decision-makers mentioned
- Next step agreed (with date)
- Follow-up action items

Length: fits on one CRM card (~250-350 words).

Transcript:
[PASTE]
```

### TR-05: Client therapy/coaching session notes
```
⚠️ Compliance reminder: I am NOT a therapist. This is note organization support for a licensed professional client. Maintain their framework; do not add clinical interpretations.

Turn this session transcript into the client's preferred note format.

Session type: [CBT / coaching / intake / follow-up]
Client's note style: [SOAP / DAP / free-form / etc.]

Output per their format. Do not add diagnostic language or clinical interpretations not present in the original. If the professional used specific language or frameworks, preserve exactly.

Transcript:
[PASTE]
```

## Summaries & derivative content

### TR-06: Executive summary from long meeting
```
Summarize this 1-hour meeting into a 2-paragraph executive summary for someone who couldn't attend.

Transcript:
[PASTE]

Focus on:
- What was decided
- What changed from our last understanding
- What needs the executive's input

Avoid:
- Jargon the exec doesn't use
- Tactical details unless they change strategy

Length: under 250 words.
```

### TR-07: Email follow-up summary
```
From this meeting transcript, draft a follow-up email to all attendees.

Transcript:
[PASTE]

Email structure:
- Subject: [MEETING TOPIC] — Notes + Action Items
- Thank attendees
- 2-3 sentence recap
- Bulleted action items with owners + deadlines
- Next meeting info
- "Reply if I missed anything"

Tone: professional, concise, collaborative.
Length: under 250 words.
```

### TR-08: Podcast episode show notes
```
Turn this podcast episode transcript into show notes for the client's website.

Episode title: [TITLE]
Guest: [NAME + CREDENTIAL]
Length: [MIN]

Output:
- 2-paragraph episode description (150-200 words)
- "In this episode" bullet list (5-8 points with timestamps)
- Key quotes (3-5, with timestamps)
- Resources mentioned (list of URLs, books, people)
- Guest bio (50-80 words)
- Connect with guest: [LINKS]

Transcript:
[PASTE]
```

### TR-09: Social posts from one episode
```
From this podcast/video transcript, extract 5 social posts (LinkedIn + X + Facebook).

For each platform and post:
- Platform
- Hook (first 3-5 words that would make someone stop scrolling)
- Body (respecting platform norms: LinkedIn 150-300 words, X under 280 chars, FB 100-200 words)
- Hashtag suggestions (3-5 relevant, not spammy)

Transcript:
[PASTE]
```

## Action item extraction

### TR-10: Extract only action items
```
From this transcript, extract only the action items. Nothing else.

Format:
| # | Owner | Task | Context | Due by |
|---|---|---|---|---|

If an action item has no clear owner, mark "UNASSIGNED" and flag.
If no clear due date, mark "Unspecified" and flag.

Transcript:
[PASTE]
```

### TR-11: Promise tracker
```
My client mentioned several commitments to people during this meeting. Extract each promise:

Format:
- Promise: [WHAT]
- To whom: [NAME]
- By when: [DATE or "ASAP"]
- How client will follow through: [SPECIFIC ACTION]

Transcript:
[PASTE]

These go in the client's "promises made" tracking so nothing falls through the cracks.
```

## Research / pattern analysis

### TR-12: Find themes across multiple meetings
```
I have transcripts from [N] meetings over the past month. Identify recurring themes:

Transcripts:
[PASTE ALL]

Output:
- Top 5 themes (something discussed in multiple meetings)
- Evolving narrative (what changed in the client's thinking)
- Unresolved questions (appearing in multiple meetings but never decided)
- Relationships/people mentioned frequently

Format as a monthly patterns report under 500 words.
```

### TR-13: Compare position evolution
```
Here's what my client said about [TOPIC] on [DATE 1]:
[QUOTE]

Here's what they said about the same topic on [DATE 2]:
[QUOTE]

Analyze:
- What changed?
- What stayed the same?
- What does the shift imply about their current position?

Be concise (under 150 words). This helps me prep for their next meeting.
```

## Delivery formats

### TR-14: Format for their preferred tool
```
My client wants these notes delivered to [TOOL — Notion / Obsidian / Google Docs / Evernote].

Apply formatting conventions appropriate to that tool:
- Notion: use H1/H2/H3 hierarchy, bullet lists, callouts
- Obsidian: markdown with [[wikilinks]] for people + projects mentioned
- Google Docs: straightforward markdown-like formatting
- Evernote: simple headings + bullets

Content to format: [PASTE]

Return in the appropriate format.
```

---

## Compliance / confidentiality

- If client works with legally protected data (medical, legal, financial), confirm you're operating under their NDA + business associate agreement if applicable
- Don't retain transcripts longer than client-requested retention period
- Never share transcript content outside the client engagement
- Never use transcripts to train your own AI without explicit consent
