'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Course } from '@/types';
import { BookOpen, Users, FlaskConical, ArrowRight } from 'lucide-react';

export default function TeacherCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.courses
      .list()
      .then((data) => setCourses(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Assigned Teaching Courses
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Laboratory sections and curriculum modules assigned to your faculty profile.
          </p>
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
                    {course.student_count || 0} Students Enrolled
                  </span>
                  <Button variant="outline" size="sm" onClick={() => router.push(`/courses/${course.id}`)}>
                    Manage Labs
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
