'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Award,
  Briefcase,
  ExternalLink,
  FileText,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  Sparkles,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/misc';
import { cn } from '@/lib/utils';
import { useAuth } from './auth-context';

const nav = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/skills', label: 'Skills', icon: Sparkles },
  { href: '/dashboard/experience', label: 'Experience', icon: Briefcase },
  { href: '/dashboard/projects', label: 'Projects', icon: FolderKanban },
  { href: '/dashboard/education', label: 'Education', icon: GraduationCap },
  { href: '/dashboard/certifications', label: 'Certifications', icon: Award },
  { href: '/dashboard/resume', label: 'Resume', icon: FileText },
  { href: '/dashboard/messages', label: 'Messages', icon: Mail },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, status, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (status === 'loading') {
    return (
      <div className="grid min-h-[100dvh] place-items-center">
        <Spinner label="Checking your session" />
      </div>
    );
  }

  if (status === 'anonymous') {
    return (
      <div className="grid min-h-[100dvh] place-items-center">
        <Spinner label="Redirecting to sign in" />
      </div>
    );
  }

  const current = nav.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)
  );

  return (
    <div className="flex min-h-[100dvh] bg-background">
      {/* sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col border-r border-border bg-[hsl(var(--surface))] transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border px-5">
          <Image src="/imgs/logo.png" alt="" width={28} height={28} className="h-7 w-7 object-contain" />
          <span className="font-display text-sm font-semibold">Portfolio admin</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Dashboard">
          <ul className="space-y-0.5">
            {nav.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                      active
                        ? 'bg-primary/12 text-foreground'
                        : 'text-muted-foreground hover:bg-surface-raised hover:text-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            View live site
          </Link>
        </div>
      </aside>

      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
        />
      )}

      {/* main column */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/90 px-5 backdrop-blur-xl sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <h1 className="truncate font-display text-base font-semibold">
              {current?.label ?? 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium leading-tight">{user?.name}</p>
              <p className="font-mono text-[11px] leading-tight text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Sign out">
              <LogOut />
            </Button>
          </div>
        </header>

        <main className="flex-1 px-5 py-7 sm:px-7">{children}</main>
      </div>
    </div>
  );
}

