'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Skeleton } from '@/components/ui/Skeleton';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isStudent, isTeacher, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    const isAdminRoute = pathname.startsWith('/admin');
    const isFacultyRoute = pathname.startsWith('/teacher');
    const isStudentRoute = pathname === '/student' || pathname.startsWith('/student/');
    if (isAdminRoute && !isAdmin) router.replace(isTeacher ? '/teacher/dashboard' : '/dashboard');
    else if (isFacultyRoute && !isTeacher && !isAdmin) router.replace('/dashboard');
    else if (isStudentRoute && !isStudent) router.replace(isAdmin ? '/admin' : isTeacher ? '/teacher/dashboard' : '/dashboard');
  }, [isAdmin, isStudent, isTeacher, loading, pathname, router, user]);

  if (loading || !user || (pathname.startsWith('/admin') && !isAdmin) || (pathname.startsWith('/teacher') && !isTeacher && !isAdmin) || ((pathname === '/student' || pathname.startsWith('/student/')) && !isStudent)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 max-w-sm w-full">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 animate-pulse flex items-center justify-center text-white font-bold text-xl shadow-xl shadow-indigo-600/30">U</div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">{children}</main>
      </div>
    </div>
  );
}
