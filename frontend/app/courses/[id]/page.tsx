'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';
import { PracticalEditorModal } from '@/components/teacher/PracticalEditorModal';
import { Course, Practical } from '@/types';
import { formatDate, getStatusBadgeVariant } from '@/lib/utils';
import { BookOpen, FlaskConical, Plus, ArrowLeft, ArrowRight, Clock, Users } from 'lucide-react';

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, isTeacher, isAdmin } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [practicals, setPracticals] = useState<Practical[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, pList] = await Promise.all([
        api.courses.getById(id),
        api.practicals.list(id),
      ]);
      setCourse(c);
      setPracticals(pList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/courses')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="-ml-2 text-slate-500"
        >
          Back to Courses
        </Button>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
        ) : course ? (
          <>
            {/* Header banner */}
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Badge variant="primary" size="md">
                    {course.code}
                  </Badge>
                  <span className="text-xs font-mono text-slate-500">{course.department}</span>
                </div>
                {(isTeacher || isAdmin) && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    onClick={() => setIsModalOpen(true)}
                  >
                    Add Practical
                  </Button>
                )}
              </div>

              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {course.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-3xl leading-relaxed">
                {course.description}
              </p>

              <div className="pt-2 flex items-center gap-4 text-xs text-slate-500">
                <span>{course.student_count || 0} Students Enrolled</span>
                <span>•</span>
                <span>{practicals.length} Laboratory Practicals</span>
              </div>
            </div>

            {/* Practicals List */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-indigo-500" />
                <span>Course Practicals & Assignments</span>
              </h3>

              {practicals.length === 0 ? (
                <Card className="p-8 text-center text-slate-500 text-xs">
                  No practicals have been assigned to this course yet.
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {practicals.map((p) => {
                    const statusBadge = getStatusBadgeVariant(p.student_submission_status || p.status);
                    return (
                      <Card
                        key={p.id}
                        className="p-5 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all cursor-pointer group"
                        onClick={() => router.push(`/practicals/${p.id}`)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                              Lab {p.lab_number}
                            </span>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${statusBadge.bg} ${statusBadge.text}`}>
                              {p.student_submission_status ? statusBadge.label : p.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-500 transition-colors">
                            {p.title}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2">{p.objective}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            Due: <strong>{formatDate(p.deadline)}</strong>
                          </span>
                          <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                            <span>Open Lab</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Practical Modal */}
            <PracticalEditorModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              courses={[course]}
              onSuccess={loadData}
            />
          </>
        ) : (
          <Card className="p-8 text-center text-slate-500 text-xs">
            Course not found.
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
