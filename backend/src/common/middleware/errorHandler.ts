import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../errors';
import { logger } from '../../config/logger';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request payload',
        details: err.flatten(),
      },
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: {
        code: err.code ?? 'ERROR',
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
  }

  logger.error({ err }, 'Unhandled error');
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Internal Server Error' },
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
}
