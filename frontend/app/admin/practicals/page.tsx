'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Practical } from '@/types';
import { formatDate } from '@/lib/utils';
import { FlaskConical, Clock, Search, Filter } from 'lucide-react';

export default function AdminPracticalsPage() {
  const [practicals, setPracticals] = useState<Practical[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.practicals
      .list()
      .then((data) => setPracticals(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            University Practical Inventory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Global repository of practical lab assignments, instructions, and rubrics.
          </p>
        </div>

        {loading ? (
          <CardSkeleton />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Practical Title</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Lab #</th>
                  <th className="p-4">Supported Languages</th>
                  <th className="p-4">Deadline</th>
                  <th className="p-4">Max Marks</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {practicals.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                      {p.title}
                    </td>
                    <td className="p-4 font-mono text-indigo-500">{p.course_code}</td>
                    <td className="p-4 font-mono">Lab {p.lab_number}</td>
                    <td className="p-4 font-mono uppercase text-[11px] text-slate-500">
                      {p.supported_languages.join(', ')}
                    </td>
                    <td className="p-4 text-slate-500">{formatDate(p.deadline)}</td>
                    <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {p.max_marks} pts
                    </td>
                    <td className="p-4">
                      <Badge variant={p.status === 'published' ? 'success' : 'default'} size="sm">
                        {p.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
