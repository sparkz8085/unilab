'use client';

import React, { useState, useEffect } from 'react';
import { Practical, Submission, Feedback } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea, Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/api';
import { formatDateTime, getStatusBadgeVariant } from '@/lib/utils';
import { Check, CheckCircle2, Code, Terminal, MessageSquare } from 'lucide-react';

interface GradingStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: Submission | null;
  practical: Practical | null;
  onGradedSuccess?: () => void;
}

export function GradingStudioModal({
  isOpen,
  onClose,
  submission,
  practical,
  onGradedSuccess,
}: GradingStudioModalProps) {
  const { success, error } = useToast();
  const [marks, setMarks] = useState<number>(submission?.marks_obtained || 0);
  const [comments, setComments] = useState<string>('');
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (submission) {
      setMarks(submission.marks_obtained || 0);
      // Fetch existing feedback if reviewed
      api.feedback.getBySubmission(submission.id).then((fb) => {
        if (fb) {
          setMarks(fb.marks);
          setComments(fb.comments);
          const scores: Record<string, number> = {};
          fb.rubric_scores.forEach((r) => {
            scores[r.criteria] = r.score;
          });
          setRubricScores(scores);
        } else if (practical) {
          // Initialize empty rubric scores
          const scores: Record<string, number> = {};
          practical.rubric.forEach((r) => {
            scores[r.criteria] = r.max_points;
          });
          setRubricScores(scores);
          setMarks(practical.max_marks);
        }
      });
    }
  }, [submission, practical]);

  const handleRubricScoreChange = (criteria: string, scoreVal: number) => {
    const updated = { ...rubricScores, [criteria]: scoreVal };
    setRubricScores(updated);
    // Auto-calculate sum
    const total = Object.values(updated).reduce((acc, curr) => acc + (curr || 0), 0);
    setMarks(Math.min(total, practical?.max_marks || 100));
  };

  const handleSaveGrade = async () => {
    if (!submission || !practical) return;

    if (marks < 0 || marks > practical.max_marks) {
      error('Invalid Marks', `Marks must be between 0 and ${practical.max_marks}`);
      return;
    }

    setIsLoading(true);
    try {
      const formattedScores = practical.rubric.map((r) => ({
        criteria: r.criteria,
        score: rubricScores[r.criteria] !== undefined ? rubricScores[r.criteria] : r.max_points,
        max_points: r.max_points,
      }));

      await api.feedback.submit({
        submission_id: submission.id,
        marks,
        rubric_scores: formattedScores,
        comments: comments || 'Practical reviewed and graded.',
        line_comments: [],
      });

      success('Graded Successfully', `Submission marked: ${marks}/${practical.max_marks} pts.`);
      if (onGradedSuccess) onGradedSuccess();
      onClose();
    } catch (err: unknown) {
      error('Grading Failed', err instanceof Error ? err.message : 'Failed to submit grade.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!submission || !practical) return null;

  const statusBadge = getStatusBadgeVariant(submission.status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Grading Studio — ${submission.student?.full_name || 'Student Submission'}`}
      description={`${practical.title} (${practical.course_code || 'Course'}) • Version ${submission.version}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Student metadata header */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
              {submission.student?.full_name?.charAt(0) || 'S'}
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                {submission.student?.full_name} ({submission.student?.student_id || 'ID N/A'})
              </p>
              <p className="text-slate-500">{submission.student?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${statusBadge.bg} ${statusBadge.text}`}>
              {statusBadge.label}
            </span>
            <span className="text-slate-500">
              Submitted: {formatDateTime(submission.submitted_at)}
            </span>
          </div>
        </div>

        {/* Code & Output Viewer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Code className="w-4 h-4 text-indigo-400" />
              <span>Student Code ({submission.language.toUpperCase()})</span>
            </div>
            <pre className="p-3.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs max-h-[300px] overflow-y-auto leading-relaxed border border-slate-800 selection:bg-indigo-600/40">
              {submission.code_content || '// No code submitted'}
            </pre>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Execution Output & Notes</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs max-h-[300px] overflow-y-auto leading-relaxed border border-slate-800 space-y-3">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Output Console:</p>
                <p className="whitespace-pre-wrap">{submission.output_text || 'No output recorded.'}</p>
              </div>
              {submission.student_notes && (
                <div className="pt-2 border-t border-slate-900">
                  <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Student Notes:</p>
                  <p className="text-slate-300 font-sans">{submission.student_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rubric Matrix & Feedback Form */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Rubric Evaluation & Scoring
          </h4>

          <div className="space-y-3">
            {practical.rubric.map((r, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {r.criteria}
                  </span>
                  {r.description && (
                    <p className="text-[11px] text-slate-500">{r.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min={0}
                    max={r.max_points}
                    step={1}
                    value={rubricScores[r.criteria] !== undefined ? rubricScores[r.criteria] : r.max_points}
                    onChange={(e) =>
                      handleRubricScoreChange(r.criteria, parseFloat(e.target.value) || 0)
                    }
                    className="w-16 text-center text-xs font-mono font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-1.5 text-indigo-600 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <span className="text-xs text-slate-500 font-mono">/ {r.max_points}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-2">
            <div className="sm:col-span-8">
              <Textarea
                label="Instructor Feedback & Critique"
                placeholder="Add constructive comments, line-specific notes, or advice for the student..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                rows={3}
              />
            </div>
            <div className="sm:col-span-4 flex flex-col justify-between p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/40 text-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                  Total Final Score
                </p>
                <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-1">
                  {marks} <span className="text-sm font-normal text-slate-500">/ {practical.max_marks}</span>
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                className="w-full mt-2"
                onClick={handleSaveGrade}
                isLoading={isLoading}
                leftIcon={<Check className="w-4 h-4" />}
              >
                Publish Grade
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
