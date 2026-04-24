#!/usr/bin/env node
// Build per-course HTML pages that make GHL course upload faster.
//
// Why: GHL's public API doesn't support creating courses/modules/lessons
// programmatically (still a feature request as of 2026). The next-best thing
// is to give the user pre-formatted HTML lesson content with one-click-copy
// buttons next to each lesson, so they can paste into GHL's UI without
// re-formatting.
//
// Usage:
//   node server/src/tools/build-ghl-upload-helpers.js
//
// Reads:   docs/courses/<slug>/curriculum.md  (each course)
// Writes:  tools/ghl-upload-helpers/<slug>.html  (one helper page per course)
//          tools/ghl-upload-helpers/index.html  (master index linking all four)

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Repo root: __dirname is server/src/tools, so up three levels is repo root.
const REPO_ROOT = join(__dirname, '..', '..', '..');
const COURSES_DIR = join(REPO_ROOT, 'docs', 'courses');
const OUTPUT_DIR = join(REPO_ROOT, 'tools', 'ghl-upload-helpers');

// ============================================================
// Minimal markdown → HTML converter
// ============================================================
// Supports: headings, paragraphs, bullets, numbered lists, bold, italic,
// inline code, code blocks, links, blockquotes, horizontal rules, tables.
// Not a full CommonMark implementation — covers 95% of what's in our
// curriculum.md files.

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function inline(s) {
  // Inline code first (preserve content)
  s = s.replace(/`([^`]+)`/g, (_, c) => `<code>${escapeHtml(c)}</code>`);
  // Bold (** before *)
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  // Links [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return s;
}

function mdToHtml(md) {
  const lines = md.split(/\r?\n/);
  const out = [];
  let inCode = false;
  let inList = false;
  let listType = null;
  let inTable = false;
  let inBlockquote = false;
  let paragraphBuf = [];

  function flushParagraph() {
    if (paragraphBuf.length) {
      out.push(`<p>${inline(paragraphBuf.join(' '))}</p>`);
      paragraphBuf = [];
    }
  }
  function closeList() {
    if (inList) {
      out.push(listType === 'ol' ? '</ol>' : '</ul>');
      inList = false;
      listType = null;
    }
  }
  function closeTable() {
    if (inTable) {
      out.push('</tbody></table>');
      inTable = false;
    }
  }
  function closeBlockquote() {
    if (inBlockquote) {
      out.push('</blockquote>');
      inBlockquote = false;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks
    if (/^```/.test(line)) {
      flushParagraph();
      closeList();
      closeTable();
      closeBlockquote();
      if (!inCode) {
        out.push('<pre><code>');
        inCode = true;
      } else {
        out.push('</code></pre>');
        inCode = false;
      }
      continue;
    }
    if (inCode) {
      out.push(escapeHtml(line));
      continue;
    }

    // Horizontal rule
    if (/^---+\s*$/.test(line) || /^\*\*\*+\s*$/.test(line)) {
      flushParagraph();
      closeList();
      closeTable();
      closeBlockquote();
      out.push('<hr/>');
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      closeList();
      closeTable();
      closeBlockquote();
      const level = headingMatch[1].length;
      out.push(`<h${level}>${inline(headingMatch[2])}</h${level}>`);
      continue;
    }

    // Tables — naive support for | a | b | header rows
    if (/^\|.*\|\s*$/.test(line) && /^\|[\s\-:|]+\|\s*$/.test(lines[i + 1] || '')) {
      flushParagraph();
      closeList();
      closeBlockquote();
      const headerCells = line.split('|').slice(1, -1).map(c => c.trim());
      out.push('<table><thead><tr>');
      headerCells.forEach(h => out.push(`<th>${inline(h)}</th>`));
      out.push('</tr></thead><tbody>');
      i++; // skip alignment row
      inTable = true;
      continue;
    }
    if (inTable) {
      if (!/^\|/.test(line)) {
        closeTable();
      } else {
        const cells = line.split('|').slice(1, -1).map(c => c.trim());
        out.push('<tr>');
        cells.forEach(c => out.push(`<td>${inline(c)}</td>`));
        out.push('</tr>');
        continue;
      }
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      flushParagraph();
      closeList();
      if (!inBlockquote) {
        out.push('<blockquote>');
        inBlockquote = true;
      }
      out.push(`<p>${inline(line.replace(/^>\s?/, ''))}</p>`);
      continue;
    } else if (inBlockquote && line.trim() === '') {
      closeBlockquote();
    }

    // Numbered lists
    const olMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (olMatch) {
      flushParagraph();
      if (!inList || listType !== 'ol') {
        closeList();
        out.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      out.push(`<li>${inline(olMatch[2])}</li>`);
      continue;
    }

    // Unordered lists
    const ulMatch = line.match(/^[\-\*]\s+(.+)$/);
    if (ulMatch) {
      flushParagraph();
      if (!inList || listType !== 'ul') {
        closeList();
        out.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      out.push(`<li>${inline(ulMatch[1])}</li>`);
      continue;
    }

    // Empty line — paragraph break
    if (line.trim() === '') {
      flushParagraph();
      closeList();
      continue;
    }

    // Default — accumulate into paragraph
    if (!inList) {
      paragraphBuf.push(line);
    }
  }

  flushParagraph();
  closeList();
  closeTable();
  closeBlockquote();
  if (inCode) out.push('</code></pre>');

  return out.join('\n');
}

// ============================================================
// Curriculum parser
// ============================================================
// Splits curriculum.md into modules.
// Each `## Module N — Title` becomes a module.
// Body content is everything between this heading and the next `## ` heading.

function parseCurriculum(mdText) {
  const lines = mdText.split(/\r?\n/);
  let courseTitle = null;
  const modules = [];
  let currentModule = null;
  let preambleBuf = [];
  let inPreamble = true;

  for (const line of lines) {
    if (!courseTitle) {
      const h1 = line.match(/^#\s+(.+)$/);
      if (h1) {
        courseTitle = h1[1].trim();
        continue;
      }
    }

    const moduleMatch = line.match(/^##\s+Module\s+(\d+)\s*[—\-:]\s*(.+)$/i)
      || line.match(/^##\s+(Module\s+\d+.*)$/i);

    if (moduleMatch) {
      if (currentModule) {
        modules.push(currentModule);
      }
      const num = (line.match(/Module\s+(\d+)/i) || [])[1] || String(modules.length);
      const titleAfter = (line.match(/^##\s+Module\s+\d+\s*[—\-:]\s*(.+)$/i) || [])[1]
        || (line.match(/^##\s+(.+)$/) || [])[1]
        || `Module ${num}`;
      currentModule = {
        number: num,
        title: titleAfter.trim(),
        bodyLines: [],
      };
      inPreamble = false;
      continue;
    }

    // Stop appending to last module if we hit a non-module ## (e.g. "## Included assets")
    const otherH2 = line.match(/^##\s+(?!Module)/i);
    if (otherH2 && currentModule) {
      modules.push(currentModule);
      currentModule = null;
      inPreamble = false;
      continue;
    }

    if (currentModule) {
      currentModule.bodyLines.push(line);
    } else if (inPreamble) {
      preambleBuf.push(line);
    }
  }

  if (currentModule) modules.push(currentModule);

  return {
    courseTitle: courseTitle || 'Untitled Course',
    preamble: preambleBuf.join('\n').trim(),
    modules: modules.map(m => ({
      number: m.number,
      title: m.title,
      body: m.bodyLines.join('\n').trim(),
      bodyHtml: mdToHtml(m.bodyLines.join('\n').trim()),
    })),
  };
}

// ============================================================
// HTML page generation
// ============================================================

const BRAND_CSS = `
  :root {
    --navy: #0f172a;
    --navy-light: #1e293b;
    --gold: #f59e0b;
    --gold-hover: #d97706;
    --cream: #f8fafc;
    --gray: #64748b;
    --gray-light: #94a3b8;
    --border: #e2e8f0;
    --success: #10b981;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px; line-height: 1.6; color: var(--navy); background: var(--cream);
    -webkit-font-smoothing: antialiased;
  }
  .header {
    background: var(--navy); color: var(--white);
    padding: 24px; border-bottom: 4px solid var(--gold);
  }
  .header-inner { max-width: 900px; margin: 0 auto; }
  .header h1 { color: #fff; font-size: 24px; margin-bottom: 4px; }
  .header p { color: var(--gray-light); font-size: 14px; }
  .container { max-width: 900px; margin: 0 auto; padding: 32px 24px 80px; }
  .toc {
    background: #fff; border: 1px solid var(--border); border-radius: 12px;
    padding: 20px 24px; margin-bottom: 24px;
  }
  .toc h2 { font-size: 16px; margin-bottom: 12px; color: var(--navy); }
  .toc ol { padding-left: 22px; }
  .toc li { padding: 4px 0; color: var(--navy); font-size: 14px; }
  .toc li a { color: var(--gold); text-decoration: none; }
  .toc li a:hover { text-decoration: underline; }
  .instructions {
    background: rgba(245, 158, 11, 0.08);
    border-left: 4px solid var(--gold);
    border-radius: 0 8px 8px 0;
    padding: 18px 22px; margin-bottom: 32px;
    font-size: 14px;
  }
  .instructions strong { color: var(--navy); }
  .module {
    background: #fff; border: 1px solid var(--border); border-radius: 12px;
    margin-bottom: 24px; overflow: hidden;
  }
  .module-header {
    background: var(--navy); color: #fff;
    padding: 16px 24px;
    display: flex; justify-content: space-between; align-items: center;
    flex-wrap: wrap; gap: 12px;
  }
  .module-title-block { flex: 1; min-width: 0; }
  .module-num {
    color: var(--gold); font-size: 11px; font-weight: 700;
    letter-spacing: 0.8px; text-transform: uppercase;
    margin-bottom: 4px;
  }
  .module-title {
    color: #fff; font-size: 18px; font-weight: 700;
  }
  .copy-btn {
    background: var(--gold); color: var(--navy); border: none;
    padding: 8px 16px; border-radius: 6px;
    font-weight: 700; font-size: 13px; cursor: pointer;
    transition: background 120ms;
    white-space: nowrap;
  }
  .copy-btn:hover { background: var(--gold-hover); }
  .copy-btn.copied { background: var(--success); color: #fff; }
  .module-fields {
    padding: 20px 24px;
    border-bottom: 1px solid var(--border);
    background: var(--cream);
  }
  .field-row {
    display: flex; align-items: center; gap: 12px; margin-bottom: 10px;
    flex-wrap: wrap;
  }
  .field-row:last-child { margin-bottom: 0; }
  .field-label {
    font-size: 11px; color: var(--gray);
    font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;
    min-width: 70px;
  }
  .field-value {
    flex: 1; min-width: 200px;
    background: #fff; border: 1px solid var(--border); border-radius: 6px;
    padding: 8px 12px; font-size: 14px; color: var(--navy);
    font-family: inherit;
  }
  .copy-mini {
    background: transparent; border: 1px solid var(--gold); color: var(--gold);
    padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 700;
    cursor: pointer;
  }
  .copy-mini:hover { background: var(--gold); color: var(--navy); }
  .copy-mini.copied { background: var(--success); color: #fff; border-color: var(--success); }
  .module-body { padding: 24px; }
  .module-body h1, .module-body h2, .module-body h3, .module-body h4 {
    color: var(--navy); margin-top: 16px; margin-bottom: 8px;
  }
  .module-body h3 { font-size: 17px; }
  .module-body h4 { font-size: 15px; }
  .module-body p { margin-bottom: 12px; }
  .module-body ul, .module-body ol { margin-left: 24px; margin-bottom: 12px; }
  .module-body li { margin-bottom: 6px; }
  .module-body strong { color: var(--navy); }
  .module-body code {
    background: #f1f5f9; padding: 2px 6px; border-radius: 4px;
    font-family: 'SF Mono', Menlo, Consolas, monospace; font-size: 13px;
  }
  .module-body pre {
    background: var(--navy); color: #cbd5e1;
    padding: 16px 18px; border-radius: 8px;
    font-family: 'SF Mono', Menlo, Consolas, monospace;
    font-size: 13px; line-height: 1.5;
    overflow-x: auto; margin: 12px 0;
  }
  .module-body pre code {
    background: none; color: inherit; padding: 0;
  }
  .module-body blockquote {
    border-left: 3px solid var(--gold);
    padding: 4px 16px; margin: 12px 0; color: var(--gray);
  }
  .module-body table {
    border-collapse: collapse; margin: 12px 0; font-size: 14px;
  }
  .module-body th, .module-body td {
    border: 1px solid var(--border); padding: 8px 12px; text-align: left;
  }
  .module-body th { background: var(--cream); font-weight: 700; }
  .module-body hr { border: none; border-top: 1px dashed var(--border); margin: 16px 0; }
  .footer {
    text-align: center; padding: 24px; color: var(--gray); font-size: 13px;
  }
`;

function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function generateCourseHelperHtml(courseSlug, parsed) {
  const moduleListItems = parsed.modules
    .map(m => `<li><a href="#module-${m.number}">Module ${m.number} — ${escapeHtml(m.title)}</a></li>`)
    .join('\n');

  const modulesHtml = parsed.modules
    .map(m => {
      const moduleTitle = `Module ${m.number} — ${m.title}`;
      const moduleId = `module-${m.number}`;
      const lessonId = `lesson-body-${m.number}`;
      return `
<article class="module" id="${moduleId}">
  <div class="module-header">
    <div class="module-title-block">
      <div class="module-num">Module ${m.number}</div>
      <div class="module-title">${escapeHtml(m.title)}</div>
    </div>
    <button class="copy-btn" data-copy-target="${lessonId}">📋 Copy Lesson Body</button>
  </div>
  <div class="module-fields">
    <div class="field-row">
      <span class="field-label">Module title</span>
      <input class="field-value" id="title-${m.number}" value="${escapeAttr(moduleTitle)}" readonly>
      <button class="copy-mini" data-copy-target="title-${m.number}" data-is-input="true">Copy</button>
    </div>
    <div class="field-row">
      <span class="field-label">Lesson title</span>
      <input class="field-value" id="lesson-title-${m.number}" value="${escapeAttr(m.title)}" readonly>
      <button class="copy-mini" data-copy-target="lesson-title-${m.number}" data-is-input="true">Copy</button>
    </div>
  </div>
  <div class="module-body" id="${lessonId}">
${m.bodyHtml}
  </div>
</article>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>GHL Upload Helper — ${escapeHtml(parsed.courseTitle)}</title>
<style>${BRAND_CSS}</style>
</head>
<body>

<header class="header">
  <div class="header-inner">
    <h1>${escapeHtml(parsed.courseTitle)}</h1>
    <p>GHL Upload Helper · ${parsed.modules.length} modules</p>
  </div>
</header>

<main class="container">

  <div class="instructions">
    <strong>How to use this page:</strong>
    Open GHL → Memberships → create a new course titled "<strong>${escapeHtml(parsed.courseTitle)}</strong>".
    Then for each module below: in GHL click <em>+ Add Module</em>, paste the module title;
    click <em>+ Add Lesson</em>, paste the lesson title; in the rich-text editor click the
    "Source Code" / "&lt;/&gt;" button and paste the lesson body HTML.
    Click each <strong>Copy</strong> button to copy that field to your clipboard.
  </div>

  <nav class="toc">
    <h2>Modules in this course</h2>
    <ol>
      ${moduleListItems}
    </ol>
  </nav>

  ${modulesHtml}

</main>

<footer class="footer">
  <p>Generated from <code>docs/courses/${escapeHtml(courseSlug)}/curriculum.md</code></p>
</footer>

<script>
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-copy-target]');
    if (!btn) return;
    const targetId = btn.getAttribute('data-copy-target');
    const target = document.getElementById(targetId);
    if (!target) return;

    let textToCopy;
    if (btn.getAttribute('data-is-input') === 'true') {
      textToCopy = target.value;
    } else {
      // Copy the inner HTML (so paste into rich-text editor preserves formatting)
      textToCopy = target.innerHTML;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      const originalText = btn.textContent;
      btn.textContent = '✓ Copied';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('copied');
      }, 1500);
    } catch (err) {
      alert('Copy failed — your browser may require manual selection. Triple-click the field and Cmd+C.');
      console.error(err);
    }
  });
</script>

</body>
</html>`;
}

function generateIndexHtml(courses) {
  const cards = courses
    .map(c => `
      <a class="course-link" href="${c.slug}.html">
        <div class="course-link-inner">
          <div class="course-link-num">Course ${c.order}</div>
          <h3>${escapeHtml(c.title)}</h3>
          <p>${c.modules} modules</p>
        </div>
      </a>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>GHL Upload Helpers — Income Academy</title>
<style>
  ${BRAND_CSS}
  .course-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 18px; margin-top: 24px;
  }
  .course-link {
    background: #fff; border: 1px solid var(--border); border-radius: 12px;
    padding: 28px 24px; text-decoration: none; color: var(--navy);
    transition: transform 120ms, box-shadow 120ms;
    display: block;
  }
  .course-link:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.08);
    border-color: var(--gold);
  }
  .course-link-num {
    color: var(--gold); font-size: 11px; font-weight: 700;
    letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 8px;
  }
  .course-link h3 { color: var(--navy); font-size: 18px; margin-bottom: 8px; }
  .course-link p { color: var(--gray); font-size: 13px; }
</style>
</head>
<body>
<header class="header">
  <div class="header-inner">
    <h1>Income Academy — GHL Upload Helpers</h1>
    <p>One page per course. Open in your browser, click Copy buttons, paste into GHL.</p>
  </div>
</header>
<main class="container">
  <div class="instructions">
    <strong>What this is:</strong> GHL's public API doesn't support creating
    courses/modules/lessons programmatically. So instead, this generates
    pre-formatted HTML for every lesson with one-click copy buttons. Open
    each course's helper page in your browser, log into GHL in another tab,
    and walk through module-by-module clicking <strong>Copy</strong> →
    pasting into GHL → next.
    <br><br>
    Estimated time savings: ~6-8 hrs of manual upload → ~2 hrs of paste-clicking.
  </div>
  <div class="course-grid">
    ${cards}
  </div>
</main>
<footer class="footer">
  <p>Regenerate: <code>node server/src/tools/build-ghl-upload-helpers.js</code></p>
</footer>
</body>
</html>`;
}

// ============================================================
// Main
// ============================================================

function discoverCourses() {
  if (!existsSync(COURSES_DIR)) {
    console.error(`Courses directory not found: ${COURSES_DIR}`);
    process.exit(1);
  }
  const entries = readdirSync(COURSES_DIR);
  const courses = [];
  for (const entry of entries) {
    const dir = join(COURSES_DIR, entry);
    if (!statSync(dir).isDirectory()) continue;
    const curriculumPath = join(dir, 'curriculum.md');
    if (!existsSync(curriculumPath)) continue;
    courses.push({ slug: entry, dir, curriculumPath });
  }
  return courses;
}

function main() {
  console.log('🏗  Building GHL Upload Helpers');
  console.log('   Courses dir:', COURSES_DIR);
  console.log('   Output dir: ', OUTPUT_DIR);
  console.log();

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const courses = discoverCourses();
  if (courses.length === 0) {
    console.error('No courses found in docs/courses/');
    process.exit(1);
  }

  // Stable course order — define explicitly for index page
  const orderMap = {
    'ai-side-income': 1,
    'affiliate-marketing': 2,
    'estate-sale-sourcing': 3,
    'bookkeeping-from-home': 4,
  };

  const indexEntries = [];
  for (const course of courses) {
    const md = readFileSync(course.curriculumPath, 'utf8');
    const parsed = parseCurriculum(md);
    const html = generateCourseHelperHtml(course.slug, parsed);
    const outPath = join(OUTPUT_DIR, `${course.slug}.html`);
    writeFileSync(outPath, html);
    console.log(`✓ ${course.slug}: ${parsed.modules.length} modules → ${outPath}`);
    indexEntries.push({
      slug: course.slug,
      title: parsed.courseTitle,
      modules: parsed.modules.length,
      order: orderMap[course.slug] || 99,
    });
  }

  indexEntries.sort((a, b) => a.order - b.order);
  const indexHtml = generateIndexHtml(indexEntries);
  writeFileSync(join(OUTPUT_DIR, 'index.html'), indexHtml);
  console.log(`✓ index → ${join(OUTPUT_DIR, 'index.html')}`);

  console.log();
  console.log('🎉 Done. Open the index in your browser:');
  console.log(`   open ${join(OUTPUT_DIR, 'index.html')}`);
}

main();
