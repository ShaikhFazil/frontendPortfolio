import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center gap-5 px-6 text-center">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        This page does not exist
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The link may be out of date, or the project was unpublished.
      </p>
      <Button asChild className="mt-2">
        <Link href="/">Back to the portfolio</Link>
      </Button>
    </main>
  );
}
