'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Download, Eye, FileText, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge, ConfirmDialog, EmptyState, ErrorState, Skeleton } from '@/components/ui/misc';
import { api, ApiError, formatBytes, validatePdf } from '@/lib/client-api';
import type { ResumeRecord } from '@/lib/types';

const formatDate = (value: string) =>
  new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function ResumePage() {
  const [items, setItems] = useState<ResumeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState<ResumeRecord | null>(null);
  const [preview, setPreview] = useState<ResumeRecord | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await api.get<ResumeRecord[]>('/resume');
      setItems(data);
      setPreview(data.find((r) => r.isActive) || data[0] || null);
    } catch (error) {
      setLoadError(error instanceof ApiError ? error.message : 'Could not load resumes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const upload = async (file?: File) => {
    if (!file) return;
    const problem = validatePdf(file);
    if (problem) return toast.error(problem);

    setUploading(true);
    try {
      const created = await api.upload<ResumeRecord>('/resume', file);
      setItems((prev) => [created, ...prev.map((r) => ({ ...r, isActive: false }))]);
      setPreview(created);
      toast.success('Resume uploaded and set as active');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const activate = async (record: ResumeRecord) => {
    setBusy(true);
    try {
      await api.put(`/resume/${record._id}/activate`);
      setItems((prev) => prev.map((r) => ({ ...r, isActive: r._id === record._id })));
      toast.success('Active resume changed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not activate');
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async (record: ResumeRecord) => {
    setBusy(true);
    try {
      await api.put(`/resume/${record._id}/deactivate`);
      setItems((prev) => prev.map((r) => (r._id === record._id ? { ...r, isActive: false } : r)));
      toast.success('Resume deactivated. The site falls back to the bundled PDF.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not deactivate');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.del(`/resume/${deleting._id}`);
      toast.success('Resume deleted');
      setDeleting(null);
      load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  const active = items.find((r) => r.isActive) || null;

  return (
    <div className="space-y-7">
      <div>
        <h2 className="font-display text-xl font-semibold">Resume</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          The active PDF is what the Download buttons on the public site serve. Uploading a new one
          makes it active automatically; older versions stay here until you delete them.
        </p>
      </div>

      {/* upload */}
      <section className="rounded-2xl border border-dashed border-border bg-[hsl(var(--surface))] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
              <Upload className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <h3 className="font-display text-base font-semibold">Upload a new version</h3>
              <p className="mt-1 text-sm text-muted-foreground">PDF only, up to 10MB.</p>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => upload(e.target.files?.[0])}
          />
          <Button onClick={() => inputRef.current?.click()} loading={uploading}>
            Choose PDF
          </Button>
        </div>
      </section>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-[96px]" />
          <Skeleton className="h-[96px]" />
        </div>
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No resume uploaded"
          description="Until you upload one, the site serves the PDF bundled with the frontend build."
          action={
            <Button size="sm" onClick={() => inputRef.current?.click()}>
              Upload a PDF
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1fr_minmax(320px,_480px)]">
          <section>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Versions
            </h3>
            <ul className="mt-4 space-y-2.5">
              {items.map((record) => (
                <li
                  key={record._id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-[hsl(var(--surface))] px-4 py-3.5"
                >
                  <FileText
                    className={`h-5 w-5 shrink-0 ${record.isActive ? 'text-primary' : 'text-muted-foreground'}`}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{record.fileName}</p>
                    <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                      {formatBytes(record.bytes)} · uploaded {formatDate(record.createdAt)}
                    </p>
                  </div>

                  {record.isActive ? (
                    <Badge tone="success">
                      <CheckCircle2 className="h-3 w-3" aria-hidden />
                      Active
                    </Badge>
                  ) : (
                    <Button variant="subtle" size="sm" onClick={() => activate(record)} disabled={busy}>
                      Make active
                    </Button>
                  )}

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Preview"
                      onClick={() => setPreview(record)}
                    >
                      <Eye />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Download" asChild>
                      <a href={record.url} target="_blank" rel="noreferrer noopener" download={record.fileName}>
                        <Download />
                      </a>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Delete"
                      className="hover:text-destructive"
                      onClick={() => setDeleting(record)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>

            {active && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-4"
                disabled={busy}
                onClick={() => deactivate(active)}
              >
                Deactivate the current resume
              </Button>
            )}
          </section>

          <section>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Preview
            </h3>
            <div className="mt-4 overflow-hidden rounded-2xl border border-border">
              {preview ? (
                <object
                  data={preview.url}
                  type="application/pdf"
                  className="h-[560px] w-full bg-surface"
                  aria-label={`Preview of ${preview.fileName}`}
                >
                  <p className="p-5 text-sm text-muted-foreground">
                    Inline preview is unavailable here.{' '}
                    <a
                      href={preview.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-primary underline"
                    >
                      Open the PDF
                    </a>
                    .
                  </p>
                </object>
              ) : (
                <p className="p-5 text-sm text-muted-foreground">Select a version to preview.</p>
              )}
            </div>
          </section>
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete this resume version?"
        description="The PDF is removed from storage. If it was the active one, the most recent remaining version becomes active instead."
        busy={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
