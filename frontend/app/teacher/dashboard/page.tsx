'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { GradingStudioModal } from '@/components/teacher/GradingStudioModal';
import { PracticalEditorModal } from '@/components/teacher/PracticalEditorModal';
import { Course, Practical, Submission } from '@/types';
import { formatDate, formatDateTime, getStatusBadgeVariant } from '@/lib/utils';
import {
  BookOpen,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Code,
  Users,
} from 'lucide-react';

export default function TeacherDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [practicals, setPracticals] = useState<Practical[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const [isPracticalModalOpen, setIsPracticalModalOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradingPractical, setGradingPractical] = useState<Practical | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cList, pList] = await Promise.all([
        api.courses.list(),
        api.practicals.list(),
      ]);
      setCourses(cList);
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

  const openGradingStudio = (sub: Submission) => {
    const prac = practicals.find((p) => p.id === sub.practical_id) || null;
    setGradingSubmission(sub);
    setGradingPractical(prac);
  };

  const pendingCount = submissions.filter((s) => s.status === 'submitted').length;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Faculty Studio & Practical Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
              Welcome back, {user?.full_name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Review student programming tasks, evaluate test outputs, and manage course laboratory rubrics.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsPracticalModalOpen(true)}
          >
            Create Practical
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Assigned Courses</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{courses.length}</p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Active Practicals</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{practicals.length}</p>
            </div>
          </Card>

          <Card className="p-5 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Pending Reviews</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{pendingCount}</p>
            </div>
          </Card>
        </div>

        {/* Pending Submissions Queue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-indigo-500" />
              <span>Student Submissions Review Queue</span>
            </h3>
            <span className="text-xs text-slate-500">{submissions.length} Total Submissions</span>
          </div>

          {loading ? (
            <CardSkeleton />
          ) : submissions.length === 0 ? (
            <Card className="p-8 text-center text-slate-500 text-xs">
              No submissions currently in queue.
            </Card>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Practical Assignment</th>
                    <th className="p-4">Language</th>
                    <th className="p-4">Submitted At</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Marks</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {submissions.map((sub) => {
                    const statusBadge = getStatusBadgeVariant(sub.status);
                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                          {sub.student?.full_name || 'Student'}
                        </td>
                        <td className="p-4 text-slate-600 dark:text-slate-300 font-mono">
                          {sub.practical_title}
                        </td>
                        <td className="p-4 font-mono uppercase text-[11px] text-indigo-500">
                          {sub.language}
                        </td>
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
                            onClick={() => openGradingStudio(sub)}
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
        </div>

        {/* Modals */}
        <PracticalEditorModal
          isOpen={isPracticalModalOpen}
          onClose={() => setIsPracticalModalOpen(false)}
          courses={courses}
          onSuccess={loadData}
        />

        <GradingStudioModal
          isOpen={!!gradingSubmission}
          onClose={() => {
            setGradingSubmission(null);
            setGradingPractical(null);
          }}
          submission={gradingSubmission}
          practical={gradingPractical}
          onGradedSuccess={loadData}
        />
      </div>
    </AppLayout>
  );
}
