"use client";

import { useParams, useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

export default function AssignmentResultPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#F5F5F5] px-6">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-[#1A1A1A]">Question paper ready</h1>
        <p className="mt-2 text-sm text-[#6B7280]">Assignment ID: {params.id}</p>
        <button
          type="button"
          onClick={() => router.push(`/assignments/${params.id}`)}
          className="mt-8 rounded-full bg-[#1A1A1A] px-5 py-3 text-sm font-semibold text-white"
        >
          View Assignment
        </button>
      </div>
    </div>
  );
}
