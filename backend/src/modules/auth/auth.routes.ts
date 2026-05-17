import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../../config/prisma';
import { requireAuth } from '../../common/middleware/auth';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: 'TOO_MANY_REQUESTS', message: 'Too many attempts, try again later' } },
});

export function buildAuthRouter() {
  const service = new AuthService(prisma);
  const controller = new AuthController(service);
  const router = Router();

  router.post('/register', controller.register);
  router.post('/login', loginLimiter, controller.login);
  router.get('/me', requireAuth, controller.me);

  return router;
}
