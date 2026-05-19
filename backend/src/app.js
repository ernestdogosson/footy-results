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

  return app;
}
