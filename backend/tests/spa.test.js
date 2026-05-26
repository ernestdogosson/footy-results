import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { once } from 'node:events';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../src/app.js';

// stands in for frontend/dist in prod: prove the catch-all serves index.html
// for client-side routes without swallowing real /api 404s.
let server;
let baseURL;
let distDir;
const indexHtml = '<!doctype html><title>pitchside-spa-test</title>';

beforeAll(async () => {
  distDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pss-dist-'));
  fs.writeFileSync(path.join(distDir, 'index.html'), indexHtml);
  fs.mkdirSync(path.join(distDir, 'assets'));
  fs.writeFileSync(path.join(distDir, 'assets', 'app.js'), 'console.log("ok")');

  server = createApp({ distDir }).listen(0);
  await once(server, 'listening');
  baseURL = `http://localhost:${server.address().port}`;
});

afterAll(() => {
  server.close();
  fs.rmSync(distDir, { recursive: true, force: true });
});

describe('SPA serving', () => {
  it('returns index.html for a client-side route', async () => {
    const res = await fetch(`${baseURL}/matches/abc-123`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toMatch(/text\/html/);
    expect(await res.text()).toBe(indexHtml);
  });

  it('serves static assets from dist', async () => {
    const res = await fetch(`${baseURL}/assets/app.js`);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('console.log("ok")');
  });

  it('does not mask /api 404s with index.html', async () => {
    const res = await fetch(`${baseURL}/api/matches/does-not-exist`);
    expect(res.status).toBe(404);
    expect(res.headers.get('content-type')).toMatch(/application\/json/);
  });
});
