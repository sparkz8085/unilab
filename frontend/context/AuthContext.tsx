'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    password: string;
    full_name: string;
    student_id?: string;
    department?: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getDashboardPath(role: User['role']): string {
  if (role === 'admin' || role === 'super_admin') return '/admin';
  if (role === 'teacher') return '/teacher/dashboard';
  return '/dashboard';
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const storedToken = window.localStorage.getItem('unilab_access_token');
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const me = await api.auth.getMe();
      setUser(me);
      setToken(storedToken);
    } catch (err) {
      console.warn('Session hydration failed; clearing invalid session', err);
      setUser(null);
      setToken(null);
      window.localStorage.removeItem('unilab_access_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.auth.login(email, password);
      setToken(res.access_token);
      setUser(res.user);

      // A full navigation makes the destination re-hydrate from the persisted token.
      // This avoids stale client-side auth state during protected-route transitions.
      window.location.replace(getDashboardPath(res.user.role));
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: {
    email: string;
    password: string;
    full_name: string;
    student_id?: string;
    department?: string;
  }) => {
    setLoading(true);
    try {
      const res = await api.auth.register(payload);
      setToken(res.access_token);
      setUser(res.user);
      window.location.replace(getDashboardPath(res.user.role));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    window.localStorage.removeItem('unilab_access_token');
    window.localStorage.removeItem('unilab_active_user');
    window.location.replace('/login');
  };

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isStudent,
        isTeacher,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
