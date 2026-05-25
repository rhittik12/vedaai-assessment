"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Check, CircleDashed, RotateCcw, Sparkles } from 'lucide-react';

import { useSocket } from '@/hooks/useSocket';
import { useAppStore } from '@/store/useAppStore';

type AssignmentResponse = {
  id?: string;
  assignmentId?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  fileName?: string;
  totalQuestions?: number;
  totalMarks?: number;
};

type StepState = 'done' | 'active' | 'pending';

const stepLabels = ['Assignment submitted', 'Generating questions', 'Formatting paper', 'Almost ready...'];

function getStepStates(status?: AssignmentResponse['status']) {
  switch (status) {
    case 'completed':
      return ['done', 'done', 'done', 'done'] as StepState[];
    case 'failed':
      return ['done', 'pending', 'pending', 'pending'] as StepState[];
    case 'processing':
      return ['done', 'active', 'pending', 'pending'] as StepState[];
    default:
      return ['done', 'pending', 'pending', 'pending'] as StepState[];
  }
}

export default function GeneratingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const assignmentId = params.id;
  const { socket, connected } = useSocket();
  const jobStatus = useAppStore((state) => state.jobStatus[assignmentId]);
  const updateJobStatus = useAppStore((state) => state.updateJobStatus);
  const [assignment, setAssignment] = useState<AssignmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const currentStatus = assignment?.status ?? jobStatus ?? 'pending';
  const stepStates = useMemo(() => getStepStates(currentStatus), [currentStatus]);

  useEffect(() => {
    let mounted = true;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const loadAssignment = async () => {
      try {
        const response = await axios.get<AssignmentResponse>(`${apiUrl}/api/assignments/${assignmentId}`);
        if (!mounted) return;

        setAssignment(response.data);
        setError(null);

        if (response.data.status) {
          updateJobStatus(assignmentId, response.data.status);
        }

        if (response.data.status === 'completed') {
          router.replace(`/assignments/${assignmentId}/result`);
        }

        if (response.data.status === 'failed') {
          setError('Generation failed. You can retry or check the assignment details.');
        }
      } catch {
        if (mounted) {
          setError('Unable to load generation status.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadAssignment();
    intervalId = setInterval(() => {
      void loadAssignment();
    }, 3000);

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [apiUrl, assignmentId, router, updateJobStatus]);

  useEffect(() => {
    const handleCompleted = (payload: { assignmentId: string }) => {
      if (payload.assignmentId === assignmentId) {
        updateJobStatus(assignmentId, 'completed');
        router.replace(`/assignments/${assignmentId}/result`);
      }
    };

    const handleProcessing = (payload: { assignmentId: string }) => {
      if (payload.assignmentId === assignmentId) {
        updateJobStatus(assignmentId, 'processing');
      }
    };

    const handleFailed = (payload: { assignmentId: string; error?: string }) => {
      if (payload.assignmentId === assignmentId) {
        updateJobStatus(assignmentId, 'failed');
        setError(payload.error ?? 'Generation failed.');
      }
    };

    socket.on('job:completed', handleCompleted);
    socket.on('job:processing', handleProcessing);
    socket.on('job:failed', handleFailed);

    return () => {
      socket.off('job:completed', handleCompleted);
      socket.off('job:processing', handleProcessing);
      socket.off('job:failed', handleFailed);
    };
  }, [assignmentId, router, socket, updateJobStatus]);

  const handleRetry = async () => {
    setRetrying(true);
    setError(null);
    try {
      const response = await axios.post<{ assignmentId: string; jobId: string; status: AssignmentResponse['status'] }>(
        `${apiUrl}/api/assignments/${assignmentId}/retry`
      );
      setAssignment(response.data);
      updateJobStatus(assignmentId, response.data.status ?? 'pending');
    } catch {
      setError('Retry failed. Please try again in a moment.');
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-[#F5F5F5] px-6 py-10">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#111827] text-white shadow-md">
          <Sparkles className="h-8 w-8" />
        </div>

        <div className="mt-6 text-3xl font-bold text-[#1A1A1A]">VedaAI</div>
        <h1 className="mt-4 text-3xl font-bold text-[#1A1A1A]">Generating your question paper...</h1>
        <p className="mt-3 text-sm text-[#6B7280]">AI is crafting questions based on your requirements</p>

        <div className="mx-auto mt-8 flex w-full max-w-md flex-col gap-4 text-left">
          {stepLabels.map((label, index) => {
            const state = stepStates[index];
            const isActive = state === 'active';
            const isDone = state === 'done';

            return (
              <div
                key={label}
                className={`flex items-start gap-3 rounded-2xl border p-4 transition ${
                  isDone ? 'border-emerald-200 bg-emerald-50' : isActive ? 'border-[#F26522]/30 bg-[#FFF7F0]' : 'border-gray-100 bg-white'
                }`}
              >
                <div className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-[#F26522] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {isDone ? <Check className="h-4 w-4" /> : isActive ? <CircleDashed className="h-4 w-4 animate-spin" /> : <span className="text-xs font-semibold">{index + 1}</span>}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-semibold ${isActive ? 'text-[#1A1A1A]' : 'text-[#6B7280]'}`}>{label}</div>
                  {isActive ? <div className="mt-1 text-xs text-[#F26522]">Please wait while the model structures your paper.</div> : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-center gap-3 text-sm text-[#6B7280]">
          <span className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          {connected ? 'Live connection active' : 'Using polling fallback'}
        </div>

        {loading ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#6B7280]">
            <span className="h-2 w-2 animate-bounce rounded-full bg-[#1A1A1A] [animation-delay:-0.2s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-[#1A1A1A] [animation-delay:-0.1s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-[#1A1A1A]" />
          </div>
        ) : null}

        {error ? (
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-4 text-left text-sm text-red-700">
            <div className="font-semibold">Generation paused</div>
            <div className="mt-1">{error}</div>
            <button
              type="button"
              onClick={() => void handleRetry()}
              disabled={retrying}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              <RotateCcw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
