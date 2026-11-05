'use client';

import React, { useState } from 'react';
import { Course, Practical, PracticalStatus, RubricCriterion } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/api';
import { Plus, Trash2, Code, Sparkles, Check } from 'lucide-react';

interface PracticalEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  initialPractical?: Practical | null;
  onSuccess?: () => void;
}

export function PracticalEditorModal({
  isOpen,
  onClose,
  courses,
  initialPractical,
  onSuccess,
}: PracticalEditorModalProps) {
  const { success, error } = useToast();

  const [courseId, setCourseId] = useState<string>(
    initialPractical?.course_id || courses[0]?.id || ''
  );
  const [labNumber, setLabNumber] = useState<number>(initialPractical?.lab_number || 1);
  const [title, setTitle] = useState<string>(initialPractical?.title || '');
  const [objective, setObjective] = useState<string>(initialPractical?.objective || '');
  const [instructionsMd, setInstructionsMd] = useState<string>(
    initialPractical?.instructions_md ||
      '### Objectives\n1. Implement core algorithm.\n2. Verify output with sample tests.\n\n### Input Format\n...'
  );
  const [pythonStarter, setPythonStarter] = useState<string>(
    initialPractical?.starter_code['python'] || '# Python starter template\ndef solve():\n    pass\n'
  );
  const [deadline, setDeadline] = useState<string>(
    initialPractical?.deadline
      ? new Date(initialPractical.deadline).toISOString().split('T')[0]
      : new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );
  const [maxMarks, setMaxMarks] = useState<number>(initialPractical?.max_marks || 100);
  const [rubrics, setRubrics] = useState<RubricCriterion[]>(
    initialPractical?.rubric || [
      { criteria: 'Algorithm Correctness', max_points: 60, description: 'Passes test cases' },
      { criteria: 'Code Cleanliness & Style', max_points: 40, description: 'Proper modular structure' },
    ]
  );
  const [status, setStatus] = useState<PracticalStatus>(
    initialPractical?.status || 'published'
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleAddRubric = () => {
    setRubrics([...rubrics, { criteria: 'New Evaluation Criterion', max_points: 20 }]);
  };

  const handleRemoveRubric = (index: number) => {
    setRubrics(rubrics.filter((_, i) => i !== index));
  };

  const handleRubricChange = (
    index: number,
    field: keyof RubricCriterion,
    val: string | number
  ) => {
    const updated = [...rubrics];
    updated[index] = { ...updated[index], [field]: val };
    setRubrics(updated);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      error('Title required', 'Please enter a practical title.');
      return;
    }
    if (!courseId) {
      error('Course required', 'Please select a course.');
      return;
    }

    setIsLoading(true);
    try {
      const payload: Partial<Practical> = {
        course_id: courseId,
        lab_number: Number(labNumber),
        title,
        objective,
        instructions_md: instructionsMd,
        starter_code: {
          python: pythonStarter,
          cpp: '// C++ starter template\n#include <iostream>\nusing namespace std;\nint main() { return 0; }',
        },
        supported_languages: ['python', 'cpp', 'c', 'java', 'javascript'],
        rubric: rubrics,
        deadline: new Date(deadline).toISOString(),
        max_marks: Number(maxMarks),
        status,
      };

      if (initialPractical) {
        await api.practicals.update(initialPractical.id, payload);
        success('Practical Updated', 'Laboratory assignment has been updated.');
      } else {
        await api.practicals.create(payload);
        success('Practical Created', 'Laboratory assignment has been published.');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      error('Save Failed', err instanceof Error ? err.message : 'Failed to save practical.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialPractical ? 'Edit Practical Assignment' : 'Create New Laboratory Practical'}
      description="Define instructions, code templates, rubrics, and deadlines for your students."
      maxWidth="3xl"
    >
      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Course
            </label>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-4">
            <Input
              label="Lab Number"
              type="number"
              min={1}
              value={labNumber}
              onChange={(e) => setLabNumber(Number(e.target.value))}
            />
          </div>
        </div>

        <Input
          label="Practical Title"
          placeholder="e.g. Red-Black Tree Balancing or Multi-Threaded Sync"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Input
          label="Objective / Summary"
          placeholder="Brief 1-line objective for students..."
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
        />

        <Textarea
          label="Markdown Instructions"
          placeholder="Write detailed lab steps, input/output specifications..."
          rows={5}
          value={instructionsMd}
          onChange={(e) => setInstructionsMd(e.target.value)}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Starter Code Template (Python)
          </label>
          <textarea
            value={pythonStarter}
            onChange={(e) => setPythonStarter(e.target.value)}
            rows={4}
            className="w-full font-mono text-xs p-3 rounded-lg border border-slate-300 dark:border-slate-800 bg-slate-950 text-slate-100 outline-none"
          />
        </div>

        {/* Rubrics Builder */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Evaluation Rubrics
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-3 h-3" />}
              onClick={handleAddRubric}
            >
              Add Criterion
            </Button>
          </div>

          {rubrics.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Criterion Name"
                value={r.criteria}
                onChange={(e) => handleRubricChange(i, 'criteria', e.target.value)}
                className="flex-1 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs"
              />
              <input
                type="number"
                placeholder="Max Pts"
                value={r.max_points}
                onChange={(e) => handleRubricChange(i, 'max_points', Number(e.target.value))}
                className="w-20 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 text-xs font-mono"
              />
              <button
                type="button"
                onClick={() => handleRemoveRubric(i)}
                className="text-rose-500 hover:text-rose-400 p-1.5"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Deadline, Max Marks & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Deadline Date"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <Input
            label="Total Max Marks"
            type="number"
            value={maxMarks}
            onChange={(e) => setMaxMarks(Number(e.target.value))}
          />
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Publish Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as PracticalStatus)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 p-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="published">Published (Visible to Students)</option>
              <option value="draft">Draft (Private)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            isLoading={isLoading}
            leftIcon={<Check className="w-4 h-4" />}
          >
            {initialPractical ? 'Update Practical' : 'Publish Practical'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
