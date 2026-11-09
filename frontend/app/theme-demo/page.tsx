'use client';

import React, { useState } from 'react';
import ThemeToggle from '@/components/theme-toggle/ThemeToggle';

type ThemePreference = 'light' | 'dark' | 'system';

export default function ThemeDemoPage() {
  const [preference, setPreference] = useState<ThemePreference>('system');
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-20 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <ThemeToggle position="top-right" idleTimeout={3000} idleOpacity={0.2} onThemeChange={(value: ThemePreference) => setPreference(value)} />
      <section className="mx-auto max-w-3xl space-y-6">
        <p className="text-xs font-bold uppercase tracking-[.25em] text-indigo-500">Component playground</p>
        <h1 className="text-4xl font-black tracking-tight">A calmer way to switch themes.</h1>
        <p className="max-w-xl text-slate-600 dark:text-slate-300">Try the floating control in the corner. It fades after a short pause, supports keyboard and touch, and remembers your preference.</p>
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">Current preference</p>
          <p className="mt-2 text-2xl font-bold capitalize">{preference}</p>
        </div>
      </section>
    </main>
  );
}
