import 'dotenv/config';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-test-secret-test';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://skinx:skinx_password@localhost:5432/skinx?schema=public';
