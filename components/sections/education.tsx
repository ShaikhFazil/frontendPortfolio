import { Award, GraduationCap, Trophy } from 'lucide-react';
import { Reveal } from '@/components/site/reveal';
import type { Certification, Education as EducationType } from '@/lib/types';

export default function Education({
  education,
  certifications,
}: {
  education: EducationType[];
  certifications: Certification[];
}) {
  if (!education.length && !certifications.length) return null;

  const certs = certifications.filter((c) => c.kind !== 'achievement');
  const achievements = certifications.filter((c) => c.kind === 'achievement');

  return (
    <section
      id="education"
      className="scroll-mt-24 border-t border-border bg-[hsl(var(--surface))] py-24 sm:py-28"
    >
      <div className="container-page grid gap-12 lg:grid-cols-2 lg:gap-16">
        {education.length > 0 && (
          <div>
            <Reveal>
              <h2 className="flex items-center gap-2.5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                <GraduationCap className="h-6 w-6 text-primary" aria-hidden />
                Education
              </h2>
            </Reveal>

            <ul className="mt-7 space-y-5">
              {education.map((item, index) => (
                <Reveal
                  as="li"
                  key={item._id || item.institution}
                  delay={index * 0.05}
                  className="rounded-2xl border border-border bg-background p-5"
                >
                  <p className="font-display text-base font-semibold">{item.qualification}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.institution}</p>
                  <p className="mt-2.5 font-mono text-xs text-muted-foreground">
                    {[item.startYear, item.endYear].filter(Boolean).join(' - ')}
                    {item.grade ? ` · ${item.grade}` : ''}
                  </p>
                  {item.description && (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                  )}
                </Reveal>
              ))}
            </ul>
          </div>
        )}

        {certifications.length > 0 && (
          <div className="space-y-10">
            {certs.length > 0 && (
              <div>
                <Reveal>
                  <h2 className="flex items-center gap-2.5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    <Award className="h-6 w-6 text-primary" aria-hidden />
                    Certifications
                  </h2>
                </Reveal>
                <ul className="mt-7 space-y-3">
                  {certs.map((item, index) => (
                    <Reveal as="li" key={item._id || item.name} delay={index * 0.05}>
                      <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3.5">
                        <div>
                          <p className="text-sm font-medium">{item.name}</p>
                          {(item.issuer || item.issueDate) && (
                            <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                              {[item.issuer, item.issueDate].filter(Boolean).join(' · ')}
                            </p>
                          )}
                        </div>
                        {item.credentialUrl && (
                          <a
                            href={item.credentialUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="shrink-0 font-mono text-xs text-primary transition-colors hover:text-foreground"
                          >
                            Verify
                          </a>
                        )}
                      </div>
                    </Reveal>
                  ))}
                </ul>
              </div>
            )}

            {achievements.length > 0 && (
              <div>
                <Reveal>
                  <h2 className="flex items-center gap-2.5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
                    <Trophy className="h-6 w-6 text-primary" aria-hidden />
                    Achievements
                  </h2>
                </Reveal>
                <ul className="mt-6 space-y-2.5">
                  {achievements.map((item, index) => (
                    <Reveal
                      as="li"
                      key={item._id || item.name}
                      delay={index * 0.05}
                      className="relative pl-4 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span
                        aria-hidden
                        className="absolute left-0 top-[0.6em] h-1 w-1 rounded-full bg-primary"
                      />
                      {item.name}
                    </Reveal>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
