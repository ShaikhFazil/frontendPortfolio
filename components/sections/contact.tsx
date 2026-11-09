'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { CheckCircle2, Github, Linkedin, Mail, MapPin, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea } from '@/components/ui/field';
import SectionHeading from '@/components/site/section-heading';
import { Reveal } from '@/components/site/reveal';
import { api, ApiError } from '@/lib/client-api';
import type { Profile } from '@/lib/types';

const schema = z.object({
  name: z.string().trim().min(2, 'Please enter your name'),
  email: z.string().trim().email('Enter a valid email address'),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(10, 'Tell me a little more (10 characters minimum)'),
  website: z.string().max(0).optional(), // honeypot
});

type FormValues = z.infer<typeof schema>;

const iconFor = (label: string) => {
  const key = label.toLowerCase();
  if (key.includes('git')) return Github;
  if (key.includes('link')) return Linkedin;
  return Mail;
};

export default function Contact({ profile }: { profile: Profile }) {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', subject: '', message: '', website: '' },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await api.post('/contact', { ...values, website: '' });
      setSent(true);
      reset();
      toast.success('Message sent. I will get back to you shortly.');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Something went wrong. Please try again.';
      toast.error(message);
    }
  };

  return (
    <section id="contact" className="scroll-mt-24 border-t border-border py-24 sm:py-28">
      <div className="container-page">
        <SectionHeading
          eyebrow="Contact"
          title="Let's talk"
          body="Open to full-time roles and contract work. Tell me what you are building."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.25fr] lg:gap-12">
          {/* details column */}
          <Reveal className="space-y-6">
            <dl className="space-y-5">
              {profile.email && (
                <div className="flex items-start gap-3.5">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">Email</dt>
                    <dd className="mt-1">
                      <a
                        href={`mailto:${profile.email}`}
                        className="font-mono text-sm transition-colors hover:text-primary"
                      >
                        {profile.email}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              {profile.location && (
                <div className="flex items-start gap-3.5">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                      Location
                    </dt>
                    <dd className="mt-1 font-mono text-sm">{profile.location}</dd>
                  </div>
                </div>
              )}
            </dl>

            {profile.socials && profile.socials.length > 0 && (
              <div className="border-t border-border pt-6">
                <ul className="flex flex-wrap gap-2.5">
                  {profile.socials
                    .filter((s) => !s.url.startsWith('mailto:'))
                    .map((social) => {
                      const Icon = iconFor(social.label);
                      return (
                        <li key={social.url}>
                          <a
                            href={social.url}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="inline-flex items-center gap-2 rounded-xl border border-border bg-[hsl(var(--surface))] px-4 py-2.5 text-sm transition-colors hover:border-primary/40 hover:text-primary"
                          >
                            <Icon className="h-4 w-4" aria-hidden />
                            {social.label}
                          </a>
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}
          </Reveal>

          {/* form column */}
          <Reveal delay={0.08}>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-[hsl(var(--surface))] p-6 sm:p-8">
              <span aria-hidden className="grid-texture pointer-events-none absolute inset-0 opacity-40" />

              {sent ? (
                <div className="relative flex min-h-[320px] flex-col items-center justify-center gap-3 text-center">
                  <CheckCircle2 className="h-10 w-10 text-success" aria-hidden />
                  <h3 className="font-display text-lg font-semibold">Message received</h3>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    Thanks for reaching out. I usually reply within a day or two.
                  </p>
                  <Button variant="ghost" size="sm" onClick={() => setSent(false)} className="mt-2">
                    Send another
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="relative space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Name" htmlFor="name" required error={errors.name?.message}>
                      <Input
                        id="name"
                        autoComplete="name"
                        invalid={!!errors.name}
                        {...register('name')}
                      />
                    </Field>
                    <Field label="Email" htmlFor="email" required error={errors.email?.message}>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        invalid={!!errors.email}
                        {...register('email')}
                      />
                    </Field>
                  </div>

                  <Field label="Subject" htmlFor="subject" error={errors.subject?.message}>
                    <Input id="subject" invalid={!!errors.subject} {...register('subject')} />
                  </Field>

                  <Field
                    label="Message"
                    htmlFor="message"
                    required
                    error={errors.message?.message}
                    hint="Role, project, timeline, whatever is useful."
                  >
                    <Textarea
                      id="message"
                      rows={6}
                      invalid={!!errors.message}
                      {...register('message')}
                    />
                  </Field>

                  {/* honeypot, hidden from people and assistive tech */}
                  <div aria-hidden className="hidden">
                    <label htmlFor="website">Website</label>
                    <input id="website" tabIndex={-1} autoComplete="off" {...register('website')} />
                  </div>

                  <Button type="submit" size="lg" loading={isSubmitting} className="w-full sm:w-auto">
                    <Send aria-hidden />
                    Send message
                  </Button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
