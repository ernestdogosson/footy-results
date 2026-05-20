import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createApp } from '../src/app.js';
import { store } from '../src/store.js';

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

  it('returns 200 and the match for a known id', async () => {
    const match = store.addMatch({ home_team: 'Riverside', away_team: 'Hilltop' });
    const res = await fetch(`${baseURL}/matches/${match.id}`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe(match.id);
    expect(body.home_team).toBe('Riverside');
  });

  it('includes consensus: null when there are no reports', async () => {
    const match = store.addMatch({ home_team: 'Lakers', away_team: 'Foxes' });
    const res = await fetch(`${baseURL}/matches/${match.id}`);
    const body = await res.json();
    expect(body.consensus).toBeNull();
  });

  it('includes the agreed scoreline once enough reports match', async () => {
    const match = store.addMatch({ home_team: 'Wolves', away_team: 'Bears' });
    for (let i = 0; i < 3; i++) {
      store.addReport(match.id, { home_score: 2, away_score: 1, sub: `auth0|u${i}` });
    }
    const res = await fetch(`${baseURL}/matches/${match.id}`);
    const body = await res.json();
    expect(body.consensus).toEqual({ home_score: 2, away_score: 1 });
  });
});

describe('POST /matches', () => {
  it('returns 401 when not logged in', async () => {
    const res = await fetch(`${baseURL}/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ home_team: 'Oakwood', away_team: 'Station Rd' }),
    });
    expect(res.status).toBe(401);
  });

  it('returns 201 and the created match when logged in', async () => {
    const res = await fetch(`${baseURL}/matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-user': 'auth0|tester',
      },
      body: JSON.stringify({ home_team: 'Oakwood', away_team: 'Station Rd' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.home_team).toBe('Oakwood');
    expect(body.away_team).toBe('Station Rd');
    expect(typeof body.id).toBe('number');
  });
});

describe('POST /matches/:id/reports', () => {
  it('returns 401 when not logged in', async () => {
    const match = store.addMatch({ home_team: 'Eastside', away_team: 'Westside' });
    const res = await fetch(`${baseURL}/matches/${match.id}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ home_score: 2, away_score: 1 }),
    });
    expect(res.status).toBe(401);
  });

  it('returns 201 and the report when logged in', async () => {
    const match = store.addMatch({ home_team: 'Northtown', away_team: 'Southtown' });
    const res = await fetch(`${baseURL}/matches/${match.id}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-test-user': 'auth0|tester',
      },
      body: JSON.stringify({ home_score: 3, away_score: 2 }),
    });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.match_id).toBe(match.id);
    expect(body.home_score).toBe(3);
    expect(body.away_score).toBe(2);
    expect(body.sub).toBe('auth0|tester');
  });
});
