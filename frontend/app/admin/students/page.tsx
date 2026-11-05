'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { User } from '@/types';
import { CardSkeleton } from '@/components/ui/Skeleton';

export default function AdminStudentsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const uList = await api.users.list('student');
      setUsers(uList);
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
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Student User Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Enrolled student accounts, university IDs, and lab allocations.
          </p>
        </div>

        {loading ? <CardSkeleton /> : <UserManagementTable users={users} onRefresh={loadData} />}
      </div>
    </AppLayout>
  );
}
