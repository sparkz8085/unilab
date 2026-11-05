'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Skeleton';
import { GradingStudioModal } from '@/components/teacher/GradingStudioModal';
import { PracticalEditorModal } from '@/components/teacher/PracticalEditorModal';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { CourseModal } from '@/components/admin/CourseModal';
import { Course, Practical, Submission, SystemStats, User } from '@/types';
import { formatDate, formatDateTime, getStatusBadgeVariant } from '@/lib/utils';
import {
  BookOpen,
  FlaskConical,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  ArrowRight,
  Users,
  Code,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isStudent, isTeacher, isAdmin } = useAuth();

  // State
  const [courses, setCourses] = useState<Course[]>([]);
  const [practicals, setPracticals] = useState<Practical[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [facultyUsers, setFacultyUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Modals
  const [isPracticalModalOpen, setIsPracticalModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradingPractical, setGradingPractical] = useState<Practical | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      if (isStudent) {
        const [cList, pList, sList] = await Promise.all([
          api.courses.list(),
          api.practicals.list(undefined, true),
          api.submissions.getMyHistory(),
        ]);
        setCourses(cList);
        setPracticals(pList);
        setSubmissions(sList);
      } else if (isTeacher) {
        const [cList, pList] = await Promise.all([
          api.courses.list(),
          api.practicals.list(),
        ]);
        setCourses(cList);
        setPracticals(pList);

        // Fetch submissions for active practicals
        if (pList.length > 0) {
          const submissionsByPractical = await Promise.all(
            pList.slice(0, 5).map((p) => api.submissions.listForPractical(p.id))
          );
          setSubmissions(submissionsByPractical.flat());
        } else {
          setSubmissions([]);
        }
      } else if (isAdmin) {
        const [sysStats, uList, cList] = await Promise.all([
          api.admin.getStats(),
          api.users.list(),
          api.courses.list(),
        ]);
        setStats(sysStats);
        setAllUsers(uList);
        setCourses(cList);
        setFacultyUsers(uList.filter((u) => u.role === 'teacher'));
      }
    } catch (err) {
      console.error('Failed loading dashboard data', err);
      setLoadError('We could not load the dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isStudent, isTeacher]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [loadData, user]);

  const openGradingStudio = (sub: Submission) => {
    const prac = practicals.find((p) => p.id === sub.practical_id) || null;
    setGradingSubmission(sub);
    setGradingPractical(prac);
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                {isAdmin ? 'University Administration' : isTeacher ? 'Faculty Portal' : 'Student Laboratory'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Welcome back, {user?.full_name}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAdmin
                ? 'Overview of platform health, active sessions, and faculty course allocations.'
                : isTeacher
                ? 'Manage laboratory practicals, review student submissions, and grade rubrics.'
                : 'Track your enrolled practicals, write code solutions, and check marks.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isTeacher && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsPracticalModalOpen(true)}
              >
                Create Practical
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setIsCourseModalOpen(true)}
              >
                Create Course
              </Button>
            )}
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : loadError ? (
          <Card className="p-8 text-center">
            <AlertCircle className="mx-auto mb-3 h-6 w-6 text-amber-500" aria-hidden="true" />
            <p className="text-sm text-slate-600 dark:text-slate-300">{loadError}</p>
            <Button className="mt-4" variant="outline" size="sm" onClick={loadData}>
              Try again
            </Button>
          </Card>
        ) : (
          <>
            {/* ================= STUDENT DASHBOARD ================= */}
            {isStudent && (
              <div className="space-y-8">
                {/* Stats row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Enrolled Courses</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{courses.length}</p>
                    </div>
                  </Card>

                  <Card className="p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Upcoming Practicals</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{practicals.length}</p>
                    </div>
                  </Card>

                  <Card className="p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Submissions Completed</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{submissions.length}</p>
                    </div>
                  </Card>
                </div>

                {/* Upcoming Practicals List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-indigo-500" />
                      <span>Laboratory Practicals & Tasks</span>
                    </h3>
                    <span className="text-xs text-slate-500">{practicals.length} Active Labs</span>
                  </div>

                  {practicals.length === 0 ? (
                    <Card className="p-8 text-center text-slate-500 text-xs">
                      No active practical assignments scheduled.
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {practicals.map((p) => {
                        const statusBadge = getStatusBadgeVariant(p.student_submission_status);
                        return (
                          <Card
                            key={p.id}
                            className="p-5 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 transition-all cursor-pointer group"
                            onClick={() => router.push(`/practicals/${p.id}`)}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                router.push(`/practicals/${p.id}`);
                              }
                            }}
                            role="button"
                            tabIndex={0}
                            aria-label={`Open ${p.title}`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
                                  {p.course_code} • Lab {p.lab_number}
                                </span>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${statusBadge.bg} ${statusBadge.text}`}>
                                  {p.student_submission_status ? statusBadge.label : 'Not Started'}
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
                                <span>Open Workspace</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Enrolled Courses Grid */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-500" />
                    <span>My Enrolled Courses</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {courses.map((c) => (
                      <Card key={c.id} className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="primary" size="sm">
                            {c.code}
                          </Badge>
                          <span className="text-xs text-slate-500 font-mono">
                            {c.practical_count || 0} Practicals
                          </span>
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          {c.title}
                        </h4>
                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                          {c.description}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= TEACHER DASHBOARD ================= */}
            {isTeacher && (
              <div className="space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Assigned Courses</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{courses.length}</p>
                    </div>
                  </Card>

                  <Card className="p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Active Practicals</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{practicals.length}</p>
                    </div>
                  </Card>

                  <Card className="p-5 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Submissions to Review</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {submissions.filter((s) => s.status === 'submitted').length}
                      </p>
                    </div>
                  </Card>
                </div>

                {/* Submissions Review Queue */}
                <div id="grading-queue" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                      <span>Student Submissions Review Queue</span>
                    </h3>
                    <span className="text-xs text-slate-500">{submissions.length} Total Submissions</span>
                  </div>

                  {submissions.length === 0 ? (
                    <Card className="p-8 text-center text-slate-500 text-xs">
                      No student submissions in queue.
                    </Card>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                          <tr>
                            <th className="p-4">Student</th>
                            <th className="p-4">Practical</th>
                            <th className="p-4">Language</th>
                            <th className="p-4">Submitted At</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Marks</th>
                            <th className="p-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                          {submissions.map((sub) => {
                            const statusBadge = getStatusBadgeVariant(sub.status);
                            return (
                              <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">
                                  {sub.student?.full_name || 'Student unavailable'}
                                </td>
                                <td className="p-4 text-slate-600 dark:text-slate-300 font-mono">
                                  {sub.practical_title || 'Practical unavailable'}
                                </td>
                                <td className="p-4 font-mono uppercase text-[11px] text-indigo-600 dark:text-indigo-400">
                                  {sub.language}
                                </td>
                                <td className="p-4 text-slate-500">
                                  {formatDateTime(sub.submitted_at)}
                                </td>
                                <td className="p-4">
                                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${statusBadge.bg} ${statusBadge.text}`}>
                                    {statusBadge.label}
                                  </span>
                                </td>
                                <td className="p-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                                  {sub.marks_obtained !== null && sub.marks_obtained !== undefined
                                    ? `${sub.marks_obtained} pts`
                                    : '—'}
                                </td>
                                <td className="p-4 text-right">
                                  <Button
                                    variant={sub.status === 'reviewed' ? 'outline' : 'primary'}
                                    size="sm"
                                    onClick={() => openGradingStudio(sub)}
                                  >
                                    {sub.status === 'reviewed' ? 'Edit Grade' : 'Open Grading Studio'}
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Practicals Created */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Code className="w-4 h-4 text-indigo-500" />
                      <span>Curriculum Practicals Created</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {practicals.map((p) => (
                      <Card key={p.id} className="p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono text-indigo-400 font-semibold">
                            {p.course_code} • Lab {p.lab_number}
                          </span>
                          <Badge variant={p.status === 'published' ? 'success' : 'default'} size="sm">
                            {p.status}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                          {p.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2">{p.objective}</p>
                        <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                          <span>Max Marks: {p.max_marks}</span>
                          <span>Due: {formatDate(p.deadline)}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ================= ADMIN DASHBOARD ================= */}
            {isAdmin && (
              <div className="space-y-8">
                {/* Stats Cards */}
                {stats && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <Card className="p-5">
                      <p className="text-xs text-slate-500">Total Students</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {stats.total_students}
                      </p>
                    </Card>
                    <Card className="p-5">
                      <p className="text-xs text-slate-500">Faculty Members</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {stats.total_teachers}
                      </p>
                    </Card>
                    <Card className="p-5">
                      <p className="text-xs text-slate-500">Active Courses</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {stats.total_courses}
                      </p>
                    </Card>
                    <Card className="p-5">
                      <p className="text-xs text-slate-500">Grading Completion</p>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                        {stats.grading_rate_percent}%
                      </p>
                    </Card>
                  </div>
                )}

                {/* User Directory Management */}
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <span>University User Directory</span>
                  </h3>
                  <UserManagementTable users={allUsers} onRefresh={loadData} />
                </div>
              </div>
            )}
          </>
        )}

        {/* Teacher Practical Creation Modal */}
        <PracticalEditorModal
          isOpen={isPracticalModalOpen}
          onClose={() => setIsPracticalModalOpen(false)}
          courses={courses}
          onSuccess={loadData}
        />

        {/* Admin Course Creation Modal */}
        <CourseModal
          isOpen={isCourseModalOpen}
          onClose={() => setIsCourseModalOpen(false)}
          faculty={facultyUsers}
          onSuccess={loadData}
        />

        {/* Grading Studio Modal */}
        <GradingStudioModal
          isOpen={!!gradingSubmission}
          onClose={() => {
            setGradingSubmission(null);
            setGradingPractical(null);
          }}
          submission={gradingSubmission}
          practical={gradingPractical}
          onGradedSuccess={loadData}
        />
      </div>
    </AppLayout>
  );
}
