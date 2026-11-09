'use client';

import { useState } from 'react';
import { KeyRound, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { useAuth } from '@/components/dashboard/auth-context';
import { api, ApiError } from '@/lib/client-api';

export default function SettingsPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    if (newPassword !== confirmPassword) {
      return setErrors({ confirmPassword: 'The two passwords do not match' });
    }

    setBusy(true);
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      if (error instanceof ApiError && error.details?.length) {
        setErrors(Object.fromEntries(error.details.map((d) => [d.field, d.message])));
      }
      toast.error(error instanceof Error ? error.message : 'Could not change the password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-xl space-y-7">
      <div>
        <h2 className="font-display text-xl font-semibold">Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your admin account.</p>
      </div>

      <section className="rounded-2xl border border-border bg-[hsl(var(--surface))] p-5">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Name</dt>
            <dd className="mt-1 text-sm">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">Email</dt>
            <dd className="mt-1 font-mono text-sm">{user?.email}</dd>
          </div>
        </dl>
      </section>

      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-[hsl(var(--surface))] p-5">
        <h3 className="flex items-center gap-2 font-display text-base font-semibold">
          <KeyRound className="h-4 w-4 text-primary" aria-hidden />
          Change password
        </h3>

        <Field label="Current password" htmlFor="current" required error={errors.currentPassword}>
          <Input
            id="current"
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </Field>

        <Field
          label="New password"
          htmlFor="next"
          required
          hint="At least 10 characters, with letters and a number."
          error={errors.newPassword}
        >
          <Input
            id="next"
            type="password"
            autoComplete="new-password"
            required
            minLength={10}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Field>

        <Field label="Confirm new password" htmlFor="confirm" required error={errors.confirmPassword}>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            invalid={!!errors.confirmPassword}
          />
        </Field>

        <Button type="submit" loading={busy}>
          <Save aria-hidden />
          Update password
        </Button>
      </form>
    </div>
  );
}
