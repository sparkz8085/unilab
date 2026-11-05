'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Practical } from '@/types';
import { formatDate, getStatusBadgeVariant } from '@/lib/utils';
import { FlaskConical, Clock, ArrowRight, Code, Filter } from 'lucide-react';

export default function PracticalsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [practicals, setPracticals] = useState<Practical[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    api.practicals
      .list()
      .then((data) => setPracticals(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = practicals.filter((p) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'submitted') return p.student_submission_status === 'submitted' || p.student_submission_status === 'reviewed';
    if (statusFilter === 'pending') return !p.student_submission_status || p.student_submission_status === 'draft';
    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Practical Laboratories & Tasks
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Active laboratory coursework, programming assignments, and code execution milestones.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Practicals ({practicals.length})</option>
              <option value="pending">Pending Submission</option>
              <option value="submitted">Completed / Submitted</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-xs">
            No practicals found matching the selected filter.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => {
              const statusBadge = getStatusBadgeVariant(p.student_submission_status || p.status);
              return (
                <Card
                  key={p.id}
                  className="flex flex-col justify-between p-6 space-y-4 hover:border-indigo-500/40 transition-all cursor-pointer group"
                  onClick={() => router.push(`/practicals/${p.id}`)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                        {p.course_code || 'Lab'} • Lab {p.lab_number}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${statusBadge.bg} ${statusBadge.text}`}>
                        {p.student_submission_status ? statusBadge.label : 'Not Started'}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-500 transition-colors">
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {p.objective}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {p.supported_languages.map((l) => (
                        <span key={l} className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Due: <strong>{formatDate(p.deadline)}</strong></span>
                    </div>
                    <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                      <span>Open Lab</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
