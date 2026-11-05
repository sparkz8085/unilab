'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Skeleton';
import { Feedback, Submission } from '@/types';
import { formatDate, formatDateTime, getStatusBadgeVariant } from '@/lib/utils';
import { History, Award, CheckCircle2, MessageSquare, Eye, Code } from 'lucide-react';

export default function SubmissionHistoryPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Feedback modal
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    api.submissions
      .getMyHistory()
      .then((data) => setSubmissions(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const openFeedbackModal = async (sub: Submission) => {
    setSelectedSubmission(sub);
    setLoadingFeedback(true);
    try {
      const fb = await api.feedback.getBySubmission(sub.id);
      setFeedback(fb);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFeedback(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Submission History & Grade Records
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review your practical submissions, instructor feedback, and rubric score breakdowns.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        ) : submissions.length === 0 ? (
          <Card className="p-12 text-center text-slate-500 text-xs">
            <History className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No submissions recorded yet.</p>
            <p className="text-slate-500 mt-1">Submit your first practical assignment to view results here.</p>
          </Card>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Practical Assignment</th>
                  <th className="p-4">Course</th>
                  <th className="p-4">Language</th>
                  <th className="p-4">Version</th>
                  <th className="p-4">Submitted At</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Score</th>
                  <th className="p-4 text-right">Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {submissions.map((sub) => {
                  const statusBadge = getStatusBadgeVariant(sub.status);
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                        {sub.practical_title || 'Laboratory Practical'}
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-400 font-mono">
                        {sub.course_code || 'CS Lab'}
                      </td>
                      <td className="p-4 font-mono uppercase text-[11px] text-indigo-600 dark:text-indigo-400">
                        {sub.language}
                      </td>
                      <td className="p-4 text-slate-500 font-mono">v{sub.version}</td>
                      <td className="p-4 text-slate-500">{formatDateTime(sub.submitted_at)}</td>
                      <td className="p-4">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                        {sub.marks_obtained !== null && sub.marks_obtained !== undefined ? (
                          <span className="text-emerald-500">{sub.marks_obtained} pts</span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                          onClick={() => openFeedbackModal(sub)}
                        >
                          View Report
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Feedback & Submission Inspection Modal */}
        <Modal
          isOpen={!!selectedSubmission}
          onClose={() => {
            setSelectedSubmission(null);
            setFeedback(null);
          }}
          title={selectedSubmission?.practical_title || 'Practical Submission Report'}
          description={`Submitted version ${selectedSubmission?.version} on ${formatDateTime(selectedSubmission?.submitted_at)}`}
          maxWidth="3xl"
        >
          {selectedSubmission && (
            <div className="space-y-6 text-xs">
              {/* Score banner */}
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Faculty Evaluation
                  </p>
                  <p className="text-2xl font-extrabold text-emerald-500 font-mono mt-0.5">
                    {selectedSubmission.marks_obtained !== null ? `${selectedSubmission.marks_obtained} pts` : 'Pending Review'}
                  </p>
                </div>
                <Award className="w-8 h-8 text-emerald-400" />
              </div>

              {/* Rubric Breakdown */}
              {feedback && feedback.rubric_scores.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold uppercase tracking-wider text-slate-500 text-[11px]">
                    Rubric Points Breakdown
                  </h4>
                  <div className="space-y-2">
                    {feedback.rubric_scores.map((r, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {r.criteria}
                        </span>
                        <span className="font-mono font-bold text-indigo-500">
                          {r.score} / {r.max_points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructor Comments */}
              {feedback?.comments && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-1">
                  <p className="font-bold text-[11px] uppercase tracking-wider text-slate-500">
                    Instructor Comments
                  </p>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {feedback.comments}
                  </p>
                  {feedback.teacher && (
                    <p className="text-[11px] text-slate-400 pt-1">
                      — {feedback.teacher.full_name} ({formatDateTime(feedback.reviewed_at)})
                    </p>
                  )}
                </div>
              )}

              {/* Submitted Code Preview */}
              <div className="space-y-2">
                <p className="font-bold text-[11px] uppercase tracking-wider text-slate-500">
                  Submitted Code ({selectedSubmission.language.toUpperCase()})
                </p>
                <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs max-h-56 overflow-y-auto leading-relaxed border border-slate-800">
                  {selectedSubmission.code_content}
                </pre>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}
