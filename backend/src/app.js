import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { store } from './store.js';
import { authMiddleware, requireAuth } from './auth.js';
import { getConsensus } from './consensus.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const defaultDistDir = path.resolve(here, '../../frontend/dist');

export function createApp({ distDir = defaultDistDir } = {}) {
  const app = express();

  app.use(express.json());
  app.use(authMiddleware());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/matches', async (_req, res) => {
    const matches = await store.listMatches();
    const enriched = await Promise.all(
      matches.map(async (match) => ({
        ...match,
        consensus: getConsensus(await store.listReportsFor(match.id)),
      }))
    );
    res.json(enriched);
  });

  app.get('/api/matches/:id', async (req, res) => {
    const match = await store.findMatch(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    const consensus = getConsensus(await store.listReportsFor(match.id));
    res.json({ ...match, consensus });
  });

  app.post('/api/matches', requireAuth(), async (req, res) => {
    const { home_team, away_team } = req.body;
    if (!home_team || !away_team) {
      return res.status(400).json({ error: 'home_team and away_team are required' });
    }
    const match = await store.addMatch({ home_team, away_team });
    res.status(201).json(match);
  });

  app.get('/api/profile', requireAuth(), (req, res) => {
    res.json(req.oidc.user);
  });

  app.post('/api/matches/:id/reports', requireAuth(), async (req, res) => {
    const match = await store.findMatch(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    const { home_score, away_score } = req.body;
    if (typeof home_score !== 'number' || typeof away_score !== 'number') {
      return res.status(400).json({ error: 'home_score and away_score are required' });
    }
    const report = await store.addReport(match.id, {
      home_score,
      away_score,
      sub: req.oidc.user.sub,
    });
    res.status(201).json(report);
  });

  // serve the built frontend when it's present (prod image);
  // skipped in dev/tests so /api 404s aren't masked by index.html
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  return app;
}
