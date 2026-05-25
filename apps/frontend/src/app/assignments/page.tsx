"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Filter, MoreHorizontal, Search, Plus } from 'lucide-react';

import { type Assignment, useAppStore } from '@/store/useAppStore';

type AssignmentApiItem = Assignment & {
  assignedOn?: string;
  dueDate?: string;
  createdAt?: string;
  due?: string;
};

type DropdownState = {
  id: string;
  open: boolean;
};

function formatDate(value?: string): string {
  if (!value) return '--.--.----';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--.--.----';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatAssignmentTitle(item: AssignmentApiItem): string {
  return item.title?.trim() || item.fileName?.replace(/\.[^.]+$/, '') || 'Untitled Assignment';
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-40 w-40 items-center justify-center rounded-full bg-white shadow-sm">
        <svg viewBox="0 0 160 160" className="h-28 w-28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M44 28h48l24 24v72a8 8 0 0 1-8 8H44a8 8 0 0 1-8-8V36a8 8 0 0 1 8-8Z" fill="#fff" stroke="#CBD5E1" strokeWidth="3" />
          <path d="M92 28v24h24" stroke="#CBD5E1" strokeWidth="3" strokeLinejoin="round" />
          <rect x="54" y="54" width="44" height="6" rx="3" fill="#CBD5E1" />
          <rect x="54" y="68" width="32" height="6" rx="3" fill="#E2E8F0" />
          <circle cx="108" cy="102" r="20" stroke="#F26522" strokeWidth="6" />
          <path d="m122 116 14 14" stroke="#F26522" strokeWidth="6" strokeLinecap="round" />
          <path d="m102 94 12 12" stroke="#1A1A1A" strokeWidth="4" strokeLinecap="round" />
          <path d="m114 94-12 12" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-[#1A1A1A]">No assignments yet</h2>
      <p className="mt-2 max-w-md text-sm text-[#6B7280]">
        Create your first assignment to get started with planning, generating, and managing class work.
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="mt-6 rounded-full bg-[#1A1A1A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
      >
        + Create Your First Assignment
      </button>
    </div>
  );
}

export default function AssignmentsPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const router = useRouter();
  const assignments = useAppStore((state) => state.assignments) as AssignmentApiItem[];
  const setAssignments = useAppStore((state) => state.setAssignments);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<DropdownState | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadAssignments = async () => {
      try {
        setLoading(true);
        const response = await axios.get<{ assignments: AssignmentApiItem[] } | AssignmentApiItem[]>(`${apiUrl}/api/assignments`);
        const items = Array.isArray(response.data) ? response.data : response.data.assignments ?? [];
        if (mounted) {
          setAssignments(items);
          setError(null);
        }
      } catch {
        if (mounted) setError('Unable to load assignments.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadAssignments();

    return () => {
      mounted = false;
    };
  }, [apiUrl, setAssignments]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredAssignments = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return assignments;
    return assignments.filter((item) => formatAssignmentTitle(item).toLowerCase().includes(term));
  }, [assignments, search]);

  const handleDelete = async (id: string) => {
    await axios.delete(`${apiUrl}/api/assignments/${id}`);
    setAssignments(assignments.filter((item) => item.id !== id));
    setOpenDropdown(null);
  };

  const handleCreate = () => {
    router.push('/assignments/create');
  };

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-[#F5F5F5] px-6 py-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-3 w-3 rounded-full bg-emerald-500" />
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Assignments</h1>
          </div>
          <p className="mt-2 text-sm text-[#6B7280]">Manage and create assignments for your classes.</p>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-[#1A1A1A] shadow-sm"
        >
          <Filter className="h-4 w-4" />
          Filter By
        </button>

        <div className="relative w-full max-w-[420px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search Assignment"
            className="w-full rounded-full border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-[#1A1A1A] shadow-sm outline-none placeholder:text-[#6B7280] focus:border-gray-300"
          />
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl bg-white p-8 text-center text-sm text-[#6B7280] shadow-sm">Loading assignments...</div>
      ) : error ? (
        <div className="rounded-xl bg-white p-8 text-center text-sm text-red-600 shadow-sm">{error}</div>
      ) : filteredAssignments.length === 0 ? (
        <EmptyState onCreate={handleCreate} />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {filteredAssignments.map((item) => {
            const assignedOn = formatDate(item.assignedOn ?? item.createdAt);
            const dueDate = formatDate(item.dueDate ?? item.due);
            const isOpen = openDropdown?.id === item.id && openDropdown.open;

            return (
              <div key={item.id} className="relative rounded-xl bg-white p-5 shadow-sm" ref={isOpen ? menuRef : undefined}>
                <div className="flex items-start justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => router.push(`/assignments/${item.id}`)}
                    className="text-left text-lg font-bold text-[#1A1A1A] underline underline-offset-4"
                  >
                    {formatAssignmentTitle(item)}
                  </button>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(isOpen ? null : { id: item.id, open: true })}
                      className="rounded-md p-1 text-[#6B7280] hover:bg-gray-100"
                      aria-label="Open assignment menu"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </button>

                    {isOpen ? (
                      <div className="absolute right-0 top-8 z-20 w-44 rounded-lg border border-gray-100 bg-white p-2 shadow-lg">
                        <button
                          type="button"
                          onClick={() => router.push(`/assignments/${item.id}`)}
                          className="w-full rounded-md px-3 py-2 text-left text-sm text-[#1A1A1A] hover:bg-gray-50"
                        >
                          View Assignment
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDelete(item.id)}
                          className="w-full rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-xs text-[#6B7280]">
                  <span>Assigned on : {assignedOn}</span>
                  <span>Due : {dueDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pointer-events-none fixed bottom-6 left-1/2 z-10 -translate-x-1/2">
        <button
          type="button"
          onClick={handleCreate}
          className="pointer-events-auto rounded-full bg-[#1A1A1A] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-black"
        >
          + Create Assignment
        </button>
      </div>
    </div>
  );
}