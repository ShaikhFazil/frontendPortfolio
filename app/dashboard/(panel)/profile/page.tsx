'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Save, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/field';
import { ErrorState, Skeleton } from '@/components/ui/misc';
import { api, ApiError, validateImage } from '@/lib/client-api';
import type { Profile, Social } from '@/lib/types';

const empty: Profile = {
  name: '',
  title: '',
  tagline: '',
  summary: '',
  bio: '',
  email: '',
  phone: '',
  location: '',
  availability: '',
  yearsOfExperience: 0,
  socials: [],
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>(empty);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setProfile(await api.get<Profile>('/profile'));
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : 'Could not load the profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) =>
    setProfile((p) => ({ ...p, [key]: value }));

  const setSocial = (index: number, patch: Partial<Social>) =>
    setProfile((p) => ({
      ...p,
      socials: (p.socials || []).map((s, i) => (i === index ? { ...s, ...patch } : s)),
    }));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setErrors({});
    try {
      const payload = {
        name: profile.name,
        title: profile.title,
        tagline: profile.tagline || '',
        summary: profile.summary || '',
        bio: profile.bio || '',
        email: profile.email || '',
        phone: profile.phone || '',
        location: profile.location || '',
        availability: profile.availability || '',
        yearsOfExperience: Number(profile.yearsOfExperience) || 0,
        socials: (profile.socials || []).filter((s) => s.label && s.url),
      };
      const updated = await api.put<Profile>('/profile', payload);
      setProfile(updated);
      toast.success('Profile saved');
    } catch (error) {
      if (error instanceof ApiError && error.details?.length) {
        setErrors(Object.fromEntries(error.details.map((d) => [d.field, d.message])));
        toast.error('Please fix the highlighted fields');
      } else {
        toast.error(error instanceof Error ? error.message : 'Save failed');
      }
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file?: File) => {
    if (!file) return;
    const problem = validateImage(file);
    if (problem) return toast.error(problem);

    setUploading(true);
    try {
      const updated = await api.upload<Profile>('/profile/avatar', file);
      setProfile(updated);
      toast.success('Profile photo updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[140px]" />
        <Skeleton className="h-[360px]" />
      </div>
    );
  }

  if (loadError) return <ErrorState message={loadError} onRetry={load} />;

  return (
    <form onSubmit={save} className="max-w-3xl space-y-8">
      <div>
        <h2 className="font-display text-xl font-semibold">Profile</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Drives the hero, the about section, the footer and the page metadata.
        </p>
      </div>

      {/* photo */}
      <section className="flex items-start gap-5 rounded-2xl border border-border bg-[hsl(var(--surface))] p-5">
        <div className="grid h-28 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-surface-raised">
          {profile.avatar?.url ? (
            <Image
              src={profile.avatar.url}
              alt=""
              width={96}
              height={112}
              unoptimized
              className="h-28 w-24 object-cover"
            />
          ) : (
            <Upload className="h-5 w-5 text-muted-foreground" aria-hidden />
          )}
        </div>
        <div>
          <h3 className="font-display text-base font-semibold">Profile photo</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Shown in the about section and used as the social preview image.
          </p>
          <label className="mt-4 inline-block">
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => uploadAvatar(e.target.files?.[0])}
            />
            <span
              role="button"
              tabIndex={0}
              className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-border bg-surface-raised px-3.5 text-[13px] font-medium transition-colors hover:border-primary/40"
            >
              <Upload className="h-4 w-4" aria-hidden />
              {uploading ? 'Uploading...' : profile.avatar?.url ? 'Replace photo' : 'Upload photo'}
            </span>
          </label>
        </div>
      </section>

      {/* identity */}
      <section className="grid gap-5 rounded-2xl border border-border bg-[hsl(var(--surface))] p-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="name" required error={errors.name}>
          <Input id="name" value={profile.name} onChange={(e) => set('name', e.target.value)} required />
        </Field>
        <Field label="Professional title" htmlFor="title" required error={errors.title}>
          <Input id="title" value={profile.title} onChange={(e) => set('title', e.target.value)} required />
        </Field>

        <Field label="Tagline" htmlFor="tagline" className="sm:col-span-2" error={errors.tagline}>
          <Input id="tagline" value={profile.tagline || ''} onChange={(e) => set('tagline', e.target.value)} />
        </Field>

        <Field
          label="Professional summary"
          htmlFor="summary"
          className="sm:col-span-2"
          hint="Used for the page description and search snippets."
          error={errors.summary}
        >
          <Textarea
            id="summary"
            rows={3}
            value={profile.summary || ''}
            onChange={(e) => set('summary', e.target.value)}
          />
        </Field>

        <Field
          label="Biography"
          htmlFor="bio"
          className="sm:col-span-2"
          hint="Blank lines separate paragraphs in the about section."
          error={errors.bio}
        >
          <Textarea id="bio" rows={8} value={profile.bio || ''} onChange={(e) => set('bio', e.target.value)} />
        </Field>
      </section>

      {/* contact */}
      <section className="grid gap-5 rounded-2xl border border-border bg-[hsl(var(--surface))] p-5 sm:grid-cols-2">
        <Field label="Email" htmlFor="email" error={errors.email}>
          <Input id="email" type="email" value={profile.email || ''} onChange={(e) => set('email', e.target.value)} />
        </Field>
        <Field label="Phone" htmlFor="phone" error={errors.phone}>
          <Input id="phone" value={profile.phone || ''} onChange={(e) => set('phone', e.target.value)} />
        </Field>
        <Field label="Location" htmlFor="location" error={errors.location}>
          <Input id="location" value={profile.location || ''} onChange={(e) => set('location', e.target.value)} />
        </Field>
        <Field
          label="Availability"
          htmlFor="availability"
          hint="Appears as the pill above the hero headline."
          error={errors.availability}
        >
          <Input
            id="availability"
            value={profile.availability || ''}
            onChange={(e) => set('availability', e.target.value)}
          />
        </Field>
        <Field label="Years of experience" htmlFor="yoe" error={errors.yearsOfExperience}>
          <Input
            id="yoe"
            type="number"
            step="0.5"
            min="0"
            value={profile.yearsOfExperience ?? 0}
            onChange={(e) => set('yearsOfExperience', Number(e.target.value))}
          />
        </Field>
      </section>

      {/* socials */}
      <section className="rounded-2xl border border-border bg-[hsl(var(--surface))] p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-semibold">Social links</h3>
          <Button
            type="button"
            variant="subtle"
            size="sm"
            onClick={() => set('socials', [...(profile.socials || []), { label: '', url: '' }])}
          >
            <Plus aria-hidden />
            Add link
          </Button>
        </div>

        <ul className="mt-5 space-y-3">
          {(profile.socials || []).map((social, index) => (
            <li key={index} className="grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
              <Field label="Label" htmlFor={`social-label-${index}`}>
                <Input
                  id={`social-label-${index}`}
                  value={social.label}
                  placeholder="GitHub"
                  onChange={(e) => setSocial(index, { label: e.target.value })}
                />
              </Field>
              <Field label="URL" htmlFor={`social-url-${index}`}>
                <Input
                  id={`social-url-${index}`}
                  type="url"
                  value={social.url}
                  placeholder="https://github.com/username"
                  onChange={(e) => setSocial(index, { url: e.target.value })}
                />
              </Field>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${social.label || 'link'}`}
                className="hover:text-destructive"
                onClick={() =>
                  set('socials', (profile.socials || []).filter((_, i) => i !== index))
                }
              >
                <Trash2 />
              </Button>
            </li>
          ))}
          {(profile.socials || []).length === 0 && (
            <li className="text-sm text-muted-foreground">No links yet.</li>
          )}
        </ul>
      </section>

      <div className="sticky bottom-0 -mx-5 border-t border-border bg-background/95 px-5 py-4 backdrop-blur sm:-mx-7 sm:px-7">
        <Button type="submit" loading={saving}>
          <Save aria-hidden />
          Save profile
        </Button>
      </div>
    </form>
  );
}
