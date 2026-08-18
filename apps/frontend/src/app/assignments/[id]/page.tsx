"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { FileText, RotateCcw } from 'lucide-react';

type Question = {
  number: number;
  text: string;
  difficulty: 'Easy' | 'Moderate' | 'Challenging';
  marks: number;
  type: string;
  answer?: string;
};

type Section = {
  title: string;
  instruction: string;
  questions: Question[];
};

type GeneratedPaper = {
  assignmentId: string;
  schoolName: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: number;
  sections: Section[];
  answerKey: Array<{
    questionNumber: number;
    answer: string;
  }>;
};

type AssignmentResponse = {
  id?: string;
  assignmentId?: string;
  fileName?: string;
  dueDate?: string;
  questionTypes?: Array<{
    type: string;
    count: number;
    marks: number;
  }>;
  additionalInfo?: string;
  totalQuestions?: number;
  totalMarks?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt?: string;
  updatedAt?: string;
  result?: GeneratedPaper;
};

const statusStyles: Record<NonNullable<AssignmentResponse['status']>, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-red-50 text-red-700 border-red-200'
};

function formatDate(value?: string): string {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function formatTitle(item?: AssignmentResponse | null): string {
  if (!item?.fileName) {
    return 'Untitled Assignment';
  }

  return item.fileName.replace(/\.[^.]+$/, '');
}

export default function AssignmentDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const assignmentId = params.id;
  const [assignment, setAssignment] = useState<AssignmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadAssignment = async () => {
      try {
        const response = await axios.get<AssignmentResponse>(`${apiUrl}/api/assignments/${assignmentId}`);
        if (!mounted) return;

        setAssignment(response.data);
        setError(null);
      } catch {
        if (mounted) {
          setError('Unable to load assignment details.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadAssignment();

    return () => {
      mounted = false;
    };
  }, [apiUrl, assignmentId]);

  const paper = assignment?.result;
  const totalQuestions = useMemo(() => assignment?.questionTypes?.reduce((sum, entry) => sum + entry.count, 0) ?? 0, [assignment]);

  return (
    <div className="page-shell">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="surface flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-[#6B7280]">
              <FileText className="h-4 w-4" />
              Assignment details
            </div>
            <h1 className="mt-1 text-3xl font-bold text-[#1A1A1A]">{loading ? 'Loading assignment...' : formatTitle(assignment)}</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/assignments')}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#1A1A1A]"
            >
              Back to list
            </button>
            <button
              type="button"
              onClick={() => router.push(`/assignments/${assignmentId}/generating`)}
              className="inline-flex items-center gap-2 rounded-full bg-[#1A1A1A] px-4 py-2 text-sm font-semibold text-white"
            >
              <RotateCcw className="h-4 w-4" />
              View progress
            </button>
          </div>
        </div>

        {error ? <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}

        {loading ? (
          <div className="surface p-10 text-center text-sm text-[#667085]">Loading assignment details…</div>
        ) : assignment ? (
          <>
            <div className="grid gap-5 lg:grid-cols-3">
              <div className="surface p-6 lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-4">
                  <div>
                    <div className="text-sm font-semibold text-[#6B7280]">Assignment ID</div>
                    <div className="mt-1 text-lg font-bold text-[#1A1A1A]">{assignment.assignmentId ?? assignment.id ?? assignmentId}</div>
                  </div>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${statusStyles[assignment.status ?? 'pending']}`}>
                    {assignment.status ?? 'pending'}
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-[#F9FAFB] p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Uploaded file</div>
                    <div className="mt-1 text-sm font-semibold text-[#1A1A1A]">{assignment.fileName ?? '--'}</div>
                  </div>
                  <div className="rounded-2xl bg-[#F9FAFB] p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Due date</div>
                    <div className="mt-1 text-sm font-semibold text-[#1A1A1A]">{formatDate(assignment.dueDate)}</div>
                  </div>
                  <div className="rounded-2xl bg-[#F9FAFB] p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Total questions</div>
                    <div className="mt-1 text-sm font-semibold text-[#1A1A1A]">{assignment.totalQuestions ?? totalQuestions}</div>
                  </div>
                  <div className="rounded-2xl bg-[#F9FAFB] p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Total marks</div>
                    <div className="mt-1 text-sm font-semibold text-[#1A1A1A]">{assignment.totalMarks ?? '--'}</div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-gray-200 p-4">
                  <div className="text-sm font-semibold text-[#1A1A1A]">Question types</div>
                  <div className="mt-3 space-y-2 text-sm text-[#374151]">
                    {assignment.questionTypes?.length ? (
                      assignment.questionTypes.map((item, index) => (
                        <div key={`${item.type}-${index}`} className="flex items-center justify-between rounded-xl bg-[#F9FAFB] px-4 py-3">
                          <span>{item.type}</span>
                          <span className="font-semibold">
                            {item.count} x {item.marks} marks
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[#6B7280]">No question type data available.</div>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-[#1A1A1A]">Additional instructions</div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#4B5563]">
                      {assignment.additionalInfo?.trim() || 'No additional instructions provided.'}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-gray-200 p-4">
                    <div className="text-sm font-semibold text-[#1A1A1A]">Timestamps</div>
                    <div className="mt-2 space-y-2 text-sm text-[#4B5563]">
                      <div>Created: {formatDate(assignment.createdAt)}</div>
                      <div>Updated: {formatDate(assignment.updatedAt)}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="surface p-6">
                <div className="text-sm font-semibold text-[#6B7280]">Generation status</div>
                <div className="mt-2 text-2xl font-bold text-[#1A1A1A] capitalize">{assignment.status ?? 'pending'}</div>
                <p className="mt-2 text-sm leading-6 text-[#6B7280]">
                  Use the progress screen to track generation, or open the result view once the paper is complete.
                </p>

                <div className="mt-5 space-y-3">
                  <button
                    type="button"
                    onClick={() => router.push(`/assignments/${assignmentId}/generating`)}
                    className="w-full rounded-full bg-[#1A1A1A] px-4 py-3 text-sm font-semibold text-white"
                  >
                    Open generation view
                  </button>
                  {assignment.status === 'completed' ? (
                    <button
                      type="button"
                      onClick={() => router.push(`/assignments/${assignmentId}/result`)}
                      className="w-full rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-[#1A1A1A]"
                    >
                      Open result view
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {paper ? (
              <div className="surface p-6">
                <div className="border-b border-gray-200 pb-4 text-center">
                  <h2 className="text-2xl font-bold text-[#1A1A1A]">Generated Paper</h2>
                  <p className="mt-1 text-sm text-[#6B7280]">The full generated assignment is shown below.</p>
                </div>

                <div className="mt-6 space-y-8">
                  {paper.sections.map((section, sectionIndex) => (
                    <section key={`${section.title}-${sectionIndex}`} className="space-y-4">
                      <div className="text-center text-xl font-bold text-[#1A1A1A]">{section.title}</div>
                      <p className="text-center italic text-[#4B5563]">{section.instruction}</p>

                      <div className="space-y-4">
                        {section.questions.map((question) => (
                          <div key={`${section.title}-${question.number}`} className="text-sm leading-7 text-[#1A1A1A] md:text-base">
                            <span className="font-semibold">{question.number}.</span> {question.text}{' '}
                            <span className="font-semibold text-[#6B7280]">({question.marks} marks)</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}

                  <section className="border-t border-gray-200 pt-6">
                    <h3 className="text-xl font-bold text-[#1A1A1A]">Answer Key</h3>
                    <div className="mt-4 space-y-3">
                      {paper.answerKey.map((entry) => (
                        <div key={entry.questionNumber} className="rounded-2xl bg-[#F9FAFB] px-4 py-3 text-sm text-[#374151]">
                          <span className="font-semibold">Q{entry.questionNumber}:</span> {entry.answer}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
