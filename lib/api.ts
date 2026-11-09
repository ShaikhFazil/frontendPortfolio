// This module is used by server-rendered pages; avoid an unresolved side-effect
// import here when the server-only package declarations are unavailable.
import type { PortfolioData } from './types';
import { fallbackPortfolio } from './fallback';

/**
 * Public API base URL. NEXT_PUBLIC_* values are replaced with literal strings
 * when `next build` runs, so this holds whatever was set at BUILD time, not at
 * container start. In production it is https://<your-domain>/api.
 */
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
).replace(/\/$/, '');

/**
 * Base URL used by the functions in this file only.
 *
 * Everything here runs on the server (inside the frontend container), never in
 * the browser, so it can call the backend directly over the private Docker
 * network: http://backend:5000/api. That avoids a pointless round trip out to
 * the public internet and back through Nginx, and it keeps server rendering
 * working even while DNS or the certificate is still being set up.
 *
 * API_INTERNAL_URL has no NEXT_PUBLIC_ prefix, so it is read at RUN time and
 * can be set in docker-compose. If it is unset, this falls back to the public
 * URL, which is what you want when running `npm run dev` on your laptop.
 */
const SERVER_API_URL = (process.env.API_INTERNAL_URL || API_URL).replace(/\/$/, '');

/** How long a cached page stays fresh before Next revalidates it in the background. */
export const REVALIDATE_SECONDS = Number(process.env.NEXT_PUBLIC_REVALIDATE || 60);

type FetchOptions = { revalidate?: number; tags?: string[] };

async function getJSON<T>(path: string, opts: FetchOptions = {}): Promise<T | null> {
  try {
    const res = await fetch(`${SERVER_API_URL}${path}`, {
      headers: { Accept: 'application/json' },
      next: {
        revalidate: opts.revalidate ?? REVALIDATE_SECONDS,
        ...(opts.tags ? { tags: opts.tags } : {}),
      },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return (body?.data ?? null) as T;
  } catch {
    // network error, API down, DNS failure: the caller falls back to bundled content
    return null;
  }
}

/**
 * Single request that feeds the whole public homepage.
 * Falls back to bundled content so the page is never blank and stays indexable.
 */
export async function getPortfolio(): Promise<PortfolioData> {
  const data = await getJSON<PortfolioData>('/portfolio', { tags: ['portfolio'] });

  if (!data || !data.profile) return fallbackPortfolio;

  return {
    profile: data.profile,
    skills: data.skills ?? [],
    experience: data.experience ?? [],
    projects: data.projects ?? [],
    education: data.education ?? [],
    certifications: data.certifications ?? [],
    resume: data.resume ?? fallbackPortfolio.resume,
    isFallback: false,
  };
}

export async function getProjectBySlug(slug: string) {
  const live = await getJSON<PortfolioData['projects'][number]>(
    `/projects/${encodeURIComponent(slug)}`,
    { tags: ['portfolio', `project:${slug}`] }
  );
  if (live) return live;

  return (
    fallbackPortfolio.projects.find(
      (p) => (p.slug || slugify(p.title)) === slug
    ) ?? null
  );
}

export async function getAllProjects() {
  const data = await getJSON<PortfolioData['projects']>('/projects', { tags: ['portfolio'] });
  return data && data.length ? data : fallbackPortfolio.projects;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
