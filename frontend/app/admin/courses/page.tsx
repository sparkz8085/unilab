'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { CourseModal } from '@/components/admin/CourseModal';
import { Course, User } from '@/types';
import { BookOpen, Plus, Users, FlaskConical } from 'lucide-react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculty, setFaculty] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cList, uList] = await Promise.all([
        api.courses.list(),
        api.users.list('teacher'),
      ]);
      setCourses(cList);
      setFaculty(uList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              University Course Management
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Curriculum practical courses and faculty allocations across departments.
            </p>
          </div>

          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
            Add New Course
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="p-6 space-y-4 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" size="md">{course.code}</Badge>
                    <span className="text-[11px] font-mono text-slate-500">{course.department}</span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{course.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">{course.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {course.student_count || 0} Students
                  </span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
                    {course.practical_count || 0} Labs
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        <CourseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          faculty={faculty}
          onSuccess={loadData}
        />
      </div>
    </AppLayout>
  );
}
