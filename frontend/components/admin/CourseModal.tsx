'use client';

import React, { useState } from 'react';
import { User } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { api } from '@/lib/api';
import { Check } from 'lucide-react';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  faculty: User[];
  onSuccess?: () => void;
}

export function CourseModal({ isOpen, onClose, faculty, onSuccess }: CourseModalProps) {
  const { success, error } = useToast();
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!code.trim() || !title.trim()) {
      error('Fields required', 'Course code and title are required.');
      return;
    }

    setIsLoading(true);
    try {
      await api.courses.create({
        code: code.toUpperCase(),
        title,
        description,
        department,
        teacher_ids: selectedTeachers,
      });

      success('Course Created', `Course ${code.toUpperCase()} successfully initialized.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: unknown) {
      error('Creation Failed', err instanceof Error ? err.message : 'Failed to create course.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTeacher = (id: string) => {
    if (selectedTeachers.includes(id)) {
      setSelectedTeachers(selectedTeachers.filter((t) => t !== id));
    } else {
      setSelectedTeachers([...selectedTeachers, id]);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Laboratory Course"
      description="Register a curriculum practical course and assign course instructors."
      maxWidth="lg"
    >
      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Course Code"
            placeholder="e.g. CS401"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Input
            label="Department"
            placeholder="Computer Science & Engineering"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>

        <Input
          label="Course Title"
          placeholder="e.g. Advanced Operating Systems Lab"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <Textarea
          label="Course Syllabus / Description"
          placeholder="Detailed practical laboratory objectives..."
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Assign Course Faculty
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            {faculty.length === 0 ? (
              <p className="text-slate-500 text-xs p-2">No faculty members available.</p>
            ) : (
              faculty.map((f) => (
                <label
                  key={f.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-white dark:hover:bg-slate-900 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTeachers.includes(f.id)}
                    onChange={() => toggleTeacher(f.id)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {f.full_name}
                  </span>
                  <span className="text-slate-500 text-[11px]">({f.email})</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isLoading}
            leftIcon={<Check className="w-4 h-4" />}
          >
            Create Course
          </Button>
        </div>
      </div>
    </Modal>
  );
}
