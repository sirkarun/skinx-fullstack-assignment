# SkinX Fullstack Assignment - สิ่งที่ต้องใช้

## สรุปโจทย์
ทำ Fullstack Web App ที่มีระบบ Login, แสดงรายการ Post, ดูรายละเอียด Post (render HTML), และ Filter by Tag
โดย seed ข้อมูลจาก `posts.json` ผ่าน Backend (Node.js + ORM) เข้า Database

---

## 0. สิ่งที่ JD เน้นเป็นพิเศษ (ใช้เป็นเข็มทิศเลือก Stack)

จาก JD ตำแหน่ง Fullstack ของ SkinX/Samawat Health มีคำที่ระบุชัดเจน ควรสะท้อนในงานส่ง:

| สิ่งที่ JD พูดถึง | สิ่งที่ต้องโชว์ใน assignment |
|---|---|
| Back-end APIs ด้วย **Node.js + Express.js** | ใช้ **Express.js** (ตรงตาม JD) แทน NestJS/Fastify |
| Front-end ด้วย **HTML, CSS, React** | ใช้ **React** (Next.js หรือ Vite + React ก็ได้) |
| **Code architecture, design patterns, maintainability** | แยก layer ชัดเจน (controller/service/repository), ใช้ DI, DTO |
| **Refactor for efficiency & scalability** | เขียน clean code, ไม่ over-engineer, มี comment เฉพาะที่จำเป็น |
| **Error handling, authentication, authorization** | Global error handler + JWT + role/permission check (ถ้ามี) |
| **Database design - SQL และ NoSQL** | เลือก SQL เป็นหลัก แต่ design schema ให้ดูเป็น relational, **อาจเสริม Redis** เป็น NoSQL cache เพื่อโชว์ความรู้ |
| **Unit และ Integration testing** | เขียน test ทั้ง 2 แบบ (Jest/Vitest + Supertest) - **สำคัญมาก ต้องมี** |
| **DevOps & automation** | Docker, docker-compose, GitHub Actions (CI) - เพิ่มแต้ม |
| **Code review, architectural decisions** | เขียน `ARCHITECTURE.md` สั้นๆ อธิบายเหตุผลที่เลือก stack/pattern |

---

## 1. Backend (Node.js)

### Framework / Runtime
- **Node.js** (LTS เช่น v20+)
- **TypeScript** (แนะนำ - ช่วยเรื่อง Code Quality)
- **Express.js** ← เลือกตัวนี้ เพราะ JD ระบุชัดเจน ("Node.js and a robust framework e.g., Express.js")
  - จัด structure แบบ layered architecture เอง (controllers / services / repositories)
  - ใช้ `express-async-errors` + custom `errorHandler` middleware

### Database
- **PostgreSQL** (แนะนำหลัก - SQL ตามที่ JD ระบุ + production-ready)
- **Redis** (ทางเลือกเสริม - โชว์ความรู้ NoSQL ตาม JD เช่น cache `GET /posts`, blocklist JWT)
- ทางเลือกอื่น: MySQL, SQLite (dev เร็ว), MongoDB

### ORM
เลือก 1 อย่าง:
- **Prisma** (แนะนำ - DX ดี, type-safe)
- TypeORM (เข้ากับ NestJS ได้ดี)
- Sequelize
- Drizzle ORM

### Authentication
- **JWT** (`jsonwebtoken`) สำหรับ stateless auth
- **bcrypt** / `argon2` สำหรับ hash password
- (ทางเลือก) Passport.js / NextAuth

### Library อื่นๆ ที่จำเป็น
- `dotenv` - จัดการ environment variables
- `zod` หรือ `class-validator` - validate input
- `cors` - เปิด CORS ให้ frontend
- `helmet` - security headers
- `express-rate-limit` - ป้องกัน brute force (Security)
- `pino` / `winston` - logging

### Features ที่ต้องทำ
- [ ] Seed script อ่าน `posts.json` แล้ว insert เข้า DB
- [ ] Data Model/Entity: `Post` (title, content, postedAt, postedBy, tags)
- [ ] Data Model/Entity: `User` (สำหรับ login)
- [ ] Data Model/Entity: `Tag` (relation many-to-many กับ Post)
- [ ] API: `POST /auth/login`
- [ ] API: `POST /auth/register` (ถ้าจำเป็น)
- [ ] API: `GET /posts` (รองรับ `?tag=xxx` filter, pagination)
- [ ] API: `GET /posts/:id` (รายละเอียด post)
- [ ] API: `GET /tags` (list tag ทั้งหมดสำหรับทำ filter UI)
- [ ] Middleware ตรวจสอบ JWT

---

## 2. Frontend (React)

### Framework
JD ระบุชัดว่า "modern JavaScript framework e.g., **React**" — เลือกได้ 2 ทาง:
- **Next.js 14+ (App Router)** (แนะนำ - SSR/SSG ช่วย Performance + SEO + built-in routing)
- **Vite + React** (เบา, เร็ว, เหมาะถ้าอยากโชว์การจัดการ routing/auth เอง)

### Library หลัก
- **TypeScript**
- **TailwindCSS** หรือ **shadcn/ui** / Material UI / Ant Design - สำหรับ UI
- **TanStack Query (React Query)** - data fetching + caching (Performance)
- **React Hook Form** + **Zod** - จัดการฟอร์ม login + validate
- **axios** หรือ `fetch`
- **DOMPurify** - sanitize HTML ก่อน render (Security! ป้องกัน XSS)
- **dayjs** หรือ `date-fns` - format วันที่

### Features ที่ต้องทำ
- [ ] หน้า Login (`/login`)
- [ ] หน้า Post List (`/posts`) - แสดง title, postedBy, postedAt, tags
- [ ] หน้า Post Detail (`/posts/[id]`) - render HTML content แบบปลอดภัย
- [ ] Component Filter by Tag (multi-select หรือ chip)
- [ ] Protected Route - redirect ไป `/login` ถ้ายังไม่ได้ login
- [ ] เก็บ JWT ใน HttpOnly cookie (ปลอดภัยกว่า localStorage)
- [ ] Loading / Error states
- [ ] Responsive design

---

## 3. Database

ต้องเตรียม:
- Schema สำหรับ `users`, `posts`, `tags`, `post_tags` (junction table)
- Migration files (จาก Prisma/TypeORM)
- Seed script

---

## 4. Project Structure (แนะนำ)

```
skinx/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/         # controller, service, dto
│   │   │   └── posts/
│   │   ├── common/           # middleware, guards, filters
│   │   ├── config/
│   │   ├── prisma/           # schema + migrations
│   │   └── main.ts
│   ├── prisma/schema.prisma
│   ├── seed.ts
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/              # Next.js App Router
│   │   ├── components/
│   │   ├── lib/              # api client, utils
│   │   ├── hooks/
│   │   └── types/
│   ├── package.json
│   └── .env.example
├── posts.json
├── docker-compose.yml        # ทางเลือก: รัน DB ผ่าน docker
└── README.md
```

---

## 5. Testing (JD เน้น - ต้องมีจริง)

JD บอกชัดว่า "Lead and participate in **unit and integration testing**"
ต้องเขียนทั้ง 2 แบบเพื่อให้ตรงเกณฑ์:

### Backend
- **Jest** หรือ **Vitest** - test runner
- **Supertest** - integration test ของ Express routes (เรียก API จริงๆ)
- **ts-jest** หรือ Vitest TS preset
- Test ที่ควรมี:
  - Unit: service layer (เช่น hash password, parse tag filter)
  - Integration: `POST /auth/login` (ผิด/ถูก), `GET /posts?tag=xxx`, auth guard
  - ใช้ in-memory DB หรือ test container สำหรับ test DB

### Frontend
- **Vitest** + **React Testing Library**
- Test ที่ควรมี: render Post List, filter by tag, protected route redirect

---

## 6. DevOps / Automation (JD เน้น)

JD พูดถึง "Contribute to implementation of **DevOps practices and automation**"
- **Docker** - มี Dockerfile ทั้ง backend + frontend
- **Docker Compose** - รัน DB + Redis + backend + frontend พร้อมกัน (ผู้ตรวจรัน `docker-compose up` ทีเดียวจบ)
- **GitHub Actions** - CI workflow: lint + test ทุก push (`.github/workflows/ci.yml`)
- **ESLint + Prettier** - code quality
- **Husky + lint-staged** - pre-commit hook (lint + format ก่อน commit)
- **Postman / Thunder Client collection** หรือ **Swagger/OpenAPI** - API doc แนบใน repo

---

## 7. เอกสาร (สำคัญมาก - ต้องส่งพร้อม project)

ใน `README.md` ต้องมี:
- [ ] Tech stack ที่ใช้
- [ ] วิธี install dependencies
- [ ] วิธี setup database (เช่น `docker-compose up`)
- [ ] วิธี run migration + seed
- [ ] วิธี start backend / frontend
- [ ] Environment variables ที่ต้องตั้ง (`.env.example`)
- [ ] Default user/password สำหรับทดสอบ login
- [ ] API documentation (endpoint + request/response)
- [ ] Architecture / Design decision สั้นๆ (เขียนแยก `ARCHITECTURE.md` ก็ดี - JD เน้น "architectural decisions")
- [ ] วิธี run tests (`npm test`)

---

## 8. Checklist ตาม "หลักเกณฑ์ที่ใช้ประเมิน"

### Code Quality
- ใช้ TypeScript, ESLint, Prettier
- ตั้งชื่อตัวแปร/ฟังก์ชันสื่อความหมาย
- แยก concern ชัดเจน (controller / service / repository)

### Project Structure
- แยก backend / frontend
- แบ่ง module ตาม feature
- Config / env แยกออกจาก code

### Design Pattern
- Repository Pattern (เข้าถึง DB ผ่าน repository)
- Dependency Injection (ถ้าใช้ NestJS ได้ฟรี)
- DTO Pattern (validate input/output)
- Middleware Pattern (auth, error handling)

### Security
- Hash password ด้วย bcrypt/argon2
- JWT มี expiration
- Sanitize HTML content ด้วย DOMPurify ก่อน render
- Validate input ทุก endpoint
- CORS whitelist เฉพาะ origin ที่ต้องการ
- ใช้ HttpOnly cookie แทน localStorage
- Rate limiting login endpoint
- ใช้ parameterized query (ORM ทำให้แล้ว)

### Performance
- Database indexing (`postedAt`, `tags`)
- Pagination ใน `GET /posts`
- React Query caching
- Next.js SSR/ISR
- Lazy load images / components
- Gzip / compression middleware

---

## 9. ขั้นตอนการทำงานแนะนำ

1. Setup repo + project structure + docker-compose สำหรับ DB
2. Backend: ตั้ง schema + migration + seed
3. Backend: ทำ Auth (register/login + JWT middleware)
4. Backend: ทำ Posts API + Tag filter + pagination
5. Frontend: ตั้ง Next.js + Tailwind + axios + React Query
6. Frontend: หน้า Login + เก็บ token
7. Frontend: หน้า Post List + Tag filter
8. Frontend: หน้า Post Detail + sanitize HTML
9. เขียน README + ทดสอบรอบสุดท้าย
10. Push GitHub / zip ส่ง
