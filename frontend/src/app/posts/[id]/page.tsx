'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import dayjs from 'dayjs';
import { api, extractApiError } from '@/lib/api';
import { sanitizePostHtml } from '@/lib/sanitize';
import type { Post } from '@/lib/types';
import { Spinner } from '@/components/Spinner';

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();

  const query = useQuery({
    queryKey: ['post', id],
    queryFn: async () => {
      const { data } = await api.get<Post>(`/posts/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });

  const safeHtml = useMemo(
    () => (query.data ? sanitizePostHtml(query.data.content) : ''),
    [query.data],
  );

  if (query.isLoading) return <Spinner label="Loading post..." />;
  if (query.isError) {
    return (
      <div className="space-y-3">
        <Link href="/posts" className="text-sm text-brand-600 hover:underline">
          ← Back to posts
        </Link>
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {extractApiError(query.error)}
        </p>
      </div>
    );
  }
  if (!query.data) return null;

  const post = query.data;

  return (
    <article className="space-y-4">
      <Link href="/posts" className="text-sm text-brand-600 hover:underline">
        ← Back to posts
      </Link>

      <header className="space-y-2 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-semibold text-slate-900">{post.title}</h1>
        <p className="text-sm text-slate-500">
          by <span className="font-medium">{post.postedBy}</span> ·{' '}
          {dayjs(post.postedAt).format('DD MMMM YYYY HH:mm')}
        </p>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {post.tags.map((t) => (
              <span key={t} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                #{t}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="prose-post" dangerouslySetInnerHTML={{ __html: safeHtml }} />
    </article>
  );
}
