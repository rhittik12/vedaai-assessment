"use client";

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { pdf } from '@react-pdf/renderer';

import { AssignmentPDF, type AssignmentPDFData } from '@/components/AssignmentPDF';

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
  dueDate?: string;
  fileName?: string;
  questionTypes?: Array<{
    type: string;
    count: number;
    marks: number;
  }>;
  additionalInfo?: string;
  totalMarks?: number;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  result?: GeneratedPaper;
};

function fallbackPaper(assignmentId: string, assignment?: AssignmentResponse | null): GeneratedPaper {
  const totalMarks = assignment?.totalMarks ?? 0;

  return {
    assignmentId,
    schoolName: 'VedaAI Learning Academy',
    subject: 'Science',
    className: 'Grade 8',
    timeAllowed: '45 minutes',
    maxMarks: totalMarks,
    sections: [
      {
        title: 'Section A',
        instruction: 'Read the following questions carefully and answer in one or two sentences where applicable.',
        questions: [
          {
            number: 1,
            text: 'What is the function of chlorophyll in photosynthesis?',
            difficulty: 'Easy',
            marks: 2,
            type: 'Short Answer Questions'
          },
          {
            number: 2,
            text: 'Explain why a balanced diet is important for adolescents.',
            difficulty: 'Moderate',
            marks: 3,
            type: 'Short Answer Questions'
          },
          {
            number: 3,
            text: 'Describe the process of evaporation with one daily-life example.',
            difficulty: 'Challenging',
            marks: 4,
            type: 'Short Answer Questions'
          }
        ]
      }
    ],
    answerKey: [
      { questionNumber: 1, answer: 'Chlorophyll traps sunlight and helps convert it into chemical energy.' },
      { questionNumber: 2, answer: 'A balanced diet supports growth, energy, immunity, and overall health.' },
      { questionNumber: 3, answer: 'Evaporation is the change of water into vapour from a liquid state; drying clothes is an example.' }
    ]
  };
}

function sanitizeFilePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AssignmentResultPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const assignmentId = params.id;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const [assignment, setAssignment] = useState<AssignmentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

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
          setError('Unable to load assignment result.');
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

  const paper = useMemo(() => {
    if (loading) {
      return null;
    }

    return assignment?.result ?? fallbackPaper(assignmentId, assignment);
  }, [assignment, assignmentId, loading]);

  const handleDownloadPdf = async () => {
    if (!paper) {
      setError('Assignment result is not available yet.');
      return;
    }

    setDownloadBusy(true);
    try {
      const blob = await pdf(<AssignmentPDF paper={paper as AssignmentPDFData} />).toBlob();
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const today = new Date().toISOString().slice(0, 10);
      const filename = `assignment-${sanitizeFilePart(paper.schoolName)}-${sanitizeFilePart(paper.subject)}-${today}.pdf`;

      anchor.href = blobUrl;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(blobUrl);
    } finally {
      setDownloadBusy(false);
    }
  };

  const handleRegenerate = async () => {
    if (!assignment) {
      setError('Assignment data is not available yet.');
      return;
    }

    setRegenerating(true);
    setError(null);

    try {
      const response = await axios.post<{ assignmentId: string }>(`${apiUrl}/api/assignments/${assignmentId}/regenerate`);
      router.replace(`/assignments/${response.data.assignmentId}/generating`);
    } catch {
      setError('Unable to regenerate this assignment right now.');
    } finally {
      setRegenerating(false);
    }
  };

  const totalQuestions = paper?.sections.reduce((sum, section) => sum + section.questions.length, 0) ?? 0;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F5F5F5] px-6 py-6">
      <div className="sticky top-0 z-20 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-white/90 px-4 py-3 shadow-sm backdrop-blur print:hidden">
        <button
          type="button"
          onClick={() => router.push('/assignments')}
          className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#1A1A1A]"
        >
          Back
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => void handleRegenerate()}
            disabled={regenerating || loading}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#1A1A1A] disabled:opacity-60"
          >
            {regenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/assignments/create')}
            className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-[#1A1A1A]"
          >
            Create New
          </button>
          <button
            type="button"
            onClick={() => void handleDownloadPdf()}
            disabled={downloadBusy}
            className="rounded-full bg-[#1A1A1A] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {downloadBusy ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[28px] bg-[#1A1A1A] px-6 py-8 text-white shadow-lg print:hidden">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="max-w-3xl text-lg leading-8 text-white/95 md:text-xl">
              Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade 8 Science classes on the NCERT chapters:
            </p>
            <button
              type="button"
              onClick={() => void handleDownloadPdf()}
              className="inline-flex items-center justify-center rounded-full border border-white px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-[#1A1A1A]"
            >
              ⬇ Download as PDF
            </button>
          </div>
        </div>

        {paper ? (
          <div className="overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="border-b border-gray-200 px-8 py-8 text-center">
              <div className="text-3xl font-bold tracking-tight text-[#1A1A1A] md:text-4xl">{paper.schoolName}</div>
              <div className="mt-2 text-lg font-medium text-[#374151] md:text-xl">
                {paper.subject} - {paper.className}
              </div>
            </div>

            <div className="border-b border-gray-200 px-8 py-4 text-sm font-medium text-[#1A1A1A] md:text-base">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <span>Time Allowed: {paper.timeAllowed}</span>
                <span>Maximum Marks: {paper.maxMarks}</span>
              </div>
            </div>

            <div className="px-8 py-6 text-sm text-[#1A1A1A] md:text-base">
              <p className="font-bold">All questions are compulsory unless stated otherwise.</p>

              <div className="mt-6 grid gap-3 text-sm md:grid-cols-3 md:items-center md:text-base">
                <div>Name: __________________</div>
                <div>Roll Number: __________________</div>
                <div>Class: X Section: __________</div>
              </div>

              <div className="mt-8 space-y-10">
                {paper.sections.map((section, sectionIndex) => (
                  <section key={`${section.title}-${sectionIndex}`} className="space-y-4">
                    <div className="text-center text-2xl font-bold text-[#1A1A1A]">{section.title}</div>
                    <p className="text-center italic text-[#4B5563]">{section.instruction}</p>
                    <div className="space-y-4">
                      {section.questions.map((question) => (
                        <div key={`${section.title}-${question.number}`} className="text-base leading-7 text-[#1A1A1A] md:text-lg">
                          <span className="font-semibold">{question.number}.</span> {question.text}{' '}
                          <span className="font-semibold text-[#6B7280]">({question.marks} marks)</span>
                        </div>
                      ))}
                    </div>

                    {sectionIndex === paper.sections.length - 1 ? (
                      <div className="pt-2 text-lg font-bold text-[#1A1A1A]">End of Question Paper</div>
                    ) : null}
                  </section>
                ))}
              </div>

              <div className="mt-12 border-t border-gray-200 pt-8">
                <div className="text-2xl font-bold text-[#1A1A1A]">Answer Key:</div>
                <div className="mt-4 space-y-3">
                  {paper.answerKey.map((entry) => (
                    <div key={entry.questionNumber} className="rounded-2xl bg-[#F9FAFB] px-4 py-3 text-sm text-[#374151] md:text-base">
                      <span className="font-semibold">Q{entry.questionNumber}:</span> {entry.answer}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[28px] bg-white px-8 py-12 text-center text-sm text-[#6B7280] shadow-2xl">Loading assignment result...</div>
        )}

        {error ? <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div> : null}
        <div className="rounded-2xl bg-white px-6 py-4 text-sm text-[#6B7280] shadow-sm">Total questions: {totalQuestions}</div>
      </div>
    </div>
  );
}