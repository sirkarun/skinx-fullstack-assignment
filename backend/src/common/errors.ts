export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad Request', details?: unknown) {
    super(400, message, 'BAD_REQUEST', details);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super(401, message, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden') {
    super(403, message, 'FORBIDDEN');
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not Found') {
    super(404, message, 'NOT_FOUND');
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Conflict') {
    super(409, message, 'CONFLICT');
  }
}
