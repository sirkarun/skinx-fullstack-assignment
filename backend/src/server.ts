import { buildApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/prisma';

async function bootstrap() {
  const app = buildApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`Backend listening on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}, shutting down...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Failed to start server');
  process.exit(1);
});
