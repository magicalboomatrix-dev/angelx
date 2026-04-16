'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ensureAdminSession } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function routeBySession() {
      const token = await ensureAdminSession();
      if (cancelled) {
        return;
      }

      router.replace(token ? '/dashboard' : '/login');
    }

    routeBySession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}
