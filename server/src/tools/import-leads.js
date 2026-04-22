#!/usr/bin/env node
// Import leads from a CSV file into the CRM.
// Usage: npm run import-leads -- path/to/file.csv
//
// Behavior:
// - Dedup by email: rows whose email already exists (for this owner) are skipped.
// - Rows with no email are still imported, tagged source = "Imported (no email)".
// - Flexible column matching: first_name/firstname/"First Name" all recognized.
// - Per-row outcome written to ./import-report-YYYY-MM-DD.csv for your review.
// - Idempotent: re-running on the same CSV only imports rows that weren't imported before.

import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse';
import { pool } from '../db/pool.js';

const OWNER_USER_ID = Number(process.env.OWNER_USER_ID || '1');
if (!Number.isInteger(OWNER_USER_ID) || OWNER_USER_ID < 1) {
  console.error('Invalid OWNER_USER_ID. Check .env');
  process.exit(1);
}

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: npm run import-leads -- path/to/file.csv');
  process.exit(1);
}
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

function pickCol(row, ...candidates) {
  for (const key of Object.keys(row)) {
    const norm = key.toLowerCase().replace(/[\s_-]+/g, '_');
    if (candidates.some((c) => c === norm)) return row[key];
  }
  return null;
}

function clean(v) {
  if (v == null) return null;
  const s = String(v).replace(/[\u0000-\u001F\u007F]/g, '').trim();
  return s || null;
}

function csvEscape(v) {
  const s = String(v ?? '');
  return `"${s.replace(/"/g, '""')}"`;
}

async function main() {
  console.log(`Owner user_id:  ${OWNER_USER_ID}`);
  console.log(`Reading:        ${filePath}`);

  const csvContent = fs.readFileSync(filePath, 'utf8');
  const records = await new Promise((resolve, reject) => {
    parse(
      csvContent,
      { columns: true, trim: true, skip_empty_lines: true, bom: true },
      (err, rows) => (err ? reject(err) : resolve(rows))
    );
  });

  console.log(`Found:          ${records.length} rows`);

  // Preload existing emails for fast O(1) dedup in memory.
  const { rows: existingRows } = await pool.query(
    `SELECT LOWER(email) AS email FROM leads
     WHERE user_id = $1 AND email IS NOT NULL AND email <> ''`,
    [OWNER_USER_ID]
  );
  const existingEmails = new Set(existingRows.map((r) => r.email));
  console.log(`Existing emails: ${existingEmails.size}`);
  console.log('\nImporting...');

  const report = [];
  let imported = 0;
  let skipped = 0;
  let noEmailImported = 0;
  let errors = 0;

  for (let i = 0; i < records.length; i++) {
    const row = records[i];
    let firstName = clean(pickCol(row, 'first_name', 'firstname'));
    let middleName = clean(pickCol(row, 'middle_name', 'middle_initial', 'middle'));
    let lastName = clean(pickCol(row, 'last_name', 'lastname', 'surname'));

    // If there's no first/last but there is a single `name` column (e.g.,
    // "Jon A Smith"), split it intelligently:
    //   1 word:   first only
    //   2 words:  first, last
    //   3 words:  first, middle, last
    //   4+ words: first = 1st, last = last, middle = everything in between
    if (!firstName && !lastName) {
      const fullName = clean(pickCol(row, 'name', 'full_name'));
      if (fullName) {
        const parts = fullName.split(/\s+/);
        if (parts.length === 1) {
          firstName = parts[0];
        } else if (parts.length === 2) {
          firstName = parts[0];
          lastName = parts[1];
        } else if (parts.length === 3) {
          firstName = parts[0];
          middleName = middleName || parts[1];
          lastName = parts[2];
        } else {
          firstName = parts[0];
          middleName = middleName || parts.slice(1, -1).join(' ');
          lastName = parts[parts.length - 1];
        }
      }
    }

    const email = clean(pickCol(row, 'email', 'email_address'));
    const phone = clean(
      pickCol(row, 'phone', 'phone_number', 'mobile', 'cell', 'telephone', 'cell_phone')
    );
    const phoneHome = clean(pickCol(row, 'home_phone', 'phone_home'));
    const phoneWork = clean(pickCol(row, 'work_phone', 'phone_work'));
    const leadSource =
      clean(pickCol(row, 'lead_source', 'source', 'lead_origin')) || 'Google Sheet Import';

    const emailLower = email ? email.toLowerCase() : null;
    const displayName =
      [firstName, middleName, lastName].filter(Boolean).join(' ') ||
      email ||
      'Unknown';

    // Dedup by email if present.
    if (emailLower && existingEmails.has(emailLower)) {
      report.push({ row: i + 2, email, status: 'skipped', reason: 'duplicate email' });
      skipped++;
      continue;
    }

    const sourceFinal = email ? leadSource : 'Imported (no email)';

    try {
      await pool.query(
        `INSERT INTO leads
           (user_id, name, first_name, middle_initial, last_name, email, phone, phone_home, phone_work, source, stage)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'New Lead')`,
        [OWNER_USER_ID, displayName, firstName, middleName, lastName, email, phone, phoneHome, phoneWork, sourceFinal]
      );
      if (emailLower) existingEmails.add(emailLower);
      if (!email) noEmailImported++;
      imported++;
      report.push({
        row: i + 2,
        email: email || '(none)',
        status: 'imported',
        reason: email ? 'ok' : 'no email',
      });
    } catch (err) {
      errors++;
      report.push({
        row: i + 2,
        email: email || '(none)',
        status: 'error',
        reason: err.code || err.message || 'unknown',
      });
    }

    if ((i + 1) % 1000 === 0) {
      console.log(`  ${i + 1} / ${records.length} processed...`);
    }
  }

  // Write the per-row report.
  const date = new Date().toISOString().slice(0, 10);
  const reportPath = path.resolve(`./import-report-${date}.csv`);
  const header = 'row,email,status,reason\n';
  const body = report
    .map((r) => `${r.row},${csvEscape(r.email)},${r.status},${csvEscape(r.reason)}`)
    .join('\n');
  fs.writeFileSync(reportPath, header + body + '\n');

  console.log('\nDone.');
  console.log(`  Imported:              ${imported}`);
  console.log(`    with no email:       ${noEmailImported}`);
  console.log(`  Skipped (dup email):   ${skipped}`);
  console.log(`  Errors:                ${errors}`);
  console.log(`  Total rows processed:  ${records.length}`);
  console.log(`\nPer-row report:         ${reportPath}`);
}

try {
  await main();
} catch (err) {
  console.error('Import failed:', err.message || err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
