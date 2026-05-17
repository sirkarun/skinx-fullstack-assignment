import { z } from 'zod';

const csv = (val: unknown) =>
  typeof val === 'string'
    ? val
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : val;

export const listPostsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  tag: z.preprocess(csv, z.array(z.string().min(1)).optional()),
  search: z.string().trim().min(1).max(200).optional(),
});

export type ListPostsQuery = z.infer<typeof listPostsSchema>;

export const postIdSchema = z.object({
  id: z.string().min(1),
});
