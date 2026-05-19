import express from 'express';
import { store } from './store.js';

export function createApp() {
  const app = express();
  app.use(express.json());

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

  return app;
}
