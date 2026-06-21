// app/dashboard/layout.tsx
'use client';

import Sidebar, { useSidebar } from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader } from '@/components/ui/Loader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { isCollapsed } = useSidebar();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <Loader fullScreen text="Chargement..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      <Sidebar />
      <main className="flex-1 transition-all duration-300 min-w-0">
        <div className="max-w-7xl mx-auto ">
          {children}
        </div>
      </main>
    </div>
  );
}