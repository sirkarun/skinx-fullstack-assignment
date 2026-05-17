import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { requireAuth } from './auth';
import { UnauthorizedError } from '../errors';
import { env } from '../../config/env';

const SECRET = env.JWT_SECRET;

function buildReq(headers: Record<string, string | undefined> = {}): Request {
  return { headers } as unknown as Request;
}

describe('requireAuth middleware', () => {
  it('rejects requests without an Authorization header', () => {
    const next = jest.fn() as unknown as NextFunction;
    requireAuth(buildReq(), {} as Response, next);
    const err = (next as unknown as jest.Mock).mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
  });

  it('rejects malformed tokens', () => {
    const next = jest.fn() as unknown as NextFunction;
    requireAuth(buildReq({ authorization: 'Bearer not-a-real-jwt' }), {} as Response, next);
    const err = (next as unknown as jest.Mock).mock.calls[0][0];
    expect(err).toBeInstanceOf(UnauthorizedError);
  });

  it('accepts a valid token and attaches user to req', () => {
    const token = jwt.sign({ sub: 'user-1', email: 'a@b.c' }, SECRET, { expiresIn: '1h' });
    const req = buildReq({ authorization: `Bearer ${token}` });
    const next = jest.fn() as unknown as NextFunction;
    requireAuth(req, {} as Response, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.user).toEqual({ sub: 'user-1', email: 'a@b.c' });
  });
});
