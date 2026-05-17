import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import * as fs from 'node:fs';
import * as path from 'node:path';
import 'dotenv/config';

const prisma = new PrismaClient();

type RawPost = {
  title: string;
  content: string;
  postedAt: string;
  postedBy: string;
  tags: string[];
};

async function seedDefaultUser() {
  const email = process.env.SEED_DEFAULT_USER_EMAIL ?? 'admin@skinx.local';
  const password = process.env.SEED_DEFAULT_USER_PASSWORD ?? 'Password123!';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      displayName: 'Default Admin',
    },
  });

  console.log(`Seeded user: ${user.email} (password: ${password})`);
}

async function seedPosts() {
  const candidates = [
    path.resolve(__dirname, '../../posts.json'),
    path.resolve(__dirname, '../posts.json'),
    path.resolve(process.cwd(), 'posts.json'),
    path.resolve(process.cwd(), '../posts.json'),
  ];
  const filePath = candidates.find((p) => fs.existsSync(p));
  if (!filePath) {
    throw new Error(`posts.json not found. Tried:\n${candidates.join('\n')}`);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const posts: RawPost[] = JSON.parse(raw);
  console.log(`Loaded ${posts.length} posts from ${filePath}`);

  await prisma.postTag.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();

  const uniqueTags = Array.from(new Set(posts.flatMap((p) => p.tags ?? [])));
  if (uniqueTags.length > 0) {
    await prisma.tag.createMany({
      data: uniqueTags.map((name) => ({ name })),
      skipDuplicates: true,
    });
  }
  const tags = await prisma.tag.findMany();
  const tagIdByName = new Map(tags.map((t) => [t.name, t.id]));

  for (const post of posts) {
    const created = await prisma.post.create({
      data: {
        title: post.title,
        content: post.content,
        postedAt: new Date(post.postedAt),
        postedBy: post.postedBy,
      },
    });

    if (post.tags?.length) {
      await prisma.postTag.createMany({
        data: post.tags
          .map((name) => tagIdByName.get(name))
          .filter((id): id is string => Boolean(id))
          .map((tagId) => ({ postId: created.id, tagId })),
        skipDuplicates: true,
      });
    }
  }

  console.log(`Seeded ${posts.length} posts and ${uniqueTags.length} tags`);
}

async function main() {
  await seedDefaultUser();
  await seedPosts();
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
