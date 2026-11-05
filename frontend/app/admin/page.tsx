'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { CourseModal } from '@/components/admin/CourseModal';
import { AcademicSession, Course, SystemStats, User } from '@/types';
import { formatDate } from '@/lib/utils';
import { Users, BookOpen, Calendar, Plus } from 'lucide-react';

type AdminTab = 'users' | 'courses' | 'sessions';

export default function AdminPage() {
  useAuth();

  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [uList, cList, sList, sysStats] = await Promise.all([
        api.users.list(),
        api.courses.list(),
        api.admin.listSessions(),
        api.admin.getStats(),
      ]);
      setUsers(uList);
      setCourses(cList);
      setSessions(sList);
      setStats(sysStats);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode; badge: number }[] = [
    { id: 'users', label: 'User Directory', icon: <Users className="w-3.5 h-3.5" />, badge: users.length },
    { id: 'courses', label: 'Course Allocations', icon: <BookOpen className="w-3.5 h-3.5" />, badge: courses.length },
    { id: 'sessions', label: 'Academic Sessions', icon: <Calendar className="w-3.5 h-3.5" />, badge: sessions.length },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              University Administration Console
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage student & faculty user credentials, laboratory courses, and academic sessions.
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCourseModalOpen(true)}
          >
            Create Course
          </Button>
        </div>

        {/* Top metrics summary */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4">
              <p className="text-xs text-slate-500">Total Students</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {stats.total_students}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-500">Faculty Members</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {stats.total_teachers}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-500">Submissions Processed</p>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {stats.total_submissions}
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-slate-500">Reviewed & Graded</p>
              <p className="text-xl font-bold text-indigo-500 mt-0.5">
                {stats.total_reviewed} ({stats.grading_rate_percent}%)
              </p>
            </Card>
          </div>
        )}

        {/* Tab Navigation */}
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as AdminTab)}
          className="w-full sm:w-auto"
        />

        {/* Tab Contents */}
        {activeTab === 'users' && (
          <UserManagementTable users={users} onRefresh={loadData} />
        )}

        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((c) => (
              <Card key={c.id} className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-500">{c.code}</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {c.student_count || 0} enrolled
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">{c.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2">{c.description}</p>
                <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
                  <span>Faculty: {c.teachers?.map((t) => t.full_name).join(', ') || 'Unassigned'}</span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="p-4">Academic Session Name</th>
                    <th className="p-4">Start Date</th>
                    <th className="p-4">End Date</th>
                    <th className="p-4">Current Term</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {sessions.map((s) => (
                    <tr key={s.id}>
                      <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">{s.name}</td>
                      <td className="p-4 text-slate-500">{formatDate(s.start_date)}</td>
                      <td className="p-4 text-slate-500">{formatDate(s.end_date)}</td>
                      <td className="p-4">
                        {s.is_current ? (
                          <span className="text-xs font-semibold text-emerald-500">Active Term</span>
                        ) : (
                          <span className="text-xs text-slate-500">Archived</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <CourseModal
          isOpen={isCourseModalOpen}
          onClose={() => setIsCourseModalOpen(false)}
          faculty={users.filter((u) => u.role === 'teacher')}
          onSuccess={loadData}
        />
      </div>
    </AppLayout>
  );
}
