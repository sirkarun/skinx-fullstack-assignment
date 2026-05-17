'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { api, extractApiError } from '@/lib/api';
import type { Paginated, Post, TagSummary } from '@/lib/types';
import { Spinner } from '@/components/Spinner';

const PAGE_SIZE = 10;

export default function PostsListPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const tagsQuery = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data } = await api.get<{ data: TagSummary[] }>('/posts/tags/all');
      return data.data;
    },
  });

  const params = useMemo(() => {
    const obj: Record<string, string | number> = { page, pageSize: PAGE_SIZE };
    if (selectedTags.length) obj.tag = selectedTags.join(',');
    return obj;
  }, [page, selectedTags]);

  const postsQuery = useQuery({
    queryKey: ['posts', params],
    queryFn: async () => {
      const { data } = await api.get<Paginated<Post>>('/posts', { params });
      return data;
    },
    placeholderData: keepPreviousData,
  });

  function toggleTag(name: string) {
    setPage(1);
    setSelectedTags((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name],
    );
  }

  function clearTags() {
    setSelectedTags([]);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Filter by tag
          </h2>
          {selectedTags.length > 0 && (
            <button
              type="button"
              onClick={clearTags}
              className="text-xs text-brand-600 hover:underline"
            >
              Clear ({selectedTags.length})
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {tagsQuery.isLoading && <span className="text-sm text-slate-400">Loading tags...</span>}
          {tagsQuery.data?.length === 0 && (
            <span className="text-sm text-slate-400">No tags available</span>
          )}
          {tagsQuery.data?.map((tag) => {
            const active = selectedTags.includes(tag.name);
            return (
              <button
                key={tag.name}
                type="button"
                onClick={() => toggleTag(tag.name)}
                className={`rounded-full border px-3 py-1 text-sm transition ${
                  active
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-brand-500'
                }`}
              >
                {tag.name}
                <span className={`ml-1 text-xs ${active ? 'text-brand-50' : 'text-slate-400'}`}>
                  {tag.postCount}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        {postsQuery.isLoading ? (
          <Spinner label="Loading posts..." />
        ) : postsQuery.isError ? (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {extractApiError(postsQuery.error)}
          </p>
        ) : (
          <>
            <ul className="space-y-3">
              {postsQuery.data?.data.length === 0 && (
                <li className="rounded-md border border-dashed border-slate-300 p-6 text-center text-slate-500">
                  No posts match this filter.
                </li>
              )}
              {postsQuery.data?.data.map((post) => (
                <li
                  key={post.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-500"
                >
                  <Link href={`/posts/${post.id}`} className="block">
                    <h3 className="text-base font-semibold text-slate-900">{post.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      by <span className="font-medium">{post.postedBy}</span> ·{' '}
                      {dayjs(post.postedAt).format('DD MMM YYYY HH:mm')}
                    </p>
                    {post.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {post.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {postsQuery.data && postsQuery.data.meta.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between text-sm">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-md border border-slate-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-slate-500">
                  Page {postsQuery.data.meta.page} of {postsQuery.data.meta.totalPages}
                </span>
                <button
                  type="button"
                  disabled={page >= postsQuery.data.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-md border border-slate-300 px-3 py-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
