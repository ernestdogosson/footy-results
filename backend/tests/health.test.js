import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { once } from 'node:events';
import { createApp } from '../src/app.js';

let server;
let baseURL;

beforeAll(async () => {
  server = createApp().listen(0);
  await once(server, 'listening');
  baseURL = `http://localhost:${server.address().port}`;
});

afterAll(() => {
  server.close();
});

describe('GET /health', () => {
  it('returns 200 and status ok', async () => {
    const res = await fetch(`${baseURL}/health`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });
});
