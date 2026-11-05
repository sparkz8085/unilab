'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { getRoleBadgeStyle } from '@/lib/utils';
import { User, Mail, Shield, Building, Moon, Sun, Laptop, Check } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const { success, error } = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [isSaving, setIsSaving] = useState(false);

  const roleBadge = getRoleBadgeStyle(user?.role);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      success('Profile Updated', 'Your user preferences have been saved.');
    }, 400);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Account Profile & Preferences
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal profile, credentials, and laboratory workspace appearance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Avatar Card */}
          <div className="md:col-span-4">
            <Card className="p-6 text-center space-y-4">
              <div className="w-20 h-20 rounded-2xl mx-auto overflow-hidden bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-2xl">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  user?.full_name.charAt(0)
                )}
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{user?.full_name}</h3>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <div className="mt-2">
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded border uppercase ${roleBadge.bg} ${roleBadge.text}`}>
                    {roleBadge.label}
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                <p>ID: <strong>{user?.student_id || user?.employee_id || 'N/A'}</strong></p>
              </div>
            </Card>
          </div>

          {/* Right Form Card */}
          <div className="md:col-span-8 space-y-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Personal Information</h3>
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
              />
              <Input
                label="University Email"
                value={user?.email || ''}
                disabled
                leftIcon={<Mail className="w-4 h-4" />}
              />
              <Input
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                leftIcon={<Building className="w-4 h-4" />}
              />
              <div className="pt-2 flex justify-end">
                <Button variant="primary" size="sm" onClick={handleSave} isLoading={isSaving} leftIcon={<Check className="w-4 h-4" />}>
                  Save Changes
                </Button>
              </div>
            </Card>

            {/* Appearance */}
            <Card className="p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Workspace Theme</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                    theme === 'dark'
                      ? 'border-indigo-500 bg-indigo-950/30 text-indigo-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Moon className="w-5 h-5" />
                  <span className="text-xs">Dark Mode (Default)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                    theme === 'light'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sun className="w-5 h-5" />
                  <span className="text-xs">Light Mode</span>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
