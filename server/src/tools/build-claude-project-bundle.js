#!/usr/bin/env node
// Build an upload-ready bundle for the Income Academy AI Assistant
// (Claude Project). Packages all course content into one flat directory
// plus generates the system prompt, ready to drop into claude.ai Projects.
//
// Usage:
//   node server/src/tools/build-claude-project-bundle.js
//
// Reads:   docs/courses/<slug>/ (all files recursively)
// Writes:  tools/claude-project-bundle/
//            ├── SYSTEM_PROMPT.md  (paste this into Project custom instructions)
//            ├── README.md         (how to upload to Claude Projects)
//            ├── ai-side-income/   (all course files, flat structure)
//            ├── affiliate-marketing/
//            ├── estate-sale-sourcing/
//            └── bookkeeping-from-home/

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, rmSync, existsSync, copyFileSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '..', '..', '..');
const COURSES_DIR = join(REPO_ROOT, 'docs', 'courses');
const OUTPUT_DIR = join(REPO_ROOT, 'tools', 'claude-project-bundle');

const SYSTEM_PROMPT = `# Income Academy AI Assistant — System Prompt

You are the Income Academy AI Assistant, a custom Claude Project built for members of the Income Academy Foundation Pass. You help members apply what they're learning across the 4 income paths in the bundle: AI Side Income, Honest Affiliate Marketing, Estate Sale & Garage Sale Sourcing, and Bookkeeping From Home for Over-55s.

## Who members are

- Adults 50-75 (most concentrated 55-70)
- Semi-retired or near-retirement
- Non-technical (comfortable with email + browsers, not more)
- Skeptical — burned by past "get rich quick" courses
- Want part-time, honest income — not a new full-time career

## Your role

Draw answers from the course knowledge I've loaded into this Project (all curriculum.md, prompts, templates, scripts from docs/courses/). Reference specific modules by number when it helps the member connect the dot ("That's Module 6 in the Bookkeeping course").

## Voice

- Honest, warm, direct. Never hype-y.
- Treat them like a capable adult — they've run careers, they don't need hand-holding, but do explain jargon
- Acknowledge tradeoffs ("this works but takes 6-12 months")
- No exclamation points in chains ("Great!!!"), no emoji unless the member uses them first
- Avoid "amazing", "incredible", "revolutionary" — these words signal scam to this audience

## What you CAN help with

- Applying prompts from the library to their specific client/niche
- Adapting templates (cold outreach, proposals, engagement letters) to their situation
- Helping choose between paths ("should I do AI freelancing or bookkeeping?")
- Answering questions about course content
- Pricing decisions, client conversations, business fundamentals within the courses
- Pulling from real-world freelance, affiliate, reselling, bookkeeping knowledge when the course is silent on something specific

## What you must NOT do

- Make earnings guarantees or promises (FTC Biz Opp Rule)
- Provide specific tax advice — always recommend "talk to a CPA for your specific situation"
- Provide specific legal advice — recommend "talk to an attorney for your state"
- Recommend crossing professional lines (e.g., doing tax prep without credentials)
- Promise outcomes that depend on variables you can't see
- Recommend expensive tools or upsells when cheaper/free alternatives work

## When members ask about scaling beyond the Foundation Pass

For eBay Reselling: direct them to the Done-With-You graduation tier at https://incomeacademy.biz/apply-ebay (when they're sourcing $1,500+/mo consistently)

For other scaling: honestly acknowledge they may eventually outgrow our courses. Don't oversell.

## Response format

- Default: concise, scannable, specific
- Bullets over paragraphs when listing steps
- Module references like "See Module 4 in AI Side Income" when pulling from specific course content
- Code blocks for prompts / templates they can copy-paste
- End with ONE specific next action they can take in under 30 minutes

## Knowledge freshness

- Your training data goes through early 2026
- If they ask about something after April 2026, acknowledge you may not have latest info and recommend they verify
- Tool-specific information (ChatGPT features, QBO UI, affiliate network policies) can change — flag uncertainty

## Important brand facts

- Foundation Pass: $47 one-time + $19/mo membership (7-day free trial on the monthly)
- All 4 courses unlocked on day 1 — they can dip between them freely
- 7-day money-back guarantee on the $47
- Cancel $19/mo membership anytime in one click
- Income Academy LLC (Utah)
- Support: support@incomeacademy.biz
`;

const README_TEMPLATE = `# Income Academy AI Assistant — Claude Project Bundle

This directory contains everything you need to set up the Income Academy AI Assistant as a Claude Project at claude.ai/projects.

## Files in this bundle

- \`SYSTEM_PROMPT.md\` — the custom instructions for the Project. Paste into Project settings.
- \`ai-side-income/\` — all AI Side Income course content (curriculum, prompts, templates, scripts)
- \`affiliate-marketing/\` — all Affiliate Marketing course content
- \`estate-sale-sourcing/\` — Estate Sale Sourcing course content
- \`bookkeeping-from-home/\` — Bookkeeping course content

## Setup steps (15 minutes)

1. Go to claude.ai → Projects → **+ Create Project**
2. Name: \`Income Academy AI Assistant\`
3. Description: \`Your personal AI assistant for the Income Academy Foundation Pass\`
4. **Custom instructions**: copy the entire contents of \`SYSTEM_PROMPT.md\` and paste into the custom instructions field
5. **Project knowledge**: click "Add content" → upload the four course folders. Claude Projects accepts markdown files directly.
   - Option A: upload folder-by-folder (4 uploads)
   - Option B: zip the whole bundle folder first, upload zip (1 upload)
6. Click **Save**
7. Test with a sample question: "I have a client who wants a blog post but I don't know how to price it. What should I charge?" — the assistant should reference Module 6 of the AI Side Income course.
8. **Share** → "Anyone with link" → copy the share URL
9. Paste the share URL into the \`/members\` dashboard and the GHL course resources tiles (replace \`GHL_COURSE_URL_AI\` placeholder patterns in \`marketing/members/index.html\`)

## When to re-bundle

Run the build script whenever you update course content:

\`\`\`bash
node server/src/tools/build-claude-project-bundle.js
\`\`\`

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
`;

// ============================================================
// Helpers
// ============================================================

function copyRecursive(src, dst) {
  const stat = statSync(src);
  if (stat.isDirectory()) {
    if (!existsSync(dst)) mkdirSync(dst, { recursive: true });
    for (const entry of readdirSync(src)) {
      copyRecursive(join(src, entry), join(dst, entry));
    }
  } else {
    copyFileSync(src, dst);
  }
}

function countFiles(dir) {
  let count = 0;
  let totalSize = 0;
  const stat = statSync(dir);
  if (!stat.isDirectory()) return { count: 1, totalSize: stat.size };
  for (const entry of readdirSync(dir)) {
    const sub = countFiles(join(dir, entry));
    count += sub.count;
    totalSize += sub.totalSize;
  }
  return { count, totalSize };
}

// ============================================================
// Main
// ============================================================

function main() {
  console.log('📚 Building Claude Project bundle');
  console.log('   Source:', COURSES_DIR);
  console.log('   Output:', OUTPUT_DIR);
  console.log();

  // Fresh output dir
  if (existsSync(OUTPUT_DIR)) {
    rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Write SYSTEM_PROMPT.md
  writeFileSync(join(OUTPUT_DIR, 'SYSTEM_PROMPT.md'), SYSTEM_PROMPT);
  console.log('✓ SYSTEM_PROMPT.md');

  // Write README.md
  writeFileSync(join(OUTPUT_DIR, 'README.md'), README_TEMPLATE);
  console.log('✓ README.md');

  // Copy course directories
  const courses = readdirSync(COURSES_DIR).filter(entry => {
    const path = join(COURSES_DIR, entry);
    return statSync(path).isDirectory();
  });

  let totalFiles = 0;
  let totalBytes = 0;
  for (const slug of courses) {
    const src = join(COURSES_DIR, slug);
    const dst = join(OUTPUT_DIR, slug);
    copyRecursive(src, dst);
    const { count, totalSize } = countFiles(dst);
    console.log(`✓ ${slug}: ${count} files, ${(totalSize / 1024).toFixed(0)}KB`);
    totalFiles += count;
    totalBytes += totalSize;
  }

  console.log();
  console.log(`📦 Bundle ready: ${totalFiles} files, ${(totalBytes / 1024).toFixed(0)}KB total`);
  console.log();
  console.log('Next steps:');
  console.log(`   1. Zip the bundle:   cd ${OUTPUT_DIR.replace(REPO_ROOT + '/', '')}/.. && zip -r claude-project-bundle.zip claude-project-bundle/`);
  console.log(`   2. Upload to:        claude.ai → Projects → + Create Project`);
  console.log(`   3. Paste system prompt from SYSTEM_PROMPT.md into custom instructions`);
  console.log(`   4. Upload the zip (or individual folders) as project knowledge`);
  console.log(`   5. Test with sample question, then Share → copy link`);
}

main();
