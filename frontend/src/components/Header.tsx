'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/posts" className="text-lg font-semibold text-brand-700">
          SkinX Posts
        </Link>
        {user && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-500">{user.displayName ?? user.email}</span>
            <button
              type="button"
              onClick={logout}
              className="rounded-md border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
