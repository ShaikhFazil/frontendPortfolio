import { Reveal } from '@/components/site/reveal';
import { cn } from '@/lib/utils';
import type { Skill } from '@/lib/types';

/* Emphasis order: the AI work leads, the rest follows the resume. */
const CATEGORY_ORDER = [
  'AI, LLMs & Generative AI',
  'Frontend',
  'Backend',
  'Databases',
  'Languages',
  'State Management & APIs',
  'DevOps & Tools',
];

const BLURBS: Record<string, string> = {
  'AI, LLMs & Generative AI': 'Retrieval, agents and tool calling wired into real product flows.',
  Frontend: 'Component systems and render strategy, measured on real devices.',
  Backend: 'Service boundaries, API contracts and the queries behind them.',
  Databases: 'Schema design, indexes and the caching layer in front.',
  Languages: 'What the work is written in.',
  'State Management & APIs': 'Client state that stays predictable as an app grows.',
  'DevOps & Tools': 'Build, ship, observe.',
};

/** Lays cells out on a 6-column grid so every row is exactly full. */
function buildSpans(count: number) {
  const base = [3, 3, 2, 2, 2, 3, 3, 2, 2, 2, 3, 3];
  const spans = base.slice(0, count);
  const rows: number[][] = [];
  let current: number[] = [];
  let sum = 0;

  spans.forEach((span, index) => {
    if (sum + span > 6) {
      rows.push(current);
      current = [];
      sum = 0;
    }
    current.push(index);
    sum += span;
  });
  if (current.length) rows.push(current);

  rows.forEach((row) => {
    const total = row.reduce((acc, i) => acc + spans[i], 0);
    if (total < 6) spans[row[row.length - 1]] += 6 - total;
  });

  return spans;
}

export default function Skills({ skills }: { skills: Skill[] }) {
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: skills.filter((s) => s.category === category),
  })).filter((group) => group.items.length > 0);

  // any category the backend adds later still renders
  const extras = Array.from(new Set(skills.map((s) => s.category))).filter(
    (c) => !CATEGORY_ORDER.includes(c)
  );
  extras.forEach((category) =>
    grouped.push({ category, items: skills.filter((s) => s.category === category) })
  );

  if (!grouped.length) return null;
  const spans = buildSpans(grouped.length);

  return (
    <section id="skills" className="scroll-mt-24 border-t border-border py-24 sm:py-28">
      <div className="container-page">
        <Reveal>
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            What I work with
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {grouped.map((group, index) => {
            const isLead = index === 0;
            const isTextured = index === grouped.length - 1;

            return (
              <Reveal
                key={group.category}
                delay={Math.min(index * 0.05, 0.25)}
                className={cn(
                  'relative overflow-hidden rounded-2xl border border-border p-6',
                  isLead
                    ? 'bg-gradient-to-br from-primary/18 via-secondary/10 to-transparent'
                    : 'bg-[hsl(var(--surface))]',
                  spans[index] === 3 ? 'lg:col-span-3' : 'lg:col-span-2'
                )}
              >
                {isTextured && (
                  <span aria-hidden className="grid-texture pointer-events-none absolute inset-0 opacity-60" />
                )}

                <div className="relative">
                  <h3 className="font-display text-lg font-semibold">{group.category}</h3>
                  {BLURBS[group.category] && (
                    <p className="mt-1.5 text-sm text-muted-foreground">{BLURBS[group.category]}</p>
                  )}

                  <ul className="mt-5 flex flex-wrap gap-2">
                    {group.items.map((skill) => (
                      <li
                        key={`${group.category}-${skill.name}`}
                        className={cn(
                          'rounded-full border px-3 py-1 text-[13px] transition-colors',
                          skill.featured
                            ? 'border-primary/40 bg-primary/10 text-foreground'
                            : 'border-border bg-background/40 text-muted-foreground'
                        )}
                      >
                        {skill.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
