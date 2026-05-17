import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env';
import { logger } from './config/logger';
import { errorHandler, notFoundHandler } from './common/middleware/errorHandler';
import { buildAuthRouter } from './modules/auth/auth.routes';
import { buildPostsRouter } from './modules/posts/posts.routes';

export function buildApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(pinoHttp({ logger }));

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', buildAuthRouter());
  app.use('/api/posts', buildPostsRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
