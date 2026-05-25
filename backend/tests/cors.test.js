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

describe('CORS', () => {
  it('reflects the frontend origin and allows credentials', async () => {
    const res = await fetch(`${baseURL}/api/matches`, {
      headers: { Origin: 'https://frontend.example.com' },
    });
    expect(res.headers.get('access-control-allow-origin')).toBe('https://frontend.example.com');
    expect(res.headers.get('access-control-allow-credentials')).toBe('true');
  });
});
