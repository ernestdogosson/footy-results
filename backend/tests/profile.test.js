import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../src/app.js';

let server;
let baseURL;

beforeAll(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseURL = `http://localhost:${server.address().port}`;
});

afterAll(() => {
  server.close();
});

describe('GET /profile', () => {
  it('returns 401 when not logged in', async () => {
    const res = await fetch(`${baseURL}/api/profile`);
    expect(res.status).toBe(401);
  });

  it('returns 200 and the user when logged in', async () => {
    const res = await fetch(`${baseURL}/api/profile`, {
      headers: { 'x-test-user': 'auth0|tester' },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sub).toBe('auth0|tester');
  });
});
