import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { Reveal } from '@/components/site/reveal';
import type { Experience as ExperienceType } from '@/lib/types';

function period(item: ExperienceType) {
  return `${item.startDate} - ${item.current ? 'Present' : item.endDate || 'Present'}`;
}

export default function Experience({ experience }: { experience: ExperienceType[] }) {
  if (!experience.length) return null;

  return (
    <section
      id="experience"
      className="scroll-mt-24 border-t border-border bg-[hsl(var(--surface))] py-24 sm:py-28"
    >
      <div className="container-page">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Where I&apos;ve worked
          </h2>
        </Reveal>

        <ol className="relative mt-12">
          {/* the rail */}
          <span
            aria-hidden
            className="absolute left-[7px] top-2 hidden h-[calc(100%-1rem)] w-px bg-gradient-to-b from-primary/60 via-border to-transparent sm:block"
          />

          {experience.map((item, index) => (
            <Reveal
              as="li"
              key={item._id || `${item.company}-${item.startDate}`}
              delay={Math.min(index * 0.06, 0.24)}
              className="relative pb-12 last:pb-0 sm:pl-10"
            >
              <span
                aria-hidden
                className="absolute left-0 top-2 hidden h-[15px] w-[15px] rounded-full border-2 border-background bg-primary sm:block"
              />

              <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
                <div className="flex items-start gap-3">
                  {item.companyLogo?.url && (
                    <Image
                      src={item.companyLogo.url}
                      alt=""
                      width={40}
                      height={40}
                      className="mt-0.5 h-10 w-10 shrink-0 rounded-lg border border-border bg-background object-contain p-1"
                    />
                  )}
                  <div>
                    <h3 className="font-display text-xl font-semibold">{item.role}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {item.companyUrl ? (
                        <a
                          href={item.companyUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1 text-primary transition-colors hover:text-foreground"
                        >
                          {item.company}
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                        </a>
                      ) : (
                        <span className="text-primary">{item.company}</span>
                      )}
                      {item.location ? ` · ${item.location}` : ''}
                    </p>
                  </div>
                </div>

                <p className="shrink-0 font-mono text-xs text-muted-foreground sm:pt-1.5">
                  {period(item)}
                </p>
              </div>

              {item.description && (
                <p className="mt-4 max-w-[65ch] text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              )}

              {item.achievements && item.achievements.length > 0 && (
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {item.achievements.map((achievement, i) => (
                    <li
                      key={i}
                      className="relative max-w-[55ch] pl-4 text-sm leading-relaxed text-foreground/80"
                    >
                      <span
                        aria-hidden
                        className="absolute left-0 top-[0.6em] h-1 w-1 rounded-full bg-primary"
                      />
                      {achievement}
                    </li>
                  ))}
                </ul>
              )}

              {item.technologies && item.technologies.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-1.5">
                  {item.technologies.map((tech) => (
                    <li
                      key={tech}
                      className="rounded-full border border-border bg-background px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              )}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
