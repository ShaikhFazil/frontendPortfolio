import { Reveal } from './reveal';
import { cn } from '@/lib/utils';

export default function SectionHeading({
  eyebrow,
  title,
  body,
  align = 'left',
  className,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <Reveal className={cn(align === 'center' && 'text-center', className)}>
      {eyebrow && (
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      )}
      <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {body && (
        <p
          className={cn(
            'mt-4 max-w-[60ch] text-base leading-relaxed text-muted-foreground',
            align === 'center' && 'mx-auto'
          )}
        >
          {body}
        </p>
      )}
    </Reveal>
  );
}
