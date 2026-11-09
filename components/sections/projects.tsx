import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Github, Globe } from 'lucide-react';
import { Reveal } from '@/components/site/reveal';
import SectionHeading from '@/components/site/section-heading';
import { cn } from '@/lib/utils';
import type { Project } from '@/lib/types';

const slugFor = (project: Project) =>
  project.slug ||
  project.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/**
 * Projects without an uploaded thumbnail get a typographic tile rather than a
 * mocked-up screenshot. Real images go in from the dashboard.
 */
/**
 * Only rendered once a screenshot has been uploaded from the dashboard.
 * Projects without one stay text-only rather than showing a mocked-up frame.
 */
function ProjectVisual({ project, wide }: { project: Project; wide?: boolean }) {
  if (!project.thumbnail?.url) return null;

  return (
    <Image
      src={project.thumbnail.url}
      alt={`${project.title} screenshot`}
      width={1200}
      height={640}
      sizes={wide ? '(max-width: 768px) 100vw, 1136px' : '(max-width: 768px) 100vw, 560px'}
      className={cn(
        'w-full object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.03]',
        wide ? 'aspect-[21/8] max-h-[300px]' : 'aspect-[16/10] max-h-[280px]'
      )}
    />
  );
}

function ExternalLinks({ project }: { project: Project }) {
  if (!project.liveUrl && !project.githubUrl) return null;
  return (
    <div className="flex items-center gap-4 text-sm">
      {project.liveUrl && (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-primary transition-colors hover:text-foreground"
        >
          <Globe className="h-4 w-4" aria-hidden />
          Live site
        </a>
      )}
      {project.githubUrl && (
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Github className="h-4 w-4" aria-hidden />
          Code
        </a>
      )}
    </div>
  );
}

export default function Projects({ projects }: { projects: Project[] }) {
  if (!projects.length) return null;

  const featured = projects.filter((p) => p.featured).slice(0, 4);
  const rest = projects.filter((p) => !featured.includes(p));

  return (
    <section id="work" className="scroll-mt-24 border-t border-border py-24 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Selected work"
          title="Things I have built"
          body="Platforms, storefronts and internal tooling, plus the AI layer that sits on top of some of them."
        />

        {featured.length > 0 && (
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {featured.map((project, index) => (
              <Reveal
                as="article"
                key={project._id || project.title}
                delay={Math.min(index * 0.06, 0.2)}
                className={cn(
                  'group relative flex flex-col overflow-hidden rounded-2xl border border-border transition-colors duration-300 hover:border-primary/40',
                  project.thumbnail?.url
                    ? 'bg-[hsl(var(--surface))]'
                    : 'bg-gradient-to-br from-primary/10 via-[hsl(var(--surface))] to-[hsl(var(--surface))]',
                  // first tile runs full width so the grid has rhythm instead of a 2x2 block
                  index === 0 && featured.length > 2 && 'md:col-span-2'
                )}
              >
                {project.thumbnail?.url && (
                  <Link href={`/work/${slugFor(project)}`} className="block overflow-hidden">
                    <ProjectVisual project={project} wide={index === 0 && featured.length > 2} />
                  </Link>
                )}

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                    {project.category}
                    {project.year && <span>· {project.year}</span>}
                  </div>

                  <h3 className="mt-2.5 font-display text-xl font-semibold">
                    <Link
                      href={`/work/${slugFor(project)}`}
                      className="inline-flex items-start gap-1 transition-colors hover:text-primary"
                    >
                      {project.title}
                      <ArrowUpRight
                        className="mt-1 h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden
                      />
                    </Link>
                  </h3>

                  {project.summary && (
                    <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
                      {project.summary}
                    </p>
                  )}

                  {project.technologies && project.technologies.length > 0 && (
                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {project.technologies.slice(0, 6).map((tech) => (
                        <li
                          key={tech}
                          className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted-foreground"
                        >
                          {tech}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-5 pt-1">
                    <ExternalLinks project={project} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        {rest.length > 0 && (
          <div className="mt-14">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              More work
            </h3>
            <ul className="mt-5 grid border-t border-border sm:grid-cols-2 sm:gap-x-10">
              {rest.map((project, index) => (
                <Reveal
                  as="li"
                  key={project._id || project.title}
                  delay={Math.min(index * 0.04, 0.2)}
                >
                  <Link
                    href={`/work/${slugFor(project)}`}
                    className="group flex items-center justify-between gap-4 border-b border-border py-4 transition-colors hover:text-primary"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{project.title}</span>
                      <span className="mt-0.5 block font-mono text-xs text-muted-foreground">
                        {project.category}
                      </span>
                    </span>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                      aria-hidden
                    />
                  </Link>
                </Reveal>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
