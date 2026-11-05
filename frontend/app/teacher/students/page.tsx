'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { User, Submission } from '@/types';
import { formatDate } from '@/lib/utils';
import { Search, GraduationCap, Award, BookOpen } from 'lucide-react';

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [uList, sList] = await Promise.all([
          api.users.list('student'),
          api.submissions.listForPractical('prac-1'),
        ]);
        setStudents(uList);
        setSubmissions(sList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = students.filter(
    (s) =>
      s.full_name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.student_id && s.student_id.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Enrolled Students Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Student rosters across your assigned laboratory sections.
          </p>
        </div>

        <div className="max-w-md">
          <Input
            placeholder="Search student by name, email, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {loading ? (
          <CardSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((student) => (
              <Card key={student.id} className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                    {student.avatar_url ? (
                      <img src={student.avatar_url} alt={student.full_name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      student.full_name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{student.full_name}</h4>
                    <p className="text-xs text-slate-500">{student.email}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1 text-slate-500">
                  <p>Student ID: <strong className="text-slate-700 dark:text-slate-300 font-mono">{student.student_id || 'N/A'}</strong></p>
                  <p>Department: <span className="text-slate-700 dark:text-slate-300">{student.department}</span></p>
                  <p>Enrolled Courses: <strong className="text-indigo-500">{student.enrolled_course_ids.length} Courses</strong></p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
