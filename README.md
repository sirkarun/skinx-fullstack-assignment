# SkinX Fullstack Assignment

Fullstack web app for the SkinX assignment: login, browse posts, view post detail (rendering safe HTML), and filter by tag.

> **TL;DR — one command to run everything:**
> ```powershell
> docker-compose up --build
> ```
> Then open <http://localhost:3000> and log in with `admin@skinx.local` / `Password123!`.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | **Node.js + Express + TypeScript** | Matches the JD which names Express explicitly. |
| ORM / DB | **Prisma + PostgreSQL** | Type-safe queries, generated migrations, easy seed. |
| Auth | **JWT + bcrypt** | Stateless, standard. Rate-limited on `/login`. |
| Validation | **Zod** | Same schema for runtime + types. |
| Testing | **Jest + Supertest** | Unit (DTO / middleware) + integration (HTTP). |
| Frontend | **Next.js 14 (App Router) + TypeScript** | SSR-ready, file-based routing, React 18. |
| UI | **TailwindCSS** | Fast iteration, small bundle. |
| Data fetching | **TanStack Query** | Caching, retries, pagination UX. |
| HTML safety | **DOMPurify (isomorphic)** | Sanitizes post HTML — XSS protection. |
| Packaging | **Docker + docker-compose** | One-command setup for the reviewer. |

## Project Structure

```
skinx/
├── docker-compose.yml             # postgres + backend + frontend
├── posts.json                     # Source data (seeded into DB)
├── backend/
│   ├── Dockerfile                 # multi-stage (builder + runner)
│   ├── docker-entrypoint.sh       # runs migrate + seed before server
│   ├── prisma/
│   │   ├── schema.prisma          # User / Post / Tag / PostTag
│   │   └── seed.ts                # imports ../posts.json
│   ├── src/
│   │   ├── app.ts                 # Express app factory
│   │   ├── server.ts              # bootstrap
│   │   ├── config/                # env, prisma, logger
│   │   ├── common/                # errors, middleware (auth, errorHandler)
│   │   └── modules/
│   │       ├── auth/              # dto + service + controller + routes
│   │       └── posts/             # dto + service + controller + routes
│   └── tests/                     # integration tests (Supertest)
└── frontend/
    ├── Dockerfile                 # multi-stage (Next.js standalone)
    └── src/
        ├── app/
        │   ├── login/page.tsx
        │   ├── posts/page.tsx
        │   └── posts/[id]/page.tsx
        ├── components/
        └── lib/                   # api client, auth context, sanitize
```

## Prerequisites

- **For the easy path:** Docker Desktop
- **For local dev:** Node.js 20+, Docker Desktop (for Postgres only)

---

## Option A: Run with Docker (recommended for review)

This builds and runs **everything** (Postgres + backend + frontend) with one command. The backend container automatically runs Prisma migrations + seeds `posts.json` before starting.

```powershell
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | <http://localhost:3000> |
| Backend  | <http://localhost:4000> |
| Postgres | localhost:5432 (user `skinx`, password `skinx_password`, db `skinx`) |

Default user (created by seed):
- email: `admin@skinx.local`
- password: `Password123!`

Stop everything (containers + network):
```powershell
docker-compose down
```

Remove the database volume too (fresh start):
```powershell
docker-compose down -v
```

Re-seed posts after the stack is running:
```powershell
docker-compose exec backend npm run seed
```

Watch logs:
```powershell
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## Option B: Run locally (dev mode, hot reload)

Use this if you want to edit code and see changes live.

### 1. Start Postgres only (via Docker)

```powershell
docker-compose up -d postgres
```

### 2. Backend

```powershell
cd backend
copy .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run seed
npm run dev                  # http://localhost:4000
```

### 3. Frontend (new terminal)

```powershell
cd frontend
copy .env.example .env.local
npm install
npm run dev                  # http://localhost:3000
```

---

## API Reference

Base URL: `http://localhost:4000/api`

| Method | Endpoint | Auth | Body / Query | Returns |
|---|---|---|---|---|
| `GET`  | `/health`             | -      | - | `{ status: 'ok' }` |
| `POST` | `/auth/register`      | -      | `{ email, password, displayName? }` | `{ token, user }` |
| `POST` | `/auth/login`         | -      | `{ email, password }` | `{ token, user }` |
| `GET`  | `/auth/me`            | Bearer | - | `{ user }` |
| `GET`  | `/posts`              | Bearer | `?page=&pageSize=&tag=a,b&search=` | `{ data, meta }` |
| `GET`  | `/posts/:id`          | Bearer | - | `Post` |
| `GET`  | `/posts/tags/all`     | Bearer | - | `{ data: TagSummary[] }` |

`POST /auth/login` is rate-limited (10 attempts / 15 minutes / IP).

## Testing

```powershell
cd backend
npm test
```

- **Unit tests** — `src/**/*.test.ts` (DTO parsing, JWT middleware). Run without a DB.
- **Integration test** — `tests/auth.integration.test.ts` (real HTTP roundtrip via Supertest). Skips itself gracefully if `DATABASE_URL` is unreachable.

To run integration tests against the Dockerized stack:
```powershell
docker-compose up -d postgres backend
cd backend
npm test
```

## Security Notes

- Passwords hashed with bcrypt (10 rounds)
- JWT signed with `JWT_SECRET` (must be ≥ 16 chars; validated at boot via Zod)
- Login endpoint rate-limited
- Helmet sets security headers; CORS restricted to `CORS_ORIGIN`
- Input validated with Zod on every endpoint
- HTML post content sanitized with DOMPurify before `dangerouslySetInnerHTML`
- Parameterized queries via Prisma (no string interpolation)
- Frontend container runs as non-root user (`nextjs:1001`)

## Performance Notes

- Pagination on `GET /posts` (default 10/page, max 50)
- Index on `posts(postedAt DESC)` and `post_tags(tagId)`
- TanStack Query caches list/detail with `keepPreviousData` for smooth paging
- Single `$transaction` to fetch `count + page` atomically
- Next.js `output: 'standalone'` → minimal production image (~150 MB)

## Design Decisions

- **Layered (controller / service / repository-via-Prisma)** — keeps HTTP concerns out of business logic and makes services unit-testable.
- **App factory (`buildApp`)** — same instance is used by `server.ts` and integration tests.
- **Zod DTOs** — one source of truth for runtime validation and TypeScript types.
- **Tag filter via `?tag=a,b`** — array params survive URLs cleanly and map directly into Prisma `in:`.
- **JWT in `localStorage`** — chosen for assignment simplicity; for production, prefer HttpOnly cookies + CSRF token.
- **Separate `tsconfig.build.json`** — IDE type-checks everything (including tests/seed) while production build emits only `src/`.

## Troubleshooting

**`docker-compose up` fails on first run with DB connection errors**
The backend container waits for Postgres via `depends_on: condition: service_healthy`, so this should be rare. If it happens, just re-run `docker-compose up`.

**Frontend says "Network Error" when calling backend**
Confirm <http://localhost:4000/health> returns `{"status":"ok"}` from your host browser. If you changed the backend port, you must rebuild the frontend image because `NEXT_PUBLIC_API_BASE_URL` is baked at build time:
```powershell
docker-compose build --no-cache frontend
```

**Want to inspect the database**
```powershell
docker-compose exec postgres psql -U skinx -d skinx
```
Or use Prisma Studio: `cd backend && npm run prisma:studio`.

**Port already in use (3000/4000/5432)**
Stop whatever else is using the port, or edit the `ports:` mappings in `docker-compose.yml`.
