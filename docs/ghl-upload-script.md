# GHL Upload Helper — Usage

A pre-formatting tool that cuts course upload time from ~6-8 hours to ~2 hours of paste-clicking.

## Why this exists (instead of full API automation)

GHL's public API does NOT support creating courses, modules, or lessons programmatically. It's been an open feature request for years. So full automation isn't possible.

Instead, this tool generates **pre-formatted HTML lesson content with one-click-copy buttons** so you can paste each lesson into GHL's UI without re-formatting markdown by hand.

## How to use

### 1. Generate the helper files

```bash
node server/src/tools/build-ghl-upload-helpers.js
```

This regenerates `tools/ghl-upload-helpers/`:
- `index.html` — overview of all 4 courses
- `ai-side-income.html` — every module + lesson for the AI course
- `affiliate-marketing.html` — every module + lesson for the affiliate course
- `estate-sale-sourcing.html` — every module + lesson for Estate Sale course
- `bookkeeping-from-home.html` — every module + lesson for the Bookkeeping course

Re-run any time you update a course's `curriculum.md` — the HTML helpers regenerate fresh.

### 2. Open the index in your browser

```bash
open tools/ghl-upload-helpers/index.html
```

### 3. Side-by-side workflow

1. Pick one course → open its helper page in your browser (left half of screen)
2. Open GHL Memberships → create the course (right half of screen)
3. For each module:
   - In the helper: click **Copy** next to "Module title" → paste into GHL's "Add Module" name field
   - In GHL: click **+ Add Lesson** in that module
   - In the helper: click **Copy** next to "Lesson title" → paste into GHL's lesson name field
   - In the helper: click **📋 Copy Lesson Body** at the top of the module
   - In GHL: in the rich-text editor, click the **Source Code** / `</>` button → paste → save
   - **Tip**: GHL's rich-text editor sometimes adds extra `<p>` wrappers — toggle Source Code mode off, verify it looks clean, fix if needed
4. Move to next module, repeat
5. After all modules in one course, attach resources (PDFs, downloads) per module
6. Move to next course, repeat

Estimated pace: ~3-5 minutes per lesson once you've got the rhythm. With 9 modules × 4 courses = 36 lessons total, that's ~2 hours of focused work. Far better than re-typing or re-formatting from scratch.

## What gets copied

The "Copy Lesson Body" button copies the lesson's full inner HTML (with proper formatting preserved). When you paste into GHL's rich-text editor in **Source Code mode**, you get:
- Headings, paragraphs, lists, tables
- Bold, italic, links, code blocks
- All formatting intact

Pasting in regular mode (not Source Code) may strip some formatting depending on GHL's editor — that's why we recommend Source Code paste.

## When to regenerate

Re-run the script whenever you:
- Edit a course's `curriculum.md`
- Add a new course (drop a new folder under `docs/courses/<slug>/` with a `curriculum.md`, re-run)
- Want to refresh after content changes

## Future upgrade path

When GHL adds proper public API support for courses (currently a top-voted feature request), this manual paste step can be replaced with full programmatic upload. The script's parsing logic will be reusable — only the "output" step needs to change.

## Rollback

Generated files are gitignored-by-convention as build output. If you want to wipe and regenerate: `rm -rf tools/ghl-upload-helpers/ && node server/src/tools/build-ghl-upload-helpers.js`
