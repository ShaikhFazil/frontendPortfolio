'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Download, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const links = [
  { href: '#about', label: 'About' },
  { href: '#skills', label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#work', label: 'Work' },
  { href: '#education', label: 'Education' },
  { href: '#contact', label: 'Contact' },
];

export default function Navbar({ resumeUrl }: { resumeUrl?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');

  // IntersectionObserver rather than a scroll listener: no per-frame work.
  useEffect(() => {
    const sections = links
      .map((l) => document.getElementById(l.href.slice(1)))
      .filter(Boolean) as HTMLElement[];

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0.1, 0.5] }
    );
    sections.forEach((s) => sectionObserver.observe(s));

    const sentinel = document.getElementById('top-sentinel');
    const topObserver = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (sentinel) topObserver.observe(sentinel);

    return () => {
      sectionObserver.disconnect();
      topObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <div id="top-sentinel" aria-hidden className="absolute top-0 h-1 w-full" />
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-40 transition-all duration-300 ease-smooth',
          scrolled
            ? 'border-b border-border bg-background/85 backdrop-blur-xl'
            : 'border-b border-transparent'
        )}
      >
        <nav
          aria-label="Main"
          className="container-page flex h-[68px] items-center justify-between gap-6"
        >
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="Home">
            <Image src="/imgs/logo.png" alt="" width={32} height={32} className="h-8 w-8 object-contain" />
            <span className="font-display text-sm font-semibold tracking-tight">Fazil Shaikh</span>
          </Link>

          <ul className="hidden items-center gap-1 lg:flex">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground',
                    active === link.href && 'text-foreground'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {resumeUrl && (
              <Button asChild size="sm" variant="subtle" className="hidden sm:inline-flex">
                <a href={resumeUrl} target="_blank" rel="noreferrer noopener" download>
                  <Download aria-hidden />
                  Resume
                </a>
              </Button>
            )}
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="#contact">Get in touch</Link>
            </Button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="grid h-10 w-10 place-items-center rounded-xl border border-border text-foreground lg:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* mobile sheet */}
      <div
        id="mobile-nav"
        className={cn(
          'fixed inset-0 z-30 bg-background/95 backdrop-blur-xl transition-opacity duration-200 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      >
        <ul className="container-page flex flex-col gap-1 pt-24">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block border-b border-border/60 py-4 font-display text-xl"
              >
                {link.label}
              </Link>
            </li>
          ))}
          {resumeUrl && (
            <li className="pt-6">
              <Button asChild variant="subtle" className="w-full">
                <a href={resumeUrl} target="_blank" rel="noreferrer noopener" download>
                  <Download aria-hidden />
                  Download resume
                </a>
              </Button>
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
