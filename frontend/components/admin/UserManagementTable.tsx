'use client';

import React, { useState } from 'react';
import { User, UserRole } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatDate, getRoleBadgeStyle } from '@/lib/utils';
import { Search, UserPlus, Filter, Mail, Shield } from 'lucide-react';

interface UserManagementTableProps {
  users: User[];
  onRefresh?: () => void;
}

export function UserManagementTable({ users, onRefresh }: UserManagementTableProps) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.student_id && u.student_id.toLowerCase().includes(search.toLowerCase())) ||
      (u.employee_id && u.employee_id.toLowerCase().includes(search.toLowerCase()));

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-4">
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
        <div className="flex-1 w-full sm:w-auto">
          <Input
            placeholder="Search users by name, email, or student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Role:</span>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="student">Students</option>
            <option value="teacher">Faculty / Teachers</option>
            <option value="admin">Administrators</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Identifier / ID</th>
              <th className="p-4">Department</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  No users found matching current filters.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const roleBadge = getRoleBadgeStyle(u.role);
                return (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                          {u.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{u.full_name}</p>
                          <p className="text-[11px] text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${roleBadge.bg} ${roleBadge.text}`}>
                        {roleBadge.label}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-600 dark:text-slate-300">
                      {u.student_id || u.employee_id || '—'}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      {u.department || 'General'}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 ${u.is_active ? 'text-emerald-500' : 'text-slate-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">
                      {formatDate(u.created_at)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
