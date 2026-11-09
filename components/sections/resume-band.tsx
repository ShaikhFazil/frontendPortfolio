'use client';

import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/site/reveal';
import type { ResumeRef } from '@/lib/types';

export default function ResumeBand({ resume }: { resume: ResumeRef }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  if (!resume?.url) return null;

  const updated = resume.updatedAt
    ? new Date(resume.updatedAt).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  return (
    <section id="resume" className="scroll-mt-24 border-t border-border py-20">
      <div className="container-page">
        <Reveal className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-border bg-gradient-to-r from-primary/12 via-[hsl(var(--surface))] to-[hsl(var(--surface))] p-7 sm:flex-row sm:items-center">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
              <FileText className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-xl font-semibold">Resume</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The full version, with every role and project.
                {updated ? ` Last updated ${updated}.` : ''}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2.5">
            <Button
              variant="outline"
              onClick={() => setPreviewOpen((v) => !v)}
              aria-expanded={previewOpen}
              aria-controls="resume-preview"
            >
              {previewOpen ? 'Hide preview' : 'Preview'}
            </Button>
            <Button asChild>
              <a href={resume.url} target="_blank" rel="noreferrer noopener" download={resume.fileName}>
                <Download aria-hidden />
                Download PDF
              </a>
            </Button>
          </div>
        </Reveal>

        {previewOpen && (
          <div id="resume-preview" className="mt-5 overflow-hidden rounded-2xl border border-border">
            <object
              data={resume.url}
              type="application/pdf"
              className="h-[70vh] w-full bg-surface"
              aria-label="Resume preview"
            >
              <p className="p-6 text-sm text-muted-foreground">
                Your browser cannot display the PDF inline.{' '}
                <a href={resume.url} className="text-primary underline" target="_blank" rel="noreferrer noopener">
                  Open it in a new tab
                </a>
                .
              </p>
            </object>
          </div>
        )}
      </div>
    </section>
  );
}
