'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Award,
  Briefcase,
  FileText,
  FolderKanban,
  GraduationCap,
  Mail,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { Badge, ErrorState, Skeleton } from '@/components/ui/misc';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/client-api';
import type { DashboardStats } from '@/lib/types';

const cards = [
  { key: 'projects', label: 'Projects', icon: FolderKanban, href: '/dashboard/projects' },
  { key: 'skills', label: 'Skills', icon: Sparkles, href: '/dashboard/skills' },
  { key: 'experience', label: 'Roles', icon: Briefcase, href: '/dashboard/experience' },
  { key: 'education', label: 'Education', icon: GraduationCap, href: '/dashboard/education' },
  { key: 'certifications', label: 'Certifications', icon: Award, href: '/dashboard/certifications' },
  { key: 'messages', label: 'Messages', icon: Mail, href: '/dashboard/messages' },
] as const;

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Never';

export default function OverviewPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setStats(await api.get<DashboardStats>('/stats'));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load dashboard stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-7">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[104px]" />
          ))}
        </div>
        <Skeleton className="h-[220px]" />
      </div>
    );
  }

  if (error || !stats) return <ErrorState message={error || 'No data'} onRetry={load} />;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl font-semibold">Everything at a glance</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Counts come straight from the database. Edits go live on the public site within a minute.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => {
          const count = stats.counts[card.key as keyof DashboardStats['counts']] ?? 0;
          const unread = card.key === 'messages' ? stats.counts.unreadMessages : 0;
          return (
            <Link
              key={card.key}
              href={card.href}
              className="group rounded-2xl border border-border bg-[hsl(var(--surface))] p-5 transition-colors hover:border-primary/40"
            >
              <div className="flex items-start justify-between">
                <card.icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden />
                {unread > 0 && <Badge tone="accent">{unread} unread</Badge>}
              </div>
              <p className="mt-4 font-display text-3xl font-semibold leading-none">{count}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{card.label}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        {/* resume status */}
        <section className="rounded-2xl border border-border bg-[hsl(var(--surface))] p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-display text-base font-semibold">
              <FileText className="h-4 w-4 text-primary" aria-hidden />
              Resume
            </h3>
            {stats.resume ? (
              <Badge tone="success">Active</Badge>
            ) : (
              <Badge tone="warning">Not uploaded</Badge>
            )}
          </div>

          {stats.resume ? (
            <div className="mt-4 space-y-1.5 text-sm">
              <p className="truncate font-mono text-xs text-muted-foreground">
                {stats.resume.fileName}
              </p>
              <p className="text-muted-foreground">
                Updated {formatDate(stats.resume.updatedAt)}
              </p>
              <p className="text-muted-foreground">
                {stats.counts.resumeVersions} version
                {stats.counts.resumeVersions === 1 ? '' : 's'} stored
              </p>
            </div>
          ) : (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/5 p-3 text-sm text-foreground/85">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
              <p>
                The public site is falling back to the PDF bundled with the frontend. Upload a
                resume to take control of it from here.
              </p>
            </div>
          )}

          <Button asChild variant="subtle" size="sm" className="mt-5">
            <Link href="/dashboard/resume">Manage resume</Link>
          </Button>
        </section>

        {/* recent activity */}
        <section className="rounded-2xl border border-border bg-[hsl(var(--surface))] p-5">
          <h3 className="font-display text-base font-semibold">Latest updates</h3>

          <div className="mt-4 space-y-5 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Projects</p>
              <ul className="mt-2 space-y-1.5">
                {stats.recent.projects.length ? (
                  stats.recent.projects.map((project) => (
                    <li key={project._id} className="flex justify-between gap-4">
                      <span className="truncate">{project.title}</span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {formatDate(project.updatedAt)}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground">Nothing yet</li>
                )}
              </ul>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Messages</p>
              <ul className="mt-2 space-y-1.5">
                {stats.recent.messages.length ? (
                  stats.recent.messages.map((message) => (
                    <li key={message._id} className="flex justify-between gap-4">
                      <span className="truncate">
                        {message.name}
                        {message.subject ? `: ${message.subject}` : ''}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {message.read ? '' : 'new · '}
                        {formatDate(message.createdAt)}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-muted-foreground">No messages yet</li>
                )}
              </ul>
            </div>

            <p className="border-t border-border pt-4 text-xs text-muted-foreground">
              Profile last edited {formatDate(stats.profileUpdatedAt)}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
