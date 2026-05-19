'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Spinner } from '@/components/Spinner';
import { api, extractApiError } from '@/lib/api';
import type { Paginated, Post, TagSummary } from '@/lib/types';

const PAGE_SIZE = 10;

export default function PostsListPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [jumpPage, setJumpPage] = useState('1');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setJumpPage(String(page));
  }, [page]);

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
    if (search) obj.search = search;
    return obj;
  }, [page, search, selectedTags]);

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
      prev.includes(name) ? prev.filter((tag) => tag !== name) : [...prev, name],
    );
  }

  function clearTags() {
    setSelectedTags([]);
    setPage(1);
  }

  function clearFilters() {
    setSelectedTags([]);
    setSearchInput('');
    setSearch('');
    setPage(1);
  }

  function goToPage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!postsQuery.data) return;

    const parsedPage = Number(jumpPage);
    if (!Number.isFinite(parsedPage)) return;

    const nextPage = Math.min(postsQuery.data.meta.totalPages, Math.max(1, Math.trunc(parsedPage)));
    setPage(nextPage);
  }

  const totalPosts = postsQuery.data?.meta.total ?? 0;
  const totalPages = postsQuery.data?.meta.totalPages ?? 1;
  const hasFilters = selectedTags.length > 0 || searchInput.trim().length > 0;

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Search posts</span>
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by title or author"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-md bg-slate-100 px-3 py-2 text-slate-600">
              {postsQuery.isFetching ? 'Loading...' : `${totalPosts.toLocaleString()} posts`}
            </span>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-md border border-slate-300 px-3 py-2 text-slate-700 transition hover:border-brand-500 hover:text-brand-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Filter by tag
          </h2>
          {selectedTags.length > 0 && (
            <button
              type="button"
              onClick={clearTags}
              className="text-xs text-brand-600 hover:underline"
            >
              Clear tags ({selectedTags.length})
            </button>
          )}
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
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
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  active
                    ? 'border-brand-600 bg-brand-600 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-brand-500'
                }`}
              >
                {tag.name}
                <span className={`ml-1 text-xs ${active ? 'text-brand-50' : 'text-slate-400'}`}>
                  {tag.postCount.toLocaleString()}
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
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-500">
              <span>
                Showing page {postsQuery.data?.meta.page ?? page} of {totalPages}
              </span>
              {search && <span>Search: &quot;{search}&quot;</span>}
            </div>

            <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
              {postsQuery.data?.data.length === 0 && (
                <li className="p-8 text-center text-slate-500">No posts match this filter.</li>
              )}
              {postsQuery.data?.data.map((post) => (
                <li key={post.id} className="transition hover:bg-slate-50">
                  <Link
                    href={`/posts/${post.id}`}
                    className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
                  >
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-slate-900">
                        {post.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        by <span className="font-medium text-slate-700">{post.postedBy}</span> ·{' '}
                        {dayjs(post.postedAt).format('DD MMM YYYY HH:mm')}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 sm:max-w-xs sm:justify-end">
                      {post.tags.length > 0 ? (
                        post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600"
                          >
                            #{tag}
                          </span>
                        ))
                      ) : (
                        <span className="rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-400">
                          No tags
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>

            {postsQuery.data && (
              <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                  className="rounded-md border border-slate-300 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>

                <form onSubmit={goToPage} className="flex items-center justify-center gap-2 text-slate-500">
                  <span>Page</span>
                  <input
                    type="number"
                    min={1}
                    max={totalPages}
                    value={jumpPage}
                    onChange={(event) => setJumpPage(event.target.value)}
                    className="w-20 rounded-md border border-slate-300 px-2 py-2 text-center text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                  <span>of {totalPages}</span>
                  <button
                    type="submit"
                    className="rounded-md bg-slate-900 px-3 py-2 text-white transition hover:bg-slate-700"
                  >
                    Go
                  </button>
                </form>

                <button
                  type="button"
                  disabled={page >= postsQuery.data.meta.totalPages}
                  onClick={() => setPage((currentPage) => currentPage + 1)}
                  className="rounded-md border border-slate-300 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
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
