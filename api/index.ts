import express from 'express';
import { apiRouter } from '../server/routes.js';
import { initDatabase } from '../server/db.js';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Lazily ensure DB connection for serverless cold-starts
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await initDatabase();
      dbInitialized = true;
    } catch (e) {
      console.error('Vercel cold start DB connection error:', e);
    }
  }
  next();
});

app.use('/api', apiRouter);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Vercel Serverless Function',
    timestamp: new Date().toISOString(),
  });
});

export default app;
