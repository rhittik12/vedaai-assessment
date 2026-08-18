"use client";

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { format, formatDistanceToNowStrict, isValid, parseISO } from 'date-fns';
import {
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  Clock3,
  FileText,
  FolderOpen,
  Plus,
  Sparkles,
  AlertTriangle,
  Users2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import { type Assignment, useAppStore } from '@/store/useAppStore';

type DashboardAssignment = Assignment & {
  fileName?: string;
  assignedOn?: string;
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
  due?: string;
};

type ActivityTone = 'green' | 'orange' | 'blue' | 'red';

type ActivityItem = {
  id: string;
  label: string;
  tone: ActivityTone;
  timestamp?: string;
};

const quickActions = [
  {
    title: 'Create Assignment',
    description: 'Build a new paper with AI support.',
    icon: Plus,
    iconClassName: 'bg-[#F9FAFB] text-[#1A1A1A]',
    href: '/assignments/create'
  },
  {
    title: "AI Teacher's Toolkit",
    description: 'Access planning and generation tools.',
    icon: Sparkles,
    iconClassName: 'bg-[#FEF3E8] text-[#F26522]',
    href: '/toolkit'
  },
  {
    title: 'My Library',
    description: 'Open your saved resources.',
    icon: FolderOpen,
    iconClassName: 'bg-[#F9FAFB] text-[#1A1A1A]',
    href: '/library'
  },
  {
    title: 'My Groups',
    description: 'Manage your teaching groups.',
    icon: Users2,
    iconClassName: 'bg-[#EFF6FF] text-[#3B82F6]',
    href: '/groups'
  }
] as const;

function formatAssignmentTitle(item: DashboardAssignment): string {
  return item.title?.trim() || item.fileName?.replace(/\.[^.]+$/, '') || 'Untitled Assignment';
}

function formatDate(value?: string): string {
  if (!value) return '--.--.----';

  const parsed = parseISO(value);
  if (!isValid(parsed)) return '--.--.----';

  return format(parsed, 'dd-MM-yyyy');
}

function formatRelativeTime(value?: string): string {
  if (!value) return 'just now';

  const parsed = parseISO(value);
  if (!isValid(parsed)) return 'just now';

  return formatDistanceToNowStrict(parsed, { addSuffix: true });
}

function getStatusMeta(status?: DashboardAssignment['status']) {
  switch (status) {
    case 'completed':
      return {
        label: 'Completed',
        className: 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]',
        icon: CheckCircle2
      };
    case 'processing':
      return {
        label: 'Processing',
        className: 'bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]',
        icon: Clock3
      };
    case 'failed':
      return {
        label: 'Failed',
        className: 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]',
        icon: AlertTriangle
      };
    default:
      return {
        label: 'Pending',
        className: 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]',
        icon: Clock3
      };
  }
}

function getActivityToneClass(tone: ActivityTone) {
  switch (tone) {
    case 'green':
      return 'bg-[#16A34A]';
    case 'orange':
      return 'bg-[#F26522]';
    case 'blue':
      return 'bg-[#3B82F6]';
    case 'red':
      return 'bg-[#DC2626]';
    default:
      return 'bg-[#9CA3AF]';
  }
}

export default function OverviewPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  const router = useRouter();
  const assignments = useAppStore((state) => state.assignments);
  const setAssignments = useAppStore((state) => state.setAssignments);
  const [dashboardAssignments, setDashboardAssignments] = useState<DashboardAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadAssignments = async () => {
      try {
        setLoading(true);
        const response = await axios.get<{ assignments?: DashboardAssignment[] } | DashboardAssignment[]>(`${apiUrl}/api/assignments`);
        const items = Array.isArray(response.data) ? response.data : response.data.assignments ?? [];

        if (mounted) {
          setAssignments(
            items.map((item) => ({
              id: item.id,
              title: item.title ?? formatAssignmentTitle(item),
              fileName: item.fileName,
              status: item.status
            }))
          );
          setDashboardAssignments(items);
          setError(null);
        }
      } catch {
        if (mounted) {
          setError('Unable to load assignments.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadAssignments();

    return () => {
      mounted = false;
    };
  }, [apiUrl, setAssignments]);

  const summary = useMemo(() => {
    const totalAssignments = assignments.length;
    const completed = assignments.filter((item) => item.status === 'completed').length;
    const pending = assignments.filter((item) => item.status === 'pending' || item.status === 'processing').length;

    return {
      totalAssignments,
      completed,
      pending,
      myGroups: 4
    };
  }, [assignments]);

  const recentAssignments = useMemo(() => dashboardAssignments.slice(0, 3), [dashboardAssignments]);

  const recentActivity = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];

    dashboardAssignments.forEach((assignment) => {
      const baseTimestamp = assignment.createdAt ?? assignment.updatedAt;

      if (baseTimestamp) {
        items.push({
          id: `${assignment.id}-created`,
          label: `Created assignment ${formatAssignmentTitle(assignment)}`,
          tone: 'orange',
          timestamp: baseTimestamp
        });
      }

      if (assignment.status === 'processing') {
        items.push({
          id: `${assignment.id}-processing`,
          label: `Assignment ${formatAssignmentTitle(assignment)} is processing`,
          tone: 'blue',
          timestamp: assignment.updatedAt ?? assignment.createdAt
        });
      }

      if (assignment.status === 'completed') {
        items.push({
          id: `${assignment.id}-completed`,
          label: `Completed assignment ${formatAssignmentTitle(assignment)}`,
          tone: 'green',
          timestamp: assignment.updatedAt ?? assignment.createdAt
        });
      }

      if (assignment.status === 'failed') {
        items.push({
          id: `${assignment.id}-failed`,
          label: `Generation failed for ${formatAssignmentTitle(assignment)}`,
          tone: 'red',
          timestamp: assignment.updatedAt ?? assignment.createdAt
        });
      }
    });

    return items
      .filter((item) => item.timestamp)
      .sort((a, b) => {
        const left = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const right = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return right - left;
      })
      .slice(0, 6);
  }, [dashboardAssignments]);

  return (
    <div className="page-shell">
      <div>
        <div className="page-kicker"><span className="h-2 w-2 rounded-full bg-emerald-500" />Teaching workspace</div>
        <h1 className="page-title">Good morning, John.</h1>
        <p className="page-description">Here&apos;s a clear view of what needs your attention and what VedaAI can help you create next.</p>
      </div>

      <section className="surface overflow-hidden bg-[#172033] px-6 py-6 text-white sm:px-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[#ffb28b]">Your week at a glance</p>
            <h2 className="mt-2 text-2xl font-bold tracking-[-.03em] text-white">Turn curriculum into ready-to-use assessments.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
              You have 3 assignments due this week. Let AI help you create them faster.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: 'Total Assignments',
            value: summary.totalAssignments,
            subtext: 'All assignments in your workspace',
            icon: FileText,
            iconClassName: 'bg-[#F3F4F6] text-[#6B7280]'
          },
          {
            label: 'Completed',
            value: summary.completed,
            subtext: 'Ready and finished',
            icon: CheckCircle2,
            iconClassName: 'bg-[#F0FDF4] text-[#16A34A]'
          },
          {
            label: 'Pending',
            value: summary.pending,
            subtext: 'Queued or being processed',
            icon: Clock3,
            iconClassName: 'bg-[#FFF7ED] text-[#EA580C]'
          },
          {
            label: 'My Groups',
            value: summary.myGroups,
            subtext: 'Current teaching groups',
            icon: Users2,
            iconClassName: 'bg-[#EFF6FF] text-[#3B82F6]'
          }
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <article key={stat.label} className="surface px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.iconClassName}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="mt-4 text-xs font-medium text-[#6B7280]">{stat.label}</div>
              <div className="mt-1 text-3xl font-bold tracking-tight text-[#1A1A1A]">{stat.value}</div>
              <div className="mt-1 text-xs text-[#9CA3AF]">{stat.subtext}</div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-3">
          <article className="surface p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-[#1A1A1A]">Recent Assignments</h3>
              <button
                type="button"
                onClick={() => router.push('/assignments')}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[#F26522]"
              >
                View all <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {recentAssignments.length > 0 ? (
                recentAssignments.map((assignment) => {
                  const statusMeta = getStatusMeta(assignment.status ?? 'pending');
                  const StatusIcon = statusMeta.icon;

                  return (
                    <article key={assignment.id} className="rounded-[10px] border-[0.5px] border-[#e5e5e5] bg-white px-4 py-3 shadow-sm">
                      <div className="flex items-start justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => router.push(`/assignments/${assignment.id}`)}
                          className="text-left text-sm font-bold text-[#1A1A1A] underline underline-offset-4"
                        >
                          {formatAssignmentTitle(assignment)}
                        </button>

                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusMeta.className}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusMeta.label}
                        </span>
                      </div>

                      <div className="mt-4 flex flex-col gap-1 text-[11.5px] text-[#6B7280] sm:flex-row sm:items-center sm:justify-between">
                        <span>Assigned on : {formatDate(assignment.assignedOn ?? assignment.createdAt)}</span>
                        <span>Due : {formatDate(assignment.dueDate ?? assignment.due)}</span>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-[10px] border-[0.5px] border-[#e5e5e5] bg-white px-4 py-4 text-sm text-[#6B7280]">
                  No assignments yet. Create your first one.
                </div>
              )}
            </div>
          </article>

          <article className="surface p-5 sm:p-6">
            <h3 className="text-lg font-bold text-[#1A1A1A]">Recent Activity</h3>

            <div className="mt-4 divide-y divide-[#e5e5e5]">
              {recentActivity.length > 0 ? (
                recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <span className={`mt-[6px] h-[7px] w-[7px] rounded-full ${getActivityToneClass(item.tone)}`} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-[#1A1A1A]">{item.label}</div>
                      <div className="mt-1 text-xs text-[#9CA3AF]">{formatRelativeTime(item.timestamp)}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-3 text-sm text-[#6B7280]">No recent activity yet.</div>
              )}
            </div>
          </article>
        </div>

        <article className="surface p-5 sm:p-6">
          <h3 className="text-lg font-bold text-[#1A1A1A]">Quick Actions</h3>

          <div className="mt-4 space-y-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.title}
                  type="button"
                  onClick={() => router.push(action.href)}
                  className="flex w-full items-center gap-3 rounded-[10px] border-[0.5px] border-[#e5e5e5] bg-white px-4 py-[13px] text-left transition hover:bg-[#F9F9F9]"
                >
                  <div className={`flex h-[34px] w-[34px] items-center justify-center rounded-lg ${action.iconClassName}`}>
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-[#1A1A1A]">{action.title}</div>
                    <div className="text-xs text-[#6B7280]">{action.description}</div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
                </button>
              );
            })}
          </div>
        </article>
      </section>

      {loading ? <div className="surface-muted px-4 py-3 text-sm text-[#667085]">Loading your teaching overview…</div> : null}
      {error ? <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
    </div>
  );
}
