'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { PracticalEditorModal } from '@/components/teacher/PracticalEditorModal';
import { Course, Practical } from '@/types';
import { formatDate } from '@/lib/utils';
import { FlaskConical, Plus, Edit2, Clock, CheckCircle2 } from 'lucide-react';

export default function TeacherPracticalsPage() {
  const router = useRouter();
  const [practicals, setPracticals] = useState<Practical[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPractical, setEditingPractical] = useState<Practical | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pList, cList] = await Promise.all([
        api.practicals.list(),
        api.courses.list(),
      ]);
      setPracticals(pList);
      setCourses(cList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (p: Practical) => {
    setEditingPractical(p);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setEditingPractical(null);
    setIsModalOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Practical Curriculum Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Create, configure, and publish laboratory coursework with automated rubrics and starter templates.
            </p>
          </div>

          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleNew}>
            New Practical Assignment
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {practicals.map((p) => (
              <Card key={p.id} className="p-6 space-y-4 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-indigo-500">
                      {p.course_code} • Lab {p.lab_number}
                    </span>
                    <Badge variant={p.status === 'published' ? 'success' : 'default'} size="sm">
                      {p.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{p.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{p.objective}</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Due: <strong>{formatDate(p.deadline)}</strong></span>
                    <span>Max: {p.max_marks} pts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleEdit(p)} leftIcon={<Edit2 className="w-3.5 h-3.5" />}>
                      Edit Guide
                    </Button>
                    <Button variant="subtle" size="sm" className="w-full" onClick={() => router.push(`/practicals/${p.id}`)}>
                      Preview Lab
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        <PracticalEditorModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          courses={courses}
          initialPractical={editingPractical}
          onSuccess={loadData}
        />
      </div>
    </AppLayout>
  );
}
