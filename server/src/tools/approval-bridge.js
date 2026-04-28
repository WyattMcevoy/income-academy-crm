#!/usr/bin/env node
// Approval Bridge — sends Telegram notification via OpenClaw when Claude needs input
// Usage: node approval-bridge.js "Message to send" [--wait]
// With --wait: blocks until user replies APPROVE, SKIP, or STOP via Telegram
//
// How it works:
//   1. Writes approval request to /tmp/claude_needs_approval.txt
//   2. Sends Telegram message via `openclaw message send`
//   3. With --wait: polls /tmp/claude_approval_response.txt every 10s
//   4. Returns: "APPROVED", "SKIPPED", or "STOPPED"

import { writeFileSync, readFileSync, existsSync, unlinkSync } from 'node:fs';
import { execSync } from 'node:child_process';

const APPROVAL_FILE = '/tmp/claude_needs_approval.txt';
const RESPONSE_FILE = '/tmp/claude_approval_response.txt';
const OPENCLAW_BIN = '/Users/wyattsmac/.npm-global/bin/openclaw';
const POLL_INTERVAL_MS = 15000; // 15 seconds
const MAX_WAIT_MS = 8 * 60 * 60 * 1000; // 8 hours max

const message = process.argv[2] || 'Claude needs your attention';
const shouldWait = process.argv.includes('--wait');
const taskContext = process.argv[3] || '';

function sendTelegramMessage(text) {
  try {
    execSync(`${OPENCLAW_BIN} message send --channel telegram --message ${JSON.stringify(text)}`, {
      stdio: 'pipe',
      timeout: 15000,
    });
    console.log('[approval-bridge] Telegram notification sent');
    return true;
  } catch (err) {
    console.log('[approval-bridge] Telegram send failed (OpenClaw may not be running):', err.message?.slice(0, 100));
    return false;
  }
}

async function main() {
  const timestamp = new Date().toLocaleString();
  
  // Write the approval request
  const requestContent = `PENDING\n${timestamp}\n${message}\n${taskContext}`;
  writeFileSync(APPROVAL_FILE, requestContent);
  
  // Clear any stale response
  if (existsSync(RESPONSE_FILE)) unlinkSync(RESPONSE_FILE);
  
  // Build Telegram notification
  const telegramMsg = [
    '🤖 Claude needs input:',
    '',
    message,
    taskContext ? `\nContext: ${taskContext}` : '',
    '',
    'Reply with:',
    '✅ APPROVE — continue this task',
    '⏭️ SKIP — skip this task, continue with others',
    '🛑 STOP — pause all overnight tasks',
    '',
    `To approve all remaining tasks: reply APPROVE ALL`,
  ].join('\n');
  
  const sent = sendTelegramMessage(telegramMsg);
  if (!sent) {
    console.log('[approval-bridge] Could not send Telegram — writing to file only');
    console.log('[approval-bridge] Approval request saved to:', APPROVAL_FILE);
  }
  
  if (!shouldWait) {
    console.log('NOTIFIED');
    process.exit(0);
  }
  
  // Poll for response
  console.log('[approval-bridge] Waiting for response...');
  const deadline = Date.now() + MAX_WAIT_MS;
  
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
    
    if (existsSync(RESPONSE_FILE)) {
      const response = readFileSync(RESPONSE_FILE, 'utf8').trim().toUpperCase();
      console.log('[approval-bridge] Got response:', response);
      
      if (existsSync(APPROVAL_FILE)) unlinkSync(APPROVAL_FILE);
      if (existsSync(RESPONSE_FILE)) unlinkSync(RESPONSE_FILE);
      
      if (response.includes('APPROVE')) {
        sendTelegramMessage('✅ Approved — continuing task');
        console.log('APPROVED');
        process.exit(0);
      } else if (response.includes('SKIP')) {
        sendTelegramMessage('⏭️ Skipped — moving to next task');
        console.log('SKIPPED');
        process.exit(1);
      } else if (response.includes('STOP')) {
        sendTelegramMessage('🛑 Stopped — all overnight tasks paused');
        console.log('STOPPED');
        process.exit(2);
      }
    }
  }
  
  // Timeout — default to skip
  console.log('[approval-bridge] Timed out waiting for response — defaulting to SKIPPED');
  sendTelegramMessage('⏰ No response in 8 hours — task was skipped. Check results in the morning.');
  console.log('SKIPPED');
  process.exit(1);
}

main().catch(err => {
  console.error('[approval-bridge] Error:', err.message);
  process.exit(1);
});
