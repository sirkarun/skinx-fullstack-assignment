import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';

export default function PostsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-5xl px-6 py-6">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
