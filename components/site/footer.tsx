import Link from 'next/link';
import { Github, Linkedin, Mail, ArrowUpRight } from 'lucide-react';
import type { Profile } from '@/lib/types';

const iconFor = (label: string) => {
  const key = label.toLowerCase();
  if (key.includes('git')) return Github;
  if (key.includes('link')) return Linkedin;
  return Mail;
};

export default function Footer({ profile }: { profile: Profile }) {
  const year = new Date().getFullYear();
  const socials = profile.socials ?? [];

  return (
    <footer className="border-t border-border bg-[hsl(var(--surface))]">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl font-semibold">{profile.name}</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">{profile.title}</p>
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="mt-5 inline-flex items-center gap-1.5 font-mono text-sm text-primary transition-colors hover:text-foreground"
            >
              {profile.email}
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            </a>
          )}
        </div>

        <nav aria-label="Footer">
          <h2 className="font-display text-sm font-semibold">Sections</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
            {[
              ['#about', 'About'],
              ['#skills', 'Skills'],
              ['#experience', 'Experience'],
              ['#work', 'Work'],
              ['#contact', 'Contact'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="transition-colors hover:text-foreground">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-sm font-semibold">Elsewhere</h2>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm text-muted-foreground">
            {socials.map((social) => {
              const Icon = iconFor(social.label);
              return (
                <li key={social.url}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {social.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted-foreground sm:flex-row">
          <p>
            &copy; {year} {profile.name}. All rights reserved.
          </p>
          <p className="font-mono">Built with Next.js, Tailwind CSS and Node.js</p>
        </div>
      </div>
    </footer>
  );
}
