'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CodeTyping from './code-typing';
import type { Profile } from '@/lib/types';

export default function Hero({
  profile,
  resumeUrl,
}: {
  profile: Profile;
  resumeUrl?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <section
      id="home"
      className="relative flex min-h-[100dvh] items-center overflow-hidden pb-16 pt-24"
    >
      <div aria-hidden className="grid-texture pointer-events-none absolute inset-0" />

      <div className="container-page relative grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:gap-10">
        {/* left: the message */}
        <div className="max-w-2xl">
          {profile.availability && (
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary"
            >
              {profile.availability}
            </motion.p>
          )}

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-[2.6rem] lg:text-[2.7rem]"
          >
            <span className="mb-3 block font-mono text-sm font-normal tracking-normal text-muted-foreground">
              {profile.name}
            </span>
            Full stack engineer shipping{' '}
            <span className="text-gradient">AI-native</span> products.
          </motion.h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 max-w-[48ch] text-base leading-relaxed text-muted-foreground"
          >
            3.5+ years across travel, fintech and e-commerce. React and Node in front,
            LangChain and RAG behind.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Button asChild size="lg">
              <Link href="#work">
                View work
                <ArrowRight aria-hidden />
              </Link>
            </Button>
            {resumeUrl && (
              <Button asChild size="lg" variant="outline">
                <a href={resumeUrl} target="_blank" rel="noreferrer noopener" download>
                  <Download aria-hidden />
                  Resume
                </a>
              </Button>
            )}
          </motion.div>
        </div>

        {/*
          right: the live code panel.
          This is the one element carried over from the previous portfolio,
          unchanged, because the typing animation is the signature of the page.
        */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full justify-self-center lg:justify-self-end"
        >
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-[2rem] bg-primary/15 blur-3xl"
          />
          <CodeTyping />
        </motion.div>
      </div>
    </section>
  );
}
