'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  GraduationCap,
  Users,
  Shield,
  Check,
  ArrowRight,
  FlaskConical,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

export default function SolutionsPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-indigo-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <FlaskConical className="w-5 h-5" />
            </div>
            <span className="font-bold text-base text-white">UniLab</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              Home
            </Button>
            <Button variant="primary" size="sm" onClick={() => router.push(user ? '/dashboard' : '/login')}>
              {user ? 'Open Dashboard' : 'Sign In'}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <Badge variant="primary" size="md">
          Tailored Institutional Solutions
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Built for Students, Faculty & Deans
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          UniLab solves the inefficiencies of university practical coursework with dedicated workflows for every persona.
        </p>
      </section>

      {/* Solutions Cards */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* For Students */}
          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">For Students</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No more handwriting manual code records. Access practical assignments, write solutions, run tests, and submit directly online.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive coding workspace</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Execution output logging</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant rubric grade report</span>
                </li>
              </ul>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={() => router.push(user ? '/dashboard' : '/login')}
            >
              {user ? 'Open Student Workspace' : 'Sign In to Continue'}
            </Button>
          </div>

          {/* For Teachers */}
          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">For Faculty & Instructors</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cut grading time by 80%. Review code submissions side-by-side with execution outputs and assign rubric points with single clicks.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Practical curriculum builder</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Side-by-side code review studio</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Rubric matrix auto-summing</span>
                </li>
              </ul>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="w-full mt-4"
              onClick={() => router.push(user ? '/dashboard' : '/login')}
            >
              {user ? 'Open Faculty Workspace' : 'Sign In to Continue'}
            </Button>
          </div>

          {/* For Admins */}
          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">For Academic Deans</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gain real-time visibility into departmental laboratory completion, student performance distribution, and faculty grading velocity.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>University user directory</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Course & session allocation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>Comprehensive audit statistics</span>
                </li>
              </ul>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={() => router.push(user ? '/dashboard' : '/login')}
            >
              {user ? 'Open Admin Workspace' : 'Sign In to Continue'}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <p>© 2026 UniLab Systems. Designed for University Laboratory Management.</p>
      </footer>
    </div>
  );
}
