import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import { config } from './config/env.js';
import { mealsRouter } from './routes/meals.js';
import { targetsRouter } from './routes/dailyTargets.js';
import { summaryRouter } from './routes/summary.js';
import { errorHandler, notFound } from './middleware/errors.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] }));
  app.use(express.json({ limit: '64kb' }));
  if (config.env !== 'test') app.use(morgan('dev'));

  app.get('/api/health', (req, res) => {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    res.json({
      status: 'ok',
      db: states[mongoose.connection.readyState] ?? 'unknown',
      uptime: Math.round(process.uptime()),
    });
  });

  app.use('/api/meals', mealsRouter);
  app.use('/api/daily-targets', targetsRouter);
  app.use('/api/summary', summaryRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
