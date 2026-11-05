'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Modal } from '@/components/ui/Modal';
import { Feedback, Submission } from '@/types';
import { formatDate, formatDateTime, getStatusBadgeVariant } from '@/lib/utils';
import { Award, CheckCircle2, MessageSquare, Eye, Award as AwardIcon } from 'lucide-react';

export default function FeedbackPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    api.submissions
      .getMyHistory()
      .then((data) => {
        // Show only graded or submitted work
        setSubmissions(data.filter((s) => s.status === 'reviewed' || s.marks_obtained !== undefined));
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const openFeedback = async (sub: Submission) => {
    setSelectedSub(sub);
    const fb = await api.feedback.getBySubmission(sub.id);
    setFeedback(fb);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Grades & Faculty Feedback
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Detailed evaluation breakdown, rubric criteria scores, and instructor commentary.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-2xl" />
            <Skeleton className="h-24 w-full rounded-2xl" />
          </div>
        ) : submissions.length === 0 ? (
          <Card className="p-12 text-center text-slate-500 text-xs">
            <AwardIcon className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No graded submissions yet.</p>
            <p className="text-slate-500 mt-1">When your instructors review your practicals, reports will appear here.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {submissions.map((sub) => (
              <Card key={sub.id} className="p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-indigo-500 font-semibold">{sub.course_code}</span>
                    <Badge variant="success" size="sm">Graded</Badge>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {sub.practical_title}
                  </h3>
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400">
                        Score Awarded
                      </p>
                      <p className="text-2xl font-extrabold text-emerald-500 font-mono mt-0.5">
                        {sub.marks_obtained} <span className="text-xs font-normal text-slate-500">/ {sub.max_marks || 100} pts</span>
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-emerald-400" />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Graded: {formatDate(sub.updated_at)}</span>
                  <Button variant="outline" size="sm" onClick={() => openFeedback(sub)} leftIcon={<Eye className="w-3.5 h-3.5" />}>
                    View Rubric
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal */}
        <Modal
          isOpen={!!selectedSub}
          onClose={() => {
            setSelectedSub(null);
            setFeedback(null);
          }}
          title={selectedSub?.practical_title || 'Rubric Evaluation Report'}
          description={`Score: ${selectedSub?.marks_obtained} / ${selectedSub?.max_marks || 100} pts`}
        >
          {feedback && (
            <div className="space-y-4 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">Rubric Points</h4>
                {feedback.rubric_scores.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <span className="font-medium text-slate-800 dark:text-slate-200">{r.criteria}</span>
                    <span className="font-mono font-bold text-indigo-500">{r.score} / {r.max_points} pts</span>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-1">
                <p className="font-bold text-[11px] uppercase text-slate-500">Instructor Comments</p>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{feedback.comments}</p>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}
