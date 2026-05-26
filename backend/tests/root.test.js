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

describe('GET /', () => {
  it('redirects to FRONTEND_URL when set', async () => {
    const res = await fetch(`${baseURL}/`, { redirect: 'manual' });
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe('https://frontend.example.com');
  });
});
