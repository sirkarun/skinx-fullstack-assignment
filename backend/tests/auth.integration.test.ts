/**
 * Integration test for /api/auth.
 * Requires a running Postgres + applied migrations. Skipped when DATABASE_URL is unreachable.
 * Run with: docker-compose up -d && npm run prisma:migrate && npm test
 */
import request from 'supertest';
import { buildApp } from '../src/app';
import { prisma } from '../src/config/prisma';

const app = buildApp();
const testEmail = `tester+${Date.now()}@skinx.local`;
const testPassword = 'Password123!';

let dbAvailable = true;

beforeAll(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbAvailable = false;
    console.warn('Database not reachable; skipping integration tests.');
  }
});

afterAll(async () => {
  if (dbAvailable) {
    await prisma.user.deleteMany({ where: { email: testEmail } });
  }
  await prisma.$disconnect();
});

describe('POST /api/auth/register + /api/auth/login', () => {
  it('registers a new user and then logs in successfully', async () => {
    if (!dbAvailable) return;

    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword, displayName: 'Tester' });
    expect(registerRes.status).toBe(201);
    expect(registerRes.body.token).toBeDefined();
    expect(registerRes.body.user.email).toBe(testEmail);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
  });

  it('rejects bad credentials', async () => {
    if (!dbAvailable) return;
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('rejects unauthenticated /api/posts', async () => {
    if (!dbAvailable) return;
    const res = await request(app).get('/api/posts');
    expect(res.status).toBe(401);
  });
});
