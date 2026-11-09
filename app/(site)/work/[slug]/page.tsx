import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Github, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllProjects, getProjectBySlug, slugify } from '@/lib/api';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((project) => ({ slug: project.slug || slugify(project.title) }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) return { title: 'Project not found' };

  return {
    title: project.title,
    description: project.summary || project.description?.slice(0, 160),
    alternates: { canonical: `/work/${project.slug || slugify(project.title)}` },
    openGraph: {
      title: project.title,
      description: project.summary,
      images: project.thumbnail?.url ? [{ url: project.thumbnail.url }] : undefined,
    },
  };
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  const gallery = project.images?.filter((img) => img.url) ?? [];

  return (
    <article className="container-page py-28">
      <Link
        href="/#work"
        className="inline-flex items-center gap-2 font-mono text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All work
      </Link>

      <header className="mt-8 max-w-3xl">
        <p className="font-mono text-xs text-primary">
          {project.category}
          {project.year ? ` · ${project.year}` : ''}
        </p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {project.title}
        </h1>
        {project.summary && (
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{project.summary}</p>
        )}

        {(project.liveUrl || project.githubUrl) && (
          <div className="mt-7 flex flex-wrap gap-3">
            {project.liveUrl && (
              <Button asChild>
                <a href={project.liveUrl} target="_blank" rel="noreferrer noopener">
                  <Globe aria-hidden />
                  Visit site
                </a>
              </Button>
            )}
            {project.githubUrl && (
              <Button asChild variant="outline">
                <a href={project.githubUrl} target="_blank" rel="noreferrer noopener">
                  <Github aria-hidden />
                  Source
                </a>
              </Button>
            )}
          </div>
        )}
      </header>

      {project.thumbnail?.url && (
        <Image
          src={project.thumbnail.url}
          alt={`${project.title} screenshot`}
          width={1400}
          height={880}
          priority
          sizes="(max-width: 1200px) 100vw, 1200px"
          className="mt-12 w-full rounded-2xl border border-border object-cover"
        />
      )}

      <div className="mt-14 grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
        <div>
          {project.description && (
            <div className="max-w-[65ch] space-y-4">
              {project.description
                .split('\n')
                .map((p) => p.trim())
                .filter(Boolean)
                .map((paragraph, i) => (
                  <p key={i} className="text-base leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
            </div>
          )}

          {gallery.length > 0 && (
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {gallery.map((image, i) => (
                <Image
                  key={image.url}
                  src={image.url!}
                  alt={image.alt || `${project.title} screenshot ${i + 1}`}
                  width={900}
                  height={600}
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="w-full rounded-xl border border-border object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
          {project.features && project.features.length > 0 && (
            <div>
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Key features
              </h2>
              <ul className="mt-4 space-y-2.5">
                {project.features.map((feature) => (
                  <li key={feature} className="relative pl-4 text-sm leading-relaxed text-foreground/85">
                    <span
                      aria-hidden
                      className="absolute left-0 top-[0.6em] h-1 w-1 rounded-full bg-primary"
                    />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project.technologies && project.technologies.length > 0 && (
            <div>
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Stack
              </h2>
              <ul className="mt-4 flex flex-wrap gap-1.5">
                {project.technologies.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-full border border-border bg-[hsl(var(--surface))] px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
