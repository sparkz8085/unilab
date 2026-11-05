'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { AppLayout } from '@/components/layout/AppLayout';
import { PracticalWorkspace } from '@/components/student/PracticalWorkspace';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Practical, Submission } from '@/types';
import { ArrowLeft } from 'lucide-react';

export default function PracticalWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [practical, setPractical] = useState<Practical | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkspace() {
      setLoading(true);
      try {
        const [p, s] = await Promise.all([
          api.practicals.getById(id),
          api.submissions.getMyForPractical(id).catch(() => null),
        ]);
        setPractical(p);
        setSubmission(s);
      } catch (err) {
        console.error('Failed loading workspace', err);
      } finally {
        setLoading(false);
      }
    }
    loadWorkspace();
  }, [id]);

  return (
    <AppLayout>
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="-ml-2 text-slate-500"
        >
          Back
        </Button>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <Skeleton className="lg:col-span-5 h-[500px] rounded-xl" />
              <Skeleton className="lg:col-span-7 h-[500px] rounded-xl" />
            </div>
          </div>
        ) : practical ? (
          <PracticalWorkspace
            practical={practical}
            initialSubmission={submission}
            onSubmissionSuccess={(newSub) => setSubmission(newSub)}
          />
        ) : (
          <div className="p-8 text-center text-slate-500">
            Practical assignment not found.
          </div>
        )}
      </div>
    </AppLayout>
  );
}
