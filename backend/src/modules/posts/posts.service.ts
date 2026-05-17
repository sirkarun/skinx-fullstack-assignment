import type { Prisma, PrismaClient } from '@prisma/client';
import { NotFoundError } from '../../common/errors';
import type { ListPostsQuery } from './posts.dto';

const postSelect = {
  id: true,
  title: true,
  content: true,
  postedAt: true,
  postedBy: true,
  tags: {
    select: {
      tag: { select: { name: true } },
    },
  },
} satisfies Prisma.PostSelect;

type PostRow = Prisma.PostGetPayload<{ select: typeof postSelect }>;

function toResponse(post: PostRow) {
  return {
    id: post.id,
    title: post.title,
    content: post.content,
    postedAt: post.postedAt.toISOString(),
    postedBy: post.postedBy,
    tags: post.tags.map((t) => t.tag.name),
  };
}

export class PostsService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(query: ListPostsQuery) {
    const { page, pageSize, tag, search } = query;

    const where: Prisma.PostWhereInput = {};
    if (tag?.length) {
      where.tags = { some: { tag: { name: { in: tag } } } };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { postedBy: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, posts] = await this.prisma.$transaction([
      this.prisma.post.count({ where }),
      this.prisma.post.findMany({
        where,
        orderBy: { postedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: postSelect,
      }),
    ]);

    return {
      data: posts.map(toResponse),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  async getById(id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: postSelect,
    });
    if (!post) throw new NotFoundError('Post not found');
    return toResponse(post);
  }

  async listTags() {
    const tags = await this.prisma.tag.findMany({
      orderBy: { name: 'asc' },
      select: {
        name: true,
        _count: { select: { posts: true } },
      },
    });
    return tags.map((t) => ({ name: t.name, postCount: t._count.posts }));
  }
}
