'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Code,
  Terminal,
  CheckCircle2,
  Cpu,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  FlaskConical,
  BookOpen,
  Users,
  Award,
  Zap,
  Lock,
} from 'lucide-react';

export default function FeaturesPage() {
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

      {/* Hero Section */}
      <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center space-y-4">
        <Badge variant="primary" size="md">
          Platform Architecture & Capabilities
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Everything Required for Modern University Laboratories
        </h1>
        <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
          From paper manual replacement to interactive code execution sandbox and multi-criterion rubric grading studios.
        </p>
      </section>

      {/* Feature Grid */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Code className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Interactive Code Workspace</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-language starter codes (Python, C++, Java, JS), real-time simulated compilation runs, and terminal output capturing.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Faculty Grading Studio</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Side-by-side student code inspection with execution console logs, interactive rubric point sliders, line comments, and instant grade publishing.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Curriculum Management</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Organize academic sessions, multi-section course allocations, student rosters, and laboratory deadline policies.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink-600/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Submission Versioning</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Draft auto-saving, version history tracking, and student notes recording for comprehensive laboratory audit trails.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Role-Based Access Control</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strict permissions for Students, Teachers, and University Administrators, ready for External Examiners and Guardians.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">Future OS & Hardware Ready</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modular service boundaries prepared for offline-first sync engines, AI evaluation models, and dedicated UniLab student hardware.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="border-t border-slate-800 py-12 text-center text-xs text-slate-500 space-y-4">
        <Button variant="primary" size="md" onClick={() => router.push('/dashboard')}>
          Explore Live Interactive Prototype
        </Button>
        <p>© 2026 UniLab. University Practical & Laboratory Management System.</p>
      </footer>
    </div>
  );
}
