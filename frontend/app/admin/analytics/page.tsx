'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { SystemStats } from '@/types';
import {
  TrendingUp,
  Users,
  BookOpen,
  FlaskConical,
  Award,
  BarChart3,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin
      .getStats()
      .then((s) => setStats(s))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Platform Analytics & Lab Telemetry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time university laboratory metrics, submission velocity, and evaluation benchmarks.
          </p>
        </div>

        {loading || !stats ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="p-5 space-y-1">
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Enrolled Students</span>
                </p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  {stats.total_students}
                </p>
                <p className="text-[11px] text-emerald-500 font-semibold">+14% this semester</p>
              </Card>

              <Card className="p-5 space-y-1">
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                  <span>Active Courses</span>
                </p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  {stats.total_courses}
                </p>
                <p className="text-[11px] text-slate-400">100% capacity</p>
              </Card>

              <Card className="p-5 space-y-1">
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <FlaskConical className="w-3.5 h-3.5 text-amber-500" />
                  <span>Submissions Captured</span>
                </p>
                <p className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                  {stats.total_submissions}
                </p>
                <p className="text-[11px] text-indigo-500 font-semibold">{stats.submission_rate_percent}% submission rate</p>
              </Card>

              <Card className="p-5 space-y-1">
                <p className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Graded Practicals</span>
                </p>
                <p className="text-2xl font-extrabold text-emerald-500">
                  {stats.total_reviewed}
                </p>
                <p className="text-[11px] text-emerald-500 font-semibold">{stats.grading_rate_percent}% completion</p>
              </Card>
            </div>

            {/* Simulated Chart & Breakdown Panel */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-8">
                <Card className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-indigo-500" />
                      <span>Weekly Practical Submission Velocity</span>
                    </h3>
                    <Badge variant="primary" size="sm">Fall 2026</Badge>
                  </div>

                  {/* Visual simulated bar chart */}
                  <div className="pt-4 space-y-3">
                    {[
                      { week: 'Week 1: Foundations & Setup', count: 98, pct: 98 },
                      { week: 'Week 2: AVL Tree Balancing', count: 92, pct: 92 },
                      { week: 'Week 3: Dijkstra Algorithm', count: 86, pct: 86 },
                      { week: 'Week 4: POSIX Semaphores', count: 74, pct: 74 },
                      { week: 'Week 5: B+ Tree Range Indexing', count: 48, pct: 48 },
                    ].map((w, i) => (
                      <div key={i} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                          <span>{w.week}</span>
                          <span className="font-mono font-bold text-indigo-500">{w.count} submissions ({w.pct}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
                            style={{ width: `${w.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="md:col-span-4">
                <Card className="p-6 space-y-4">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>UniLab Performance Insights</span>
                  </h3>
                  <div className="space-y-3 text-xs text-slate-400">
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      <p className="font-semibold text-slate-900 dark:text-slate-200">99.4% Paperless Target</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Laboratory documentation converted entirely to digital records.</p>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      <p className="font-semibold text-slate-900 dark:text-slate-200">1.8 Day Turnaround</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Average time between student submission and instructor grade publication.</p>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                      <p className="font-semibold text-slate-900 dark:text-slate-200">Zero Lost Submissions</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Automated timestamping and version control active.</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
