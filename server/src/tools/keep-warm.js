#!/usr/bin/env node
/**
 * Keeps the Render API warm by pinging /api/health every 10 minutes.
 * Render's free tier spins down after 15 min of no traffic, then takes
 * ~50s to cold-start on next request — that's the source of slow logins.
 *
 * Cheaper alternatives:
 *   1. UptimeRobot free tier (https://uptimerobot.com) — set monitor on
 *      https://income-academy-crm.onrender.com/api/health every 5 min.
 *      Recommended over running this script locally because it works
 *      even when your laptop is asleep.
 *   2. Pay $7/mo for Render Starter — no spin-down at all.
 *
 * This script is the laptop-running fallback. Best for "I'm working today
 * and want fast CRM logins" sessions; not a permanent fix.
 *
 * Usage:
 *   node server/src/tools/keep-warm.js             # ping every 10 min, forever
 *   INTERVAL=300000 node server/src/tools/keep-warm.js   # custom interval (ms)
 *
 * Stop with Ctrl+C.
 */

const URL = process.env.URL || 'https://income-academy-crm.onrender.com/api/health';
const INTERVAL = parseInt(process.env.INTERVAL || '600000', 10); // default 10 min

async function ping() {
  const t0 = Date.now();
  try {
    const res = await fetch(URL);
    const ms = Date.now() - t0;
    const flag = ms > 5000 ? ' ⚠️  COLD-START' : '';
    console.log(`[${new Date().toISOString()}] ${res.status} ${ms}ms${flag}`);
  } catch (e) {
    console.error(`[${new Date().toISOString()}] error: ${e.message}`);
  }
}

console.log(`→ Keeping ${URL} warm — pinging every ${INTERVAL / 1000}s`);
console.log(`  Ctrl+C to stop.\n`);
ping();
setInterval(ping, INTERVAL);
