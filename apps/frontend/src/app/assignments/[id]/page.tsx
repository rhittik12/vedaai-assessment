"use client";

import { useParams, useRouter } from 'next/navigation';

export default function AssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-[#F5F5F5] px-6 text-center">
      <h1 className="text-3xl font-bold text-[#1A1A1A]">Assignment Detail</h1>
      <p className="mt-2 text-sm text-[#6B7280]">Assignment ID: {params.id}</p>
      <button
        type="button"
        onClick={() => router.push('/assignments')}
        className="mt-6 rounded-full bg-[#1A1A1A] px-5 py-3 text-sm font-semibold text-white"
      >
        Back to Assignments
      </button>
    </div>
  );
}