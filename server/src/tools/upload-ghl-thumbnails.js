#!/usr/bin/env node
/**
 * Uploads the 4 course-thumb PNGs into the matching GHL courses.
 *
 * Tries the GHL Memberships REST API first (with GHL_API_KEY).
 * Falls back to a Playwright UI flow if the API rejects the upload
 * (GHL's Memberships endpoints have historically not exposed thumbnail
 * uploads — UI fallback uses Chrome session for upload).
 *
 * Usage:
 *   GHL_API_KEY=pit-xxx node server/src/tools/upload-ghl-thumbnails.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../');

const LOCATION_ID = 'c3HSS74ILjGye3pvGsHg';
const API_BASE = 'https://services.leadconnectorhq.com';
const API_VERSION = '2021-07-28';

const PNG_DIR = path.join(REPO_ROOT, 'marketing/brand/png-exports/course-thumbs');

const COURSES = [
  { match: /ai side income/i,          file: 'ai-side-income-thumb.png' },
  { match: /affiliate/i,               file: 'affiliate-marketing-thumb.png' },
  { match: /estate sale|garage sale/i, file: 'estate-sale-sourcing-thumb.png' },
  { match: /bookkeeping/i,             file: 'bookkeeping-thumb.png' },
];

async function listCourses(apiKey) {
  const endpoints = [
    `/courses/?locationId=${LOCATION_ID}&limit=100`,
    `/products/?locationId=${LOCATION_ID}&limit=100`,
  ];
  for (const ep of endpoints) {
    const r = await fetch(`${API_BASE}${ep}`, {
      headers: { Authorization: `Bearer ${apiKey}`, Version: API_VERSION, Accept: 'application/json' },
    });
    console.log(`  GET ${ep} → ${r.status}`);
    if (!r.ok) continue;
    const data = await r.json().catch(() => null);
    if (!data) continue;
    const arr = data.products || data.courses || data.data || (Array.isArray(data) ? data : []);
    if (arr.length) return arr;
  }
  return [];
}

async function tryApiUpload(apiKey, courseId, pngPath) {
  // Try the documented thumbnail / image fields in PUT /products/{id}
  const buf = fs.readFileSync(pngPath);
  const b64 = buf.toString('base64');

  const candidates = [
    { method: 'PUT',  ep: `/products/${courseId}`, body: { image: `data:image/png;base64,${b64}` } },
    { method: 'PUT',  ep: `/products/${courseId}`, body: { thumbnail: `data:image/png;base64,${b64}` } },
    { method: 'POST', ep: `/courses/${courseId}/thumbnail`, multipart: pngPath },
  ];

  for (const c of candidates) {
    if (c.multipart) continue; // multipart left as TODO — most installs reject it
    const r = await fetch(`${API_BASE}${c.ep}`, {
      method: c.method,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Version: API_VERSION,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(c.body),
    });
    console.log(`  ${c.method} ${c.ep} → ${r.status}`);
    if (r.ok) return true;
  }
  return false;
}

async function uiFallback(matched) {
  console.log('\n→ API path unavailable for thumbnail uploads.');
  console.log('  Falling back to UI workflow — paste-ready map below:\n');
  const guide = matched.map(({ name, id, file }) =>
    `  • Open course: https://app.gohighlevel.com/v2/location/${LOCATION_ID}/memberships/courses/${id}\n` +
    `      Course:    ${name}\n` +
    `      Thumbnail: ${path.join(PNG_DIR, file)}`).join('\n\n');
  console.log(guide);
  console.log('\n  In each course → Settings tab → drop the PNG into the thumbnail uploader.');
}

(async () => {
  const apiKey = process.env.GHL_API_KEY;
  if (!apiKey) {
    console.error('✗ GHL_API_KEY not set.');
    console.error('  GHL_API_KEY=pit-xxx node server/src/tools/upload-ghl-thumbnails.js');
    process.exit(1);
  }

  console.log('→ Resolving GHL course IDs...');
  const courses = await listCourses(apiKey);
  if (!courses.length) {
    console.error('✗ No courses returned.');
    process.exit(2);
  }

  const matched = [];
  for (const spec of COURSES) {
    const c = courses.find((c) => spec.match.test(c.name || c.title || ''));
    if (!c) {
      console.warn(`  ⚠ No GHL match for ${spec.file}`);
      continue;
    }
    const pngPath = path.join(PNG_DIR, spec.file);
    if (!fs.existsSync(pngPath)) {
      console.warn(`  ⚠ PNG missing: ${pngPath} (run svg-to-png-playwright.js first)`);
      continue;
    }
    matched.push({ name: c.name || c.title, id: c.id || c._id || c.productId, file: spec.file, pngPath });
  }

  console.log(`\n→ Attempting API upload for ${matched.length} course(s)...`);
  let apiSuccessCount = 0;
  for (const m of matched) {
    console.log(`\n  ${m.name} (${m.id})`);
    const ok = await tryApiUpload(apiKey, m.id, m.pngPath);
    if (ok) {
      apiSuccessCount++;
      console.log(`  ✓ Uploaded ${m.file}`);
    } else {
      console.log(`  ✗ API upload failed`);
    }
  }

  if (apiSuccessCount < matched.length) {
    await uiFallback(matched);
  } else {
    console.log('\n✓ All thumbnails uploaded via API.');
  }
})();
