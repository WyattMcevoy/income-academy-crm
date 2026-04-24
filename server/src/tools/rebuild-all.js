#!/usr/bin/env node
// One-command rebuild of everything generated from course content.
// Run this after you edit any curriculum.md or add a new course.
//
// Usage:
//   node server/src/tools/rebuild-all.js
//
// Runs:
//   1. build-ghl-upload-helpers.js   → regenerates tools/ghl-upload-helpers/
//   2. build-claude-project-bundle.js → regenerates tools/claude-project-bundle/

import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const scripts = [
  { name: 'GHL Upload Helpers', path: join(__dirname, 'build-ghl-upload-helpers.js') },
  { name: 'Claude Project Bundle', path: join(__dirname, 'build-claude-project-bundle.js') },
];

async function run(script) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [script.path], { stdio: 'inherit' });
    proc.on('exit', code => {
      if (code === 0) resolve();
      else reject(new Error(`${script.name} exited with code ${code}`));
    });
  });
}

async function main() {
  console.log('🔄 Rebuilding all generated content');
  console.log();
  for (const script of scripts) {
    console.log(`── ${script.name} ──`);
    await run(script);
    console.log();
  }
  console.log('✓ All generated content is up to date.');
}

main().catch(err => {
  console.error('\n✗ Rebuild failed:', err.message);
  process.exit(1);
});
