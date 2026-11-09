import Image from 'next/image';

/**
 * The one marquee on the page. Logos only, no labels, no links:
 * it reads as a texture strip under the hero, not as navigation.
 * Pauses for anyone who prefers reduced motion (see globals.css).
 */
const logos = [
  { src: '/skills/javascript.svg', name: 'JavaScript' },
  { src: '/skills/typescript.svg', name: 'TypeScript' },
  { src: '/skills/react.svg', name: 'React' },
  { src: '/skills/nextJS.svg', name: 'Next.js' },
  { src: '/skills/tailwind.svg', name: 'Tailwind CSS' },
  { src: '/skills/mongoDB.svg', name: 'MongoDB' },
  { src: '/skills/postgresql.svg', name: 'PostgreSQL' },
  { src: '/skills/docker.svg', name: 'Docker' },
  { src: '/skills/git.svg', name: 'Git' },
  { src: '/skills/firebase.svg', name: 'Firebase' },
  { src: '/skills/vitejs.svg', name: 'Vite' },
  { src: '/skills/figma.svg', name: 'Figma' },
];

export default function TechMarquee() {
  const strip = [...logos, ...logos];

  return (
    <section aria-label="Technologies" className="border-y border-border bg-[hsl(var(--surface))] py-8">
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[hsl(var(--surface))] to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[hsl(var(--surface))] to-transparent"
        />
        <ul className="flex w-max animate-marquee items-center gap-14 px-7">
          {strip.map((logo, i) => (
            <li key={`${logo.name}-${i}`} className="shrink-0">
              <Image
                src={logo.src}
                alt={i < logos.length ? logo.name : ''}
                aria-hidden={i >= logos.length}
                width={36}
                height={36}
                className="h-9 w-9 opacity-55 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
