import Image from 'next/image';
import { Reveal } from '@/components/site/reveal';
import type { Profile } from '@/lib/types';

export default function About({
  profile,
  stats,
}: {
  profile: Profile;
  stats: { value: string; label: string }[];
}) {
  const paragraphs = (profile.bio || profile.summary || '')
    .split('\n')
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <section id="about" className="container-page scroll-mt-24 py-24 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-[320px_1fr] lg:gap-16">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <div className="relative mx-auto w-full max-w-[280px] lg:mx-0">
            <div
              aria-hidden
              className="absolute -inset-3 -z-10 rounded-[1.75rem] bg-gradient-to-br from-primary/25 to-secondary/15 blur-2xl"
            />
            <Image
              src={profile.avatar?.url || '/imgs/fazil.png'}
              alt={`Portrait of ${profile.name}`}
              width={560}
              height={700}
              sizes="(max-width: 1024px) 280px, 320px"
              className="aspect-[4/5] w-full rounded-2xl border border-border object-cover object-[center_28%]"
            />
          </div>

          <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 lg:grid-cols-1 lg:gap-y-4">
            {stats.map((stat) => (
              <div key={stat.label} className="border-l-2 border-primary/50 pl-3.5">
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-display text-2xl font-semibold leading-none">
                    {stat.value}
                  </span>
                  <span className="mt-1.5 block text-xs text-muted-foreground">{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <div>
          <Reveal>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              About
            </h2>
          </Reveal>

          <div className="mt-6 space-y-5">
            {paragraphs.map((text, i) => (
              <Reveal key={i} delay={i * 0.05}>
                <p className="max-w-[65ch] text-base leading-relaxed text-muted-foreground">
                  {text}
                </p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <dl className="mt-10 grid gap-x-10 gap-y-5 border-t border-border pt-8 sm:grid-cols-2">
              {[
                profile.location && { term: 'Based in', value: profile.location },
                profile.email && { term: 'Email', value: profile.email, href: `mailto:${profile.email}` },
                profile.phone && { term: 'Phone', value: profile.phone, href: `tel:${profile.phone.replace(/\s/g, '')}` },
                profile.availability && { term: 'Status', value: profile.availability },
              ]
                .filter(Boolean)
                .map((item) => {
                  const row = item as { term: string; value: string; href?: string };
                  return (
                    <div key={row.term}>
                      <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                        {row.term}
                      </dt>
                      <dd className="mt-1 font-mono text-sm">
                        {row.href ? (
                          <a href={row.href} className="transition-colors hover:text-primary">
                            {row.value}
                          </a>
                        ) : (
                          row.value
                        )}
                      </dd>
                    </div>
                  );
                })}
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
