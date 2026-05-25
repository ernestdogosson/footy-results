import express from 'express';
import cors from 'cors';
import { store } from './store.js';
import { authMiddleware, requireAuth } from './auth.js';
import { getConsensus } from './consensus.js';

export function createApp() {
  const app = express();

  // only enable CORS when a frontend origin is configured (prod);
  // dev goes through Vite's proxy so requests are same-origin
  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl) {
    app.use(cors({ origin: frontendUrl, credentials: true }));
  }

  app.use(express.json());
  app.use(authMiddleware());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/matches', (_req, res) => {
    const matches = store.listMatches().map((match) => ({
      ...match,
      consensus: getConsensus(store.listReportsFor(match.id)),
    }));
    res.json(matches);
  });

  app.get('/api/matches/:id', (req, res) => {
    const match = store.findMatch(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    const consensus = getConsensus(store.listReportsFor(match.id));
    res.json({ ...match, consensus });
  });

  app.post('/api/matches', requireAuth(), (req, res) => {
    const { home_team, away_team } = req.body;
    if (!home_team || !away_team) {
      return res.status(400).json({ error: 'home_team and away_team are required' });
    }
    const match = store.addMatch({ home_team, away_team });
    res.status(201).json(match);
  });

  app.get('/api/profile', requireAuth(), (req, res) => {
    res.json(req.oidc.user);
  });

  app.post('/api/matches/:id/reports', requireAuth(), (req, res) => {
    const match = store.findMatch(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    const { home_score, away_score } = req.body;
    if (typeof home_score !== 'number' || typeof away_score !== 'number') {
      return res.status(400).json({ error: 'home_score and away_score are required' });
    }
    const report = store.addReport(match.id, {
      home_score,
      away_score,
      sub: req.oidc.user.sub,
    });
    res.status(201).json(report);
  });

  return app;
}
