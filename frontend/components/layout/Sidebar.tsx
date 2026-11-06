'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  FlaskConical,
  History,
  CheckSquare,
  Users,
  ShieldCheck,
  Calendar,
  Sparkles,
  BarChart3,
  GraduationCap,
  Award,
  Settings,
  FolderKanban,
  ClipboardList,
  Code2,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, isStudent, isTeacher, isAdmin } = useAuth();

  const studentLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/student', label: 'Student Workspace', icon: Code2 },
    { href: '/courses', label: 'My Courses', icon: BookOpen },
    { href: '/practicals', label: 'Practical Labs', icon: FlaskConical },
    { href: '/history', label: 'Submission History', icon: History },
    { href: '/feedback', label: 'Grades & Feedback', icon: Award },
    { href: '/profile', label: 'Profile & Settings', icon: Settings },
  ];

  const teacherLinks = [
    { href: '/teacher/dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
    { href: '/teacher/courses', label: 'Assigned Courses', icon: BookOpen },
    { href: '/teacher/practicals', label: 'Practical Management', icon: FlaskConical },
    { href: '/teacher/submissions', label: 'Submission Review', icon: CheckSquare },
    { href: '/teacher/students', label: 'Student Overview', icon: Users },
  ];

  const adminLinks = [
    { href: '/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
    { href: '/admin/students', label: 'Student Management', icon: GraduationCap },
    { href: '/admin/teachers', label: 'Faculty Management', icon: Users },
    { href: '/admin/courses', label: 'Course Management', icon: BookOpen },
    { href: '/admin/practicals', label: 'Practical Inventory', icon: FlaskConical },
    { href: '/admin/analytics', label: 'Platform Analytics', icon: BarChart3 },
  ];

  const links = isAdmin ? adminLinks : isTeacher ? teacherLinks : studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 shrink-0 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl p-4 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="space-y-6">
          {/* User role header pill */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
            <p className="text-[11px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
              {isAdmin ? 'University Admin' : isTeacher ? 'Faculty Portal' : 'Student Laboratory'}
            </p>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {user?.department || 'Department of Computer Science'}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400')} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Future UniLab OS preview teaser banner */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-900/20 via-purple-900/20 to-slate-900/40 border border-indigo-500/20 text-xs">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>UniLab Engine</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            AI Automated grading & offline sync hooks integrated in background.
          </p>
        </div>
      </aside>
    </>
  );
}
