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

describe('GET /matches', () => {
  it('returns 200 and an array', async () => {
    const res = await fetch(`${baseURL}/matches`);
    expect(res.status).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });

  it('returns 404 for an unknown match id', async () => {
    const res = await fetch(`${baseURL}/matches/999999`);
    expect(res.status).toBe(404);
  });
});
