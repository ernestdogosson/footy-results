import express from 'express';
import { store } from './store.js';
import { authMiddleware, requireAuth } from './auth.js';

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use(authMiddleware());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/matches', (_req, res) => {
    res.json(store.listMatches());
  });

  app.get('/matches/:id', (req, res) => {
    const match = store.findMatch(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    res.json(match);
  });

  app.post('/matches', requireAuth(), (req, res) => {
    const { home_team, away_team } = req.body;
    if (!home_team || !away_team) {
      return res.status(400).json({ error: 'home_team and away_team are required' });
    }
    const match = store.addMatch({ home_team, away_team });
    res.status(201).json(match);
  });

  return app;
}
