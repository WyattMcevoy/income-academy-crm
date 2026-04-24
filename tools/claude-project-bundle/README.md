# Income Academy AI Assistant — Claude Project Bundle

This directory contains everything you need to set up the Income Academy AI Assistant as a Claude Project at claude.ai/projects.

## Files in this bundle

- `SYSTEM_PROMPT.md` — the custom instructions for the Project. Paste into Project settings.
- `ai-side-income/` — all AI Side Income course content (curriculum, prompts, templates, scripts)
- `affiliate-marketing/` — all Affiliate Marketing course content
- `estate-sale-sourcing/` — Estate Sale Sourcing course content
- `bookkeeping-from-home/` — Bookkeeping course content

## Setup steps (15 minutes)

1. Go to claude.ai → Projects → **+ Create Project**
2. Name: `Income Academy AI Assistant`
3. Description: `Your personal AI assistant for the Income Academy Foundation Pass`
4. **Custom instructions**: copy the entire contents of `SYSTEM_PROMPT.md` and paste into the custom instructions field
5. **Project knowledge**: click "Add content" → upload the four course folders. Claude Projects accepts markdown files directly.
   - Option A: upload folder-by-folder (4 uploads)
   - Option B: zip the whole bundle folder first, upload zip (1 upload)
6. Click **Save**
7. Test with a sample question: "I have a client who wants a blog post but I don't know how to price it. What should I charge?" — the assistant should reference Module 6 of the AI Side Income course.
8. **Share** → "Anyone with link" → copy the share URL
9. Paste the share URL into the `/members` dashboard and the GHL course resources tiles (replace `GHL_COURSE_URL_AI` placeholder patterns in `marketing/members/index.html`)

## When to re-bundle

Run the build script whenever you update course content:

```bash
node server/src/tools/build-claude-project-bundle.js
```

Then re-upload the updated folders to your existing Claude Project (it will replace old files).

## Custom GPT alternative (optional)

If you also want to offer this via ChatGPT's custom GPTs:
1. Go to chatgpt.com/gpts/editor → Create
2. Same name + description
3. Same system prompt (paste from SYSTEM_PROMPT.md)
4. Upload the same course files as Knowledge (GPTs accept up to 20 files, 512MB — should fit)
5. Publish with link

Share BOTH the Claude Project link and the GPT link from the members portal so buyers can pick their platform.

## Size estimate

The full bundle totals roughly 40-80k tokens of source content across all 4 courses (well within Claude Projects' 200k token limit). Should load fast and queries complete in seconds.
