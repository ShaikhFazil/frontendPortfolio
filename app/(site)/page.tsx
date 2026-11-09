import type { Metadata } from 'next';
import Hero from '@/components/sections/hero';
import TechMarquee from '@/components/sections/tech-marquee';
import About from '@/components/sections/about';
import Skills from '@/components/sections/skills';
import Experience from '@/components/sections/experience';
import Projects from '@/components/sections/projects';
import Education from '@/components/sections/education';
import ResumeBand from '@/components/sections/resume-band';
import Contact from '@/components/sections/contact';
import { getPortfolio } from '@/lib/api';

/**
 * Rendered on the server and cached, then revalidated in the background, so the
 * page is fully indexable and dashboard edits appear without a redeploy.
 */
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPortfolio();
  return {
    title: `${profile.name} | ${profile.title}`,
    description: profile.summary || profile.tagline,
  };
}

export default async function HomePage() {
  const data = await getPortfolio();
  const { profile, skills, experience, projects, education, certifications, resume } = data;

  const stats = [
    profile.yearsOfExperience
      ? { value: `${profile.yearsOfExperience}+`, label: 'Years building for the web' }
      : null,
    experience.length ? { value: `${experience.length}`, label: 'Engineering roles' } : null,
    projects.length ? { value: `${projects.length}`, label: 'Shipped projects' } : null,
    { value: '5,000+', label: 'Daily users on the booking platform' },
  ].filter(Boolean) as { value: string; label: string }[];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.title,
    description: profile.summary,
    email: profile.email ? `mailto:${profile.email}` : undefined,
    address: profile.location ? { '@type': 'PostalAddress', addressLocality: profile.location } : undefined,
    image: profile.avatar?.url,
    sameAs: (profile.socials || [])
      .map((s) => s.url)
      .filter((url) => !url.startsWith('mailto:')),
    knowsAbout: Array.from(new Set(skills.map((s) => s.name))).slice(0, 25),
    worksFor: experience
      .filter((e) => e.current)
      .map((e) => ({ '@type': 'Organization', name: e.company })),
    alumniOf: education.map((e) => ({ '@type': 'EducationalOrganization', name: e.institution })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // schema.org payload built from the same data the page renders
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Hero profile={profile} resumeUrl={resume?.url} />
      <TechMarquee />
      <About profile={profile} stats={stats} />
      <Skills skills={skills} />
      <Experience experience={experience} />
      <Projects projects={projects} />
      <Education education={education} certifications={certifications} />
      <ResumeBand resume={resume} />
      <Contact profile={profile} />
    </>
  );
}
