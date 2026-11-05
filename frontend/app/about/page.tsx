'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  FlaskConical,
  Sparkles,
  ArrowRight,
  Cpu,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
} from 'lucide-react';

export default function AboutPage() {
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
      <section className="pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-4">
        <Badge variant="primary" size="md">
          Mission & Vision
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Modernizing Higher Education Laboratory Workflows
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          UniLab is building the operating system for university STEM laboratories — starting with a digital practical submission and grading platform, evolving into an AI-assisted evaluation engine and dedicated student hardware.
        </p>
      </section>

      {/* Architecture Roadmap Section */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Future Architecture Roadmap</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                <Radio className="w-4 h-4" />
                <span>Offline-First Sync Engine</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Local-first database with automatic background conflict resolution and sync when network access is re-established in physical campus labs.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
                <Cpu className="w-4 h-4" />
                <span>AI Automated Code Evaluation</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated complexity analysis, test case boundary fuzzing, and code quality suggestions powered by Gemini API foundation models.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Skill Passport & Profiling</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Verified cryptographically signed laboratory credential badges and technical skill portfolios for engineering students.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <Globe className="w-4 h-4" />
                <span>UniLab Vision OS & Dedicated Device</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Zero-distraction dedicated laboratory student hardware with integrated emergency eSIM connectivity and laboratory hardware telemetry.
              </p>
            </div>
          </div>
        </div>

        <div className="text-center pt-4">
          <Button variant="primary" size="lg" onClick={() => router.push('/dashboard')}>
            Explore Interactive Demo
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <p>© 2026 UniLab Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}
