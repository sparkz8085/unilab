'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  FlaskConical,
  Code,
  CheckCircle2,
  Shield,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Users,
  Terminal,
  Cpu,
  Layers,
  Award,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user, login } = useAuth();

  const handleQuickLogin = async (email: string) => {
    try {
      await login(email, 'password123');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-indigo-500/30">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-white">UniLab</span>
              <span className="text-[10px] text-indigo-400 font-mono -mt-1 tracking-wider uppercase">
                Laboratory Management OS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => router.push('/dashboard')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/login')}
                  className="text-slate-300 hover:text-white"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/register')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Glow backdrop effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 text-indigo-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI-Assisted University Practical & Lab Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
            Digitize University Laboratories.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Replace Paper Workflows.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            UniLab modernizes practical education with digital instructions, interactive code workspaces, 
            instant execution output capture, rubric-based faculty grading, and university administration.
          </p>

          {/* Persona Demo Login Cards */}
          <div className="pt-8">
            <p className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-4">
              Explore 1-Click Interactive Role Demos
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
              {/* Student */}
              <div
                onClick={() => handleQuickLogin('alex@unilab.edu')}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-emerald-500/50 transition-all cursor-pointer group shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <Badge variant="success" size="sm">Student</Badge>
                </div>
                <h4 className="font-semibold text-sm text-white group-hover:text-emerald-400 transition-colors">
                  Alex Chen
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Access CS301 practicals, write code, run tests, and submit assignments.
                </p>
                <div className="mt-4 flex items-center text-xs font-semibold text-emerald-400 gap-1">
                  <span>Enter Student Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Teacher */}
              <div
                onClick={() => handleQuickLogin('teacher@unilab.edu')}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-indigo-500/50 transition-all cursor-pointer group shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Code className="w-4 h-4" />
                  </div>
                  <Badge variant="primary" size="sm">Faculty</Badge>
                </div>
                <h4 className="font-semibold text-sm text-white group-hover:text-indigo-400 transition-colors">
                  Dr. Eleanor Sterling
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Create practicals, review submissions, and evaluate code with rubric sliders.
                </p>
                <div className="mt-4 flex items-center text-xs font-semibold text-indigo-400 gap-1">
                  <span>Enter Faculty Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Admin */}
              <div
                onClick={() => handleQuickLogin('admin@unilab.edu')}
                className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900/90 hover:border-purple-500/50 transition-all cursor-pointer group shadow-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Shield className="w-4 h-4" />
                  </div>
                  <Badge variant="purple" size="sm">Admin</Badge>
                </div>
                <h4 className="font-semibold text-sm text-white group-hover:text-purple-400 transition-colors">
                  Prof. Arthur Vance
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Manage academic sessions, allocate faculty courses, and view system metrics.
                </p>
                <div className="mt-4 flex items-center text-xs font-semibold text-purple-400 gap-1">
                  <span>Enter Admin Console</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section className="py-20 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-400">
              Complete Laboratory Life Cycle
            </h2>
            <p className="text-2xl sm:text-3xl font-bold text-white">
              Engineered for Real University Requirements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Terminal className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Interactive Code & Console</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Multi-language starter templates (Python, C++, Java, JS), simulation run execution, and output capture with automatic versioning.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Rubric Evaluation Studio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Faculty grading studio with side-by-side code inspection, rubric points scoring, line comments, and instant student grade publishing.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold text-white">Future OS & AI Ready</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Architectural service boundaries prepared for offline-first local sync engines, AI automated code evaluation, and dedicated UniLab hardware.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <p>© 2026 UniLab Systems. Designed for University Laboratory & Practical Education.</p>
      </footer>
    </div>
  );
}
