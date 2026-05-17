import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { UnauthorizedError } from '../errors';

export type JwtPayload = {
  sub: string;
  email: string;
};

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload;
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    return next(new UnauthorizedError('Missing or malformed Authorization header'));
  }

  const token = header.slice(7).trim();
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = { sub: decoded.sub, email: decoded.email };
    return next();
  } catch {
    return next(new UnauthorizedError('Invalid or expired token'));
  }
}
