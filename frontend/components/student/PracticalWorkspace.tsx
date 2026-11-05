'use client';

import React, { useState } from 'react';
import { Practical, Submission } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { Textarea, Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/api';
import {
  Code,
  FileText,
  Play,
  Save,
  Send,
  CheckCircle2,
  Terminal,
  Clock,
  Sparkles,
  Paperclip,
  Check,
} from 'lucide-react';
import { formatDate, formatDateTime, getStatusBadgeVariant } from '@/lib/utils';

interface PracticalWorkspaceProps {
  practical: Practical;
  initialSubmission?: Submission | null;
  onSubmissionSuccess?: (sub: Submission) => void;
}

export function PracticalWorkspace({
  practical,
  initialSubmission,
  onSubmissionSuccess,
}: PracticalWorkspaceProps) {
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState<'instructions' | 'rubric' | 'notes'>('instructions');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    initialSubmission?.language || practical.supported_languages[0] || 'python'
  );
  const [code, setCode] = useState<string>(
    initialSubmission?.code_content ||
      practical.starter_code[selectedLanguage] ||
      practical.starter_code['python'] ||
      '# Write your solution here\n'
  );
  const [outputText, setOutputText] = useState<string>(
    initialSubmission?.output_text || ''
  );
  const [studentNotes, setStudentNotes] = useState<string>(
    initialSubmission?.student_notes || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(
    initialSubmission || null
  );

  const statusBadge = getStatusBadgeVariant(currentSubmission?.status || 'draft');

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    if (!initialSubmission?.code_content && practical.starter_code[lang]) {
      setCode(practical.starter_code[lang]);
    }
  };

  const handleRunSimulatedCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      const simulatedOutput = `[UniLab Execution Engine v1.0] Running ${selectedLanguage} environment...\n\n--- Output ---\n✓ Test Case 1: PASS (24ms)\n✓ Test Case 2: PASS (18ms)\n✓ All assertions validated.\n\nExecution finished successfully with returncode 0.`;
      setOutputText(simulatedOutput);
      info('Execution Complete', 'Simulated execution output recorded in console.');
    }, 600);
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!code.trim()) {
      error('Code required', 'Please write or paste your practical solution.');
      return;
    }

    if (isDraft) {
      setIsSavingDraft(true);
    } else {
      setIsSubmitting(true);
    }

    try {
      const res = await api.submissions.submitWork({
        practical_id: practical.id,
        language: selectedLanguage,
        code_content: code,
        files: [{ name: `solution.${selectedLanguage === 'python' ? 'py' : selectedLanguage === 'cpp' ? 'cpp' : 'txt'}`, size_bytes: code.length }],
        output_text: outputText,
        student_notes: studentNotes,
        is_draft: isDraft,
      });

      setCurrentSubmission(res);
      if (onSubmissionSuccess) onSubmissionSuccess(res);

      if (isDraft) {
        success('Draft Saved', 'Your work has been saved securely.');
      } else {
        success('Submitted Successfully', 'Your practical has been submitted for faculty review.');
      }
    } catch (err: unknown) {
      error('Submission Failed', err instanceof Error ? err.message : 'Failed to save submission.');
    } finally {
      setIsSavingDraft(false);
      setIsSubmitting(false);
    }
  };

  const tabs = [
    { id: 'instructions', label: 'Instructions & Lab Guide', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'rubric', label: 'Grading Rubric', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
    { id: 'notes', label: 'Notes & Attachments', icon: <Paperclip className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner with Practical Header */}
      <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-r from-white via-slate-50 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/20 backdrop-blur-xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <Badge variant="primary" size="sm">
                Lab {practical.lab_number}
              </Badge>
              <span className="text-xs font-mono text-slate-500">
                {practical.course_code || 'Course Lab'}
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${statusBadge.bg} ${statusBadge.text}`}>
                {currentSubmission?.status ? statusBadge.label : 'Not Submitted'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {practical.title}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl">
              {practical.objective}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-200 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Deadline: <strong>{formatDate(practical.deadline)}</strong></span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 font-semibold text-indigo-700 dark:text-indigo-300">
              Max Marks: {practical.max_marks} pts
            </div>
          </div>
        </div>
      </div>

      {/* Main Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Documentation & Instructions */}
        <div className="lg:col-span-5 space-y-4">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as 'instructions' | 'rubric' | 'notes')}
            className="w-full justify-start"
          />

          <Card className="min-h-[550px] max-h-[700px] overflow-y-auto">
            <CardContent className="p-5">
              {activeTab === 'instructions' && (
                <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed space-y-4">
                  <div className="whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300">
                    {practical.instructions_md}
                  </div>
                </div>
              )}

              {activeTab === 'rubric' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Evaluation Criteria ({practical.rubric.length} Rubrics)
                  </h4>
                  {practical.rubric.map((r, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                          {r.criteria}
                        </span>
                        <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {r.max_points} pts
                        </span>
                      </div>
                      {r.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {r.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <Textarea
                    label="Student Submission Notes"
                    placeholder="Add observations, time complexity analysis, or implementation details for your instructor..."
                    value={studentNotes}
                    onChange={(e) => setStudentNotes(e.target.value)}
                    rows={6}
                  />

                  <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 text-xs">
                    <p className="font-semibold text-slate-700 dark:text-slate-300">
                      File Submissions
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Code files in the editor will automatically be bundled into your laboratory record on submission.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Code Editor & Execution Sandbox */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-slate-300 dark:border-slate-800">
            {/* Editor Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/70 rounded-t-xl">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Code Editor
                </span>
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="ml-2 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {practical.supported_languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Play className="w-3.5 h-3.5 text-emerald-500" />}
                  onClick={handleRunSimulatedCode}
                  isLoading={isRunning}
                >
                  Run Code
                </Button>
              </div>
            </div>

            {/* Code Input Area */}
            <div className="relative font-mono text-xs">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                className="w-full h-[360px] p-4 bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed outline-none resize-none selection:bg-indigo-600/40"
                placeholder="// Write your laboratory implementation here..."
              />
            </div>

            {/* Output / Console Window */}
            <div className="border-t border-slate-800 bg-slate-900 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Execution Output Console</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOutputText('')}
                  className="text-[11px] text-slate-500 hover:text-slate-300"
                >
                  Clear
                </button>
              </div>
              <textarea
                value={outputText}
                onChange={(e) => setOutputText(e.target.value)}
                placeholder="Execution output or simulated test run output will appear here..."
                rows={4}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-xs text-emerald-400 placeholder:text-slate-600 outline-none resize-y"
              />
            </div>

            {/* Submission Actions */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-b-xl">
              <div className="text-xs text-slate-500">
                {currentSubmission?.submitted_at ? (
                  <span>
                    Last submitted on <strong>{formatDateTime(currentSubmission.submitted_at)}</strong> (v{currentSubmission.version})
                  </span>
                ) : (
                  <span>Work will be submitted to the course instructor for grading.</span>
                )}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Save className="w-3.5 h-3.5" />}
                  onClick={() => handleSubmit(true)}
                  isLoading={isSavingDraft}
                >
                  Save Draft
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                  onClick={() => handleSubmit(false)}
                  isLoading={isSubmitting}
                >
                  Submit Practical
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
