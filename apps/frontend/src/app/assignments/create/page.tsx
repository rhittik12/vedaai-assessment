"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  UploadCloud,
  Calendar,
  Mic,
  Plus,
  X,
  Minus,
} from "lucide-react";

type QuestionTypeOption =
  | "Multiple Choice Questions"
  | "Short Questions"
  | "Diagram/Graph-Based Questions"
  | "Numerical Problems"
  | "Long Answer Questions";

const QUESTION_OPTIONS: QuestionTypeOption[] = [
  "Multiple Choice Questions",
  "Short Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Long Answer Questions",
];

const QuestionTypeSchema = z.object({
  type: z.enum([
    "Multiple Choice Questions",
    "Short Questions",
    "Diagram/Graph-Based Questions",
    "Numerical Problems",
    "Long Answer Questions",
  ]),
  count: z.number().min(1).max(50),
  marks: z.number().min(1).max(100),
});

const CreateAssignmentSchema = z.object({
  dueDate: z
    .string()
    .min(1, "Due date is required")
    .refine((val) => {
      const d = new Date(val);
      if (Number.isNaN(d.getTime())) return false;
      // compare end of day
      const now = new Date();
      return d.getTime() > now.getTime();
    }, "Due date must be in the future"),
  questionTypes: z.array(QuestionTypeSchema).min(1, "At least one question type is required"),
  additionalInfo: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof CreateAssignmentSchema>;

function formatDisplayDate(dateString?: string) {
  if (!dateString) return "DD-MM-YYYY";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "DD-MM-YYYY";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(CreateAssignmentSchema),
    defaultValues: {
      dueDate: "",
      questionTypes: [
        { type: "Multiple Choice Questions", count: 4, marks: 1 },
        { type: "Short Questions", count: 3, marks: 2 },
      ],
      additionalInfo: "",
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "questionTypes",
  });

  const totals = useMemo(() => {
    let tq = 0;
    let tm = 0;
    for (const f of fields) {
      tq += Number(f.count ?? 0);
      tm += Number(f.marks ?? 0) * Number(f.count ?? 0);
    }
    return { totalQuestions: tq, totalMarks: tm };
  }, [fields]);

  const onFileChange = useCallback((file?: File | null) => {
    setSelectedFile(file ?? null);
  }, []);

  const onDrop = useCallback((ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    setDragOver(false);
    const f = ev.dataTransfer.files?.[0];
    if (f) onFileChange(f);
  }, [onFileChange]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const nextPreviewUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(nextPreviewUrl);

    return () => {
      URL.revokeObjectURL(nextPreviewUrl);
    };
  }, [selectedFile]);

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
      const form = new FormData();
      form.append("dueDate", data.dueDate);
      form.append("additionalInfo", data.additionalInfo ?? "");
      form.append("questionTypes", JSON.stringify(data.questionTypes));
      if (selectedFile) form.append("file", selectedFile);

      const resp = await axios.post(`${apiUrl}/api/assignments`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const id = resp?.data?.id ?? resp?.data?._id ?? resp?.data?.assignmentId;
      if (id) {
        router.push(`/assignments/${id}/generating`);
      } else {
        // fallback: navigate to assignments list
        router.push(`/assignments`);
      }
    } catch (err) {
      setSubmitError(
        axios.isAxiosError(err)
          ? err.response?.data?.message ?? 'Unable to create assignment. Please try again.'
          : 'Unable to create assignment. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-[#F5F5F5] px-6 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Create Assignment</h1>
        </div>
        <p className="mt-2 text-sm text-[#6B7280]">Set up a new assignment for your students</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="rounded-2xl bg-white shadow-sm">
          {/* Progress bar */}
          <div className="h-2 w-full rounded-t-2xl bg-[#111827]"></div>

          <div className="p-6">
            {submitError ? (
              <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            ) : null}

            <h2 className="text-lg font-semibold text-[#1A1A1A]">Assignment Details</h2>
            <p className="mt-1 text-sm text-[#6B7280]">Basic information about your assignment</p>

            {/* File Upload Zone */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-medium text-[#1A1A1A]">Upload File</label>

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`relative flex items-center justify-center rounded-xl border-2 border-dashed p-6 ${
                  dragOver ? "border-orange-400" : "border-gray-200"
                } bg-white`}
              >
                {!selectedFile ? (
                  <div className="flex w-full max-w-lg flex-col items-center justify-center gap-4">
                    <UploadCloud className="h-12 w-12 text-[#6B7280]" />
                    <div className="text-center">
                      <div className="text-sm font-semibold text-[#1A1A1A]">Choose a file or drag & drop it here</div>
                      <div className="mt-1 text-xs text-[#9CA3AF]">JPEG, PNG, upto 10MB</div>
                    </div>

                    <label className="mt-2 inline-flex items-center gap-2 rounded-full bg-white border border-gray-200 px-4 py-2 text-sm font-semibold text-[#1A1A1A] shadow-sm cursor-pointer">
                      Browse Files
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) onFileChange(f);
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex w-full max-w-lg items-center gap-4">
                    {previewUrl ? (
                      <img src={previewUrl} alt="preview" className="h-20 w-20 rounded-md object-cover" />
                    ) : null}
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[#1A1A1A]">{selectedFile.name}</div>
                      <div className="mt-1 text-xs text-[#6B7280]">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                    <button type="button" onClick={() => onFileChange(null)} className="rounded-full p-2 text-[#6B7280] hover:bg-gray-50">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <p className="mt-2 text-sm text-[#6B7280]">Upload images of your preferred document/image</p>
            </div>

            {/* Due Date */}
            <div className="mt-6 grid w-full max-w-sm items-center gap-2">
              <label className="text-sm font-medium text-[#1A1A1A]">Due Date</label>
              <div className="relative flex w-full items-center">
                <input
                  type="date"
                  placeholder="DD-MM-YYYY"
                  {...register("dueDate")}
                  className="w-full rounded-md border border-gray-200 bg-white py-2 px-3 pr-10 text-sm text-[#1A1A1A] outline-none"
                />
                <Calendar className="absolute right-3 h-4 w-4 text-[#6B7280]" />
              </div>
              {errors.dueDate ? <div className="text-xs text-red-600">{String(errors.dueDate.message)}</div> : null}
            </div>

            {/* Question Types */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-[#1A1A1A]">Question Type</label>
                  <p className="mt-1 text-sm text-[#6B7280]">Configure types, counts and marks</p>
                </div>
                <button
                  type="button"
                  onClick={() => append({ type: "Multiple Choice Questions", count: 1, marks: 1 })}
                  className="inline-flex items-center gap-2 rounded-full bg-black p-2 text-white"
                  aria-label="Add question type"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid w-full gap-3">
                <div className="grid grid-cols-3 gap-2 text-xs text-[#6B7280]">
                  <div>Question Type</div>
                  <div className="text-center">No. of Questions</div>
                  <div className="text-right">Marks</div>
                </div>

                {fields.map((field, idx) => (
                  <div key={field.id} className="flex items-center gap-3 rounded-md border border-gray-100 bg-white p-3">
                    <Controller
                      control={control}
                      name={`questionTypes.${idx}.type` as const}
                      render={({ field: f }) => (
                        <select
                          {...f}
                          className="w-full rounded-md border border-gray-200 bg-white py-2 px-3 text-sm text-[#1A1A1A] outline-none"
                        >
                          {QUESTION_OPTIONS.map((op) => (
                            <option key={op} value={op}>
                              {op}
                            </option>
                          ))}
                        </select>
                      )}
                    />

                    <div className="flex w-40 items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const current = Number((fields[idx]?.count as unknown) ?? 1);
                          const next = Math.max(1, current - 1);
                          update(idx, { ...fields[idx], count: next } as any);
                        }}
                        className="rounded-full border border-gray-200 p-1"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <input
                        type="number"
                        value={String(fields[idx].count ?? 1)}
                        onChange={(e) => update(idx, { ...fields[idx], count: Math.min(50, Math.max(1, Number(e.target.value || 1))) } as any)}
                        className="w-12 rounded-md border border-gray-200 py-1 text-center text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const current = Number((fields[idx]?.count as unknown) ?? 1);
                          const next = Math.min(50, current + 1);
                          update(idx, { ...fields[idx], count: next } as any);
                        }}
                        className="rounded-full border border-gray-200 p-1"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="ml-auto flex w-36 items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const current = Number((fields[idx]?.marks as unknown) ?? 1);
                          const next = Math.max(1, current - 1);
                          update(idx, { ...fields[idx], marks: next } as any);
                        }}
                        className="rounded-full border border-gray-200 p-1"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <input
                        type="number"
                        value={String(fields[idx].marks ?? 1)}
                        onChange={(e) => update(idx, { ...fields[idx], marks: Math.min(100, Math.max(1, Number(e.target.value || 1))) } as any)}
                        className="w-12 rounded-md border border-gray-200 py-1 text-center text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const current = Number((fields[idx]?.marks as unknown) ?? 1);
                          const next = Math.min(100, current + 1);
                          update(idx, { ...fields[idx], marks: next } as any);
                        }}
                        className="rounded-full border border-gray-200 p-1"
                      >
                        <Plus className="h-3 w-3" />
                      </button>

                      <button type="button" onClick={() => remove(idx)} className="ml-3 rounded-md p-1 text-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {errors.questionTypes ? <div className="text-xs text-red-600">{String(errors.questionTypes?.message)}</div> : null}
              </div>

              <div className="mt-4 flex items-center justify-end gap-4 text-sm text-[#6B7280]">
                <div>Total Questions : <span className="text-[#1A1A1A] font-semibold">{totals.totalQuestions}</span></div>
                <div>Total Marks : <span className="text-[#1A1A1A] font-semibold">{totals.totalMarks}</span></div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-6">
              <label className="text-sm font-medium text-[#1A1A1A]">Additional Information</label>
              <div className="relative mt-2">
                <textarea
                  placeholder="e.g Generate a question paper for 3 hour exam duration..."
                  {...register("additionalInfo")}
                  className="h-28 w-full rounded-md border border-gray-200 bg-white p-3 text-sm text-[#1A1A1A] outline-none"
                />
                <div className="absolute right-3 bottom-3">
                  <button type="button" className="rounded-full bg-white p-2 text-[#6B7280] shadow-sm">
                    <Mic className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom navigation */}
            <div className="mt-6 mb-4 flex items-center justify-between">
              <div>
                <button type="button" disabled className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-[#9CA3AF]">
                  ← Previous
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`rounded-full bg-[#1A1A1A] px-6 py-2 text-sm font-semibold text-white ${
                    submitting ? "opacity-60" : "hover:opacity-95"
                  }`}
                >
                  {submitting ? "Creating..." : "Next →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}