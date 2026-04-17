// Idempotent migration runner.
// Runs every .sql file in ./migrations/ (except *_rollback.sql) in filename order,
// tracking applied migrations in a _migrations table. Safe to re-run.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

async function appliedSet() {
  const { rows } = await pool.query('SELECT name FROM _migrations');
  return new Set(rows.map((r) => r.name));
}

function migrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => /^\d+_.*\.sql$/.test(f))
    .filter((f) => !f.endsWith('_rollback.sql'))
    .sort();
}

async function run() {
  await ensureMigrationsTable();
  const done = await appliedSet();
  const files = migrationFiles();

  let applied = 0;
  for (const file of files) {
    if (done.has(file)) {
      console.log(`skip   ${file} (already applied)`);
      continue;
    }
    console.log(`apply  ${file} ...`);
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`       ✓ applied`);
      applied++;
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      console.error(`       ✗ failed: ${err.code || ''} ${err.message}`);
      throw err;
    } finally {
      client.release();
    }
  }

  if (applied === 0) console.log('\nNo pending migrations.');
  else console.log(`\nApplied ${applied} migration(s).`);
}

try {
  await run();
} catch (err) {
  process.exitCode = 1;
} finally {
  await pool.end();
}
