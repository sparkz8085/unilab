'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { Course } from '@/types';
import { BookOpen, Users, FlaskConical, ArrowRight } from 'lucide-react';

export default function CoursesPage() {
  const { user } = useAuth();
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Laboratory Courses
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Curriculum practical courses and assigned laboratory sections.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : courses.length === 0 ? (
          <Card className="p-8 text-center text-slate-500 text-xs">
            No courses found.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="flex flex-col justify-between p-6 space-y-4 hover:border-indigo-500/40 transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" size="md">
                      {course.code}
                    </Badge>
                    <span className="text-[11px] font-mono text-slate-500">
                      {course.department}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 group-hover:text-indigo-500 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {course.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3 text-slate-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {course.student_count || 0} Students
                    </span>
                    <span className="flex items-center gap-1">
                      <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
                      {course.practical_count || 0} Labs
                    </span>
                  </div>
                  <Link
                    href={`/courses/${course.id}`}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>View Labs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
