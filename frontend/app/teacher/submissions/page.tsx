'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { GradingStudioModal } from '@/components/teacher/GradingStudioModal';
import { Practical, Submission } from '@/types';
import { formatDate, formatDateTime, getStatusBadgeVariant } from '@/lib/utils';
import { CheckCircle2, Filter, Search } from 'lucide-react';

export default function TeacherSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [practicals, setPracticals] = useState<Practical[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [selectedPractical, setSelectedPractical] = useState<Practical | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const pList = await api.practicals.list();
      setPracticals(pList);

      const allSubs: Submission[] = [];
      for (const p of pList) {
        const subs = await api.submissions.listForPractical(p.id);
        allSubs.push(...subs);
      }
      setSubmissions(allSubs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openGrading = (sub: Submission) => {
    const prac = practicals.find((p) => p.id === sub.practical_id) || null;
    setSelectedSub(sub);
    setSelectedPractical(prac);
  };

  const filtered = submissions.filter((s) => {
    if (filterStatus === 'all') return true;
    return s.status === filterStatus;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Submission Review & Grading Studio
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Evaluate student code submissions against laboratory rubric criteria.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Submissions ({submissions.length})</option>
              <option value="submitted">Needs Review</option>
              <option value="reviewed">Graded / Reviewed</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
        </div>

        {loading ? (
          <CardSkeleton />
        ) : filtered.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-xs">
            No submissions found matching criteria.
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Assignment</th>
                  <th className="p-4">Language</th>
                  <th className="p-4">Version</th>
                  <th className="p-4">Submitted At</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Marks Awarded</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filtered.map((sub) => {
                  const statusBadge = getStatusBadgeVariant(sub.status);
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                        {sub.student?.full_name || 'Alex Chen'}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-mono">
                        {sub.practical_title}
                      </td>
                      <td className="p-4 font-mono uppercase text-[11px] text-indigo-500">
                        {sub.language}
                      </td>
                      <td className="p-4 font-mono text-slate-500">v{sub.version}</td>
                      <td className="p-4 text-slate-500">{formatDateTime(sub.submitted_at)}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {sub.marks_obtained !== null && sub.marks_obtained !== undefined ? `${sub.marks_obtained} pts` : '—'}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant={sub.status === 'reviewed' ? 'outline' : 'primary'}
                          size="sm"
                          onClick={() => openGrading(sub)}
                        >
                          {sub.status === 'reviewed' ? 'Edit Grade' : 'Open Grading Studio'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <GradingStudioModal
          isOpen={!!selectedSub}
          onClose={() => {
            setSelectedSub(null);
            setSelectedPractical(null);
          }}
          submission={selectedSub}
          practical={selectedPractical}
          onGradedSuccess={loadData}
        />
      </div>
    </AppLayout>
  );
}
