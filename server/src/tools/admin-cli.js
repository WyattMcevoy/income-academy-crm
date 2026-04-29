#!/usr/bin/env node
/**
 * Admin CLI — owner-scoped database access without going through the auth API.
 *
 * Bypasses the JWT/auth layer by reading DATABASE_URL from server/.env and
 * hitting Neon directly. All inserts default to OWNER_USER_ID (=3, Wyatt's
 * account). Use this when you (or an agent) need to add/list/delete records
 * but don't have a live JWT token.
 *
 * Safety:
 *   - Read/list operations are always safe.
 *   - Write operations (insert/delete) print a one-line summary before
 *     executing — review and Ctrl-C if it looks wrong.
 *   - --dry-run prints the SQL without executing.
 *   - All inserts are scoped to the OWNER user — no cross-account writes.
 *
 * Usage:
 *   node server/src/tools/admin-cli.js list expenses
 *   node server/src/tools/admin-cli.js list leads --limit 10
 *   node server/src/tools/admin-cli.js add expense --description "GHL" --amount 103.55 --date 2026-05-05 --category "SaaS"
 *   node server/src/tools/admin-cli.js add lead --name "Jane Doe" --email j@example.com --source "Facebook"
 *   node server/src/tools/admin-cli.js delete expense 12
 *   node server/src/tools/admin-cli.js sql "SELECT count(*) FROM expenses WHERE user_id = $OWNER"
 *   node server/src/tools/admin-cli.js whoami
 */

import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Always resolve server/.env regardless of where the script is invoked from.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { pool } = await import('../db/pool.js');

const OWNER = parseInt(process.env.OWNER_USER_ID || '3', 10);
const argv = process.argv.slice(2);

function parseFlags(args) {
  const out = {};
  let positional = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = args[i + 1];
      if (next == null || next.startsWith('--')) {
        out[key] = true;
      } else {
        out[key] = next;
        i++;
      }
    } else {
      positional.push(a);
    }
  }
  return { flags: out, positional };
}

const cmd = argv[0];
const sub = argv[1];
const { flags, positional } = parseFlags(argv.slice(2));
const DRY = flags['dry-run'] || flags['dry'] || false;

async function main() {
  switch (cmd) {
    case 'list':
      return await listCmd(sub);
    case 'add':
      return await addCmd(sub);
    case 'delete':
      return await deleteCmd(sub, positional[0]);
    case 'sql':
      return await sqlCmd(positional[0]);
    case 'whoami':
      return await whoami();
    case 'help':
    case '--help':
    case undefined:
      return printHelp();
    default:
      console.error(`Unknown command: ${cmd}`);
      printHelp();
      process.exit(1);
  }
}

function printHelp() {
  console.log(`
Income Academy admin CLI — direct DB access (bypasses /api auth).

Owner user: id=${OWNER}

Commands:
  list <table>           list rows owned by OWNER (expenses|leads|lead_notes|clients|users)
                         flags: --limit N (default 25), --order col (default created_at desc)
  add expense            --description --amount (decimal) --date (YYYY-MM-DD)
                         optional: --category --notes --status (Pending|Submitted|Reimbursed|Denied)
  add lead               --name --email --phone --source --stage (default 'New Lead')
  add note               --lead-id --body
  delete <table> <id>    delete one row by id (owner-scoped)
  sql "<query>"          run a raw SELECT (writes blocked unless --allow-writes)
                         placeholder: $OWNER expands to the owner user_id
  whoami                 confirm DB connection + which user/account

Global flags:
  --dry-run              print what would happen, don't execute
  --json                 output as JSON instead of formatted

Examples:
  node server/src/tools/admin-cli.js list expenses
  node server/src/tools/admin-cli.js add expense --description "Render Pro" --amount 7.00 --date 2026-05-15 --category "SaaS"
  node server/src/tools/admin-cli.js sql "SELECT category, sum(amount_cents)/100.0 AS total FROM expenses WHERE user_id = $OWNER GROUP BY category"
`.trim());
}

async function whoami() {
  const u = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [OWNER]);
  const row = u.rows[0];
  if (!row) throw new Error(`No user with id=${OWNER} in this DB`);
  console.log(`Owner user: #${row.id} ${row.email}${row.name ? ' (' + row.name + ')' : ''}`);
  console.log(`DB host:    ${(process.env.DATABASE_URL || '').match(/@([^/]+)/)?.[1] || 'unknown'}`);
}

async function listCmd(table) {
  const allowed = {
    expenses: 'SELECT * FROM expenses WHERE user_id = $1 ORDER BY incurred_on DESC LIMIT $2',
    leads:    'SELECT id, name, email, phone, stage, source, is_client, follow_up_date, created_at FROM leads WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
    lead_notes: 'SELECT n.id, n.lead_id, l.name AS lead_name, n.body, n.created_at FROM lead_notes n JOIN leads l ON l.id = n.lead_id WHERE n.user_id = $1 ORDER BY n.created_at DESC LIMIT $2',
    clients:  'SELECT id, name, email, phone, became_client_at FROM leads WHERE user_id = $1 AND is_client = TRUE ORDER BY became_client_at DESC LIMIT $2',
    users:    'SELECT id, email, name, created_at FROM users ORDER BY id LIMIT $2',
  };
  const sql = allowed[table];
  if (!sql) throw new Error(`Unknown table "${table}". Allowed: ${Object.keys(allowed).join(', ')}`);
  const limit = parseInt(flags.limit || '25', 10);
  const args = table === 'users' ? [limit] : [OWNER, limit];
  const sqlPositional = table === 'users' ? sql.replace('$1', '$1') : sql;
  // Adjust user query
  const finalSql = table === 'users' ? sql.replace('$2', '$1') : sql;
  const finalArgs = table === 'users' ? [limit] : [OWNER, limit];
  const { rows } = await pool.query(finalSql, finalArgs);
  if (flags.json) {
    console.log(JSON.stringify(rows, null, 2));
  } else {
    console.table(rows);
    console.log(`(${rows.length} row${rows.length === 1 ? '' : 's'})`);
  }
}

async function addCmd(kind) {
  if (kind === 'expense') {
    const description = flags.description;
    const amount = parseFloat(flags.amount);
    const date = flags.date;
    if (!description || isNaN(amount) || !date) {
      throw new Error('add expense requires --description --amount --date');
    }
    const cents = Math.round(amount * 100);
    const status = flags.status || 'Pending';
    if (!['Pending','Submitted','Reimbursed','Denied'].includes(status)) {
      throw new Error('--status must be Pending|Submitted|Reimbursed|Denied');
    }
    const sql = `INSERT INTO expenses (user_id, description, amount_cents, category, incurred_on, reimbursement_status, notes)
                 VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
    const args = [OWNER, description, cents, flags.category || null, date, status, flags.notes || null];
    if (DRY) { console.log('[DRY]', sql, args); return; }
    console.log(`+ adding expense: ${description} | $${amount.toFixed(2)} | ${date}`);
    const { rows } = await pool.query(sql, args);
    console.log(`✓ created #${rows[0].id}`);
  } else if (kind === 'lead') {
    const name = flags.name;
    if (!name) throw new Error('add lead requires --name');
    const stage = flags.stage || 'New Lead';
    const sql = `INSERT INTO leads (user_id, name, email, phone, source, stage)
                 VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, name, stage`;
    const args = [OWNER, name, flags.email || null, flags.phone || null, flags.source || null, stage];
    if (DRY) { console.log('[DRY]', sql, args); return; }
    console.log(`+ adding lead: ${name} (${stage})`);
    const { rows } = await pool.query(sql, args);
    console.log(`✓ created #${rows[0].id}`);
  } else if (kind === 'note') {
    const leadId = parseInt(flags['lead-id'], 10);
    const body = flags.body;
    if (!leadId || !body) throw new Error('add note requires --lead-id and --body');
    const sql = `INSERT INTO lead_notes (lead_id, user_id, body) VALUES ($1,$2,$3) RETURNING id`;
    const args = [leadId, OWNER, body];
    if (DRY) { console.log('[DRY]', sql, args); return; }
    console.log(`+ adding note on lead #${leadId}`);
    const { rows } = await pool.query(sql, args);
    console.log(`✓ created note #${rows[0].id}`);
  } else {
    throw new Error(`Unknown add target "${kind}". Allowed: expense, lead, note`);
  }
}

async function deleteCmd(table, id) {
  const allowed = ['expenses', 'leads', 'lead_notes'];
  if (!allowed.includes(table)) throw new Error(`Unknown table "${table}". Allowed: ${allowed.join(', ')}`);
  const numId = parseInt(id, 10);
  if (!numId) throw new Error(`Invalid id: ${id}`);
  const sql = `DELETE FROM ${table} WHERE id = $1 AND user_id = $2 RETURNING id`;
  if (DRY) { console.log('[DRY]', sql, [numId, OWNER]); return; }
  console.log(`- deleting ${table}#${numId} (owner-scoped)`);
  const { rows } = await pool.query(sql, [numId, OWNER]);
  if (!rows[0]) console.log('(nothing matched — wrong id or wrong owner)');
  else console.log(`✓ deleted #${rows[0].id}`);
}

async function sqlCmd(query) {
  if (!query) throw new Error('sql requires a query string');
  const expanded = query.replaceAll('$OWNER', String(OWNER));
  const isWrite = /^\s*(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|CREATE)/i.test(expanded);
  if (isWrite && !flags['allow-writes']) {
    throw new Error('Write queries require --allow-writes flag');
  }
  if (DRY) { console.log('[DRY]', expanded); return; }
  const { rows, rowCount } = await pool.query(expanded);
  if (flags.json) console.log(JSON.stringify(rows, null, 2));
  else if (rows.length) { console.table(rows); console.log(`(${rows.length} rows)`); }
  else console.log(`(no rows; ${rowCount} affected)`);
}

main()
  .catch((e) => { console.error('✗', e.message); process.exit(1); })
  .finally(() => pool.end());
