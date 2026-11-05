import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getStatusBadgeVariant(status?: string): { bg: string; text: string; label: string } {
  switch (status) {
    case 'submitted':
      return { bg: 'bg-blue-500/10 border-blue-500/20', text: 'text-blue-400', label: 'Submitted' };
    case 'under_review':
      return { bg: 'bg-amber-500/10 border-amber-500/20', text: 'text-amber-400', label: 'Under Review' };
    case 'reviewed':
      return { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', label: 'Graded' };
    case 'returned':
      return { bg: 'bg-rose-500/10 border-rose-500/20', text: 'text-rose-400', label: 'Returned' };
    case 'draft':
      return { bg: 'bg-slate-500/10 border-slate-500/20', text: 'text-slate-400', label: 'Draft' };
    case 'published':
      return { bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'text-emerald-400', label: 'Published' };
    case 'archived':
      return { bg: 'bg-zinc-500/10 border-zinc-500/20', text: 'text-zinc-400', label: 'Archived' };
    default:
      return { bg: 'bg-slate-500/10 border-slate-500/20', text: 'text-slate-400', label: status || 'Pending' };
  }
}

export function getRoleBadgeStyle(role?: string): { bg: string; text: string; label: string } {
  switch (role) {
    case 'admin':
    case 'super_admin':
      return { bg: 'bg-purple-500/15 border-purple-500/30', text: 'text-purple-400', label: 'Admin' };
    case 'teacher':
      return { bg: 'bg-indigo-500/15 border-indigo-500/30', text: 'text-indigo-400', label: 'Faculty' };
    case 'student':
      return { bg: 'bg-emerald-500/15 border-emerald-500/30', text: 'text-emerald-400', label: 'Student' };
    default:
      return { bg: 'bg-slate-500/15 border-slate-500/30', text: 'text-slate-300', label: role || 'User' };
  }
}
