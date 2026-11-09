'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { useAuth } from '@/components/dashboard/auth-context';
import { ApiError } from '@/lib/client-api';

export default function LoginPage() {
  const { login, status } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') window.location.replace('/dashboard');
  }, [status]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Could not sign in. Please try again.'
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative grid min-h-[100dvh] place-items-center px-5 py-12">
      <div aria-hidden className="grid-texture pointer-events-none absolute inset-0" />

      <div className="relative w-full max-w-sm">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Back to the site
        </Link>

        <div className="panel p-7">
          <div className="flex items-center gap-3">
            <Image src="/imgs/logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
            <div>
              <h1 className="font-display text-lg font-semibold">Admin sign in</h1>
              <p className="text-xs text-muted-foreground">Portfolio content dashboard</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-7 space-y-5" noValidate>
            <Field label="Email" htmlFor="email" required>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                invalid={!!error}
              />
            </Field>

            <Field label="Password" htmlFor="password" required error={error || undefined}>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                invalid={!!error}
              />
            </Field>

            <Button type="submit" className="w-full" loading={busy} size="lg">
              <Lock aria-hidden />
              Sign in
            </Button>
          </form>

          <p className="mt-6 border-t border-border pt-5 text-xs leading-relaxed text-muted-foreground">
            There is no public sign-up. The first account is created on the server with{' '}
            <code className="font-mono text-foreground/80">npm run seed:admin</code>.
          </p>
        </div>
      </div>
    </main>
  );
}
