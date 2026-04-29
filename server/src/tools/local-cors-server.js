#!/usr/bin/env node
/**
 * Tiny localhost HTTP server that serves a single file with permissive CORS,
 * so a page on a different origin (e.g. app.gohighlevel.com) can fetch() it
 * for a drag-drop simulation.
 *
 * Usage: node local-cors-server.js /absolute/path/to/file [port]
 * The file is served at http://localhost:<port>/file
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const filePath = process.argv[2];
const port = parseInt(process.argv[3] || '8765', 10);

if (!filePath || !fs.existsSync(filePath)) {
  console.error('Usage: node local-cors-server.js /absolute/path/to/file [port]');
  process.exit(1);
}

const ext = path.extname(filePath).toLowerCase();
const mime = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
}[ext] || 'application/octet-stream';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.url === '/file') {
    res.setHeader('Content-Type', mime);
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('not found');
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`serving ${path.basename(filePath)} (${mime}) at http://127.0.0.1:${port}/file`);
});
