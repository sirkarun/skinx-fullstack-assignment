import { Router } from 'express';
import { prisma } from '../../config/prisma';
import { requireAuth } from '../../common/middleware/auth';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';

export function buildPostsRouter() {
  const service = new PostsService(prisma);
  const controller = new PostsController(service);
  const router = Router();

  router.use(requireAuth);
  router.get('/', controller.list);
  router.get('/tags/all', controller.tags);
  router.get('/:id', controller.detail);

  return router;
}
