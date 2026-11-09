'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FlaskConical, Lock, Mail, User as UserIcon, Building, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { error, success } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !fullName || !identifier.trim()) {
      error('Fields required', 'Please complete your name, roll number, and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const localName = fullName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
      const roll = identifier.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const generatedEmail = `${localName}.${roll}@stud.unilab.edu`;
      setEmail(generatedEmail);
      await register({
        email: generatedEmail,
        password,
        full_name: fullName,
        student_id: identifier || undefined,
        department,
      });
      success('Account Created', 'Welcome to UniLab!');
    } catch (err: unknown) {
      error('Registration failed', err instanceof Error ? err.message : 'Could not register user.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <FlaskConical className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">UniLab</span>
          </Link>
          <h2 className="text-xl font-bold text-white tracking-tight">Create your account</h2>
          <p className="text-xs text-slate-400">
            Join the digital university laboratory management system.
          </p>
        </div>

        {/* Register Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl space-y-4 text-xs"
        >
          <Input
            label="Full Name"
            placeholder="e.g. Maya Lin"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<UserIcon className="w-4 h-4" />}
            required
          />

          <Input
            label="Generated University Email"
            type="email"
            placeholder="Generated from your name and roll number"
            value={email}
            disabled
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Input
            label="Student ID"
            placeholder="e.g. CS-2024-089"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />

          <Input
            label="Department"
            placeholder="Computer Science & Engineering"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            leftIcon={<Building className="w-4 h-4" />}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Account
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
