'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api, validateImage } from '@/lib/client-api';
import type { Asset } from '@/lib/types';
import { Button } from '@/components/ui/button';

type Uploaded = { url: string; publicId: string };

/** Single image field: pick, validate, upload to Cloudinary via the API, preview. */
export function ImageField({
  value,
  onChange,
  folder = 'misc',
  label = 'Image',
  id,
}: {
  value?: Asset;
  onChange: (asset: Asset | undefined) => void;
  folder?: string;
  label?: string;
  id?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    const problem = validateImage(file);
    if (problem) return toast.error(problem);

    setBusy(true);
    try {
      const uploaded = await api.upload<Uploaded>('/uploads/image', file, { folder });
      onChange({ url: uploaded.url, publicId: uploaded.publicId });
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-start gap-4">
      <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-surface-raised">
        {value?.url ? (
          <Image
            src={value.url}
            alt=""
            width={96}
            height={96}
            className="h-24 w-24 object-cover"
            unoptimized
          />
        ) : (
          <ImagePlus className="h-5 w-5 text-muted-foreground" aria-hidden />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="subtle"
            onClick={() => inputRef.current?.click()}
            loading={busy}
          >
            {value?.url ? 'Replace' : `Upload ${label.toLowerCase()}`}
          </Button>
          {value?.url && (
            <Button type="button" size="sm" variant="ghost" onClick={() => onChange(undefined)}>
              <Trash2 aria-hidden />
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">PNG, JPG, WebP or SVG. Up to 5MB.</p>
      </div>
    </div>
  );
}

/** Multi-image field for project galleries. */
export function GalleryField({
  value = [],
  onChange,
  folder = 'projects',
  id,
}: {
  value?: Asset[];
  onChange: (assets: Asset[]) => void;
  folder?: string;
  id?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    const problem = list.map(validateImage).find(Boolean);
    if (problem) return toast.error(problem);

    setBusy(true);
    try {
      const uploaded = await api.uploadMany<Uploaded[]>('/uploads/images', list, { folder });
      onChange([...value, ...uploaded.map((u) => ({ url: u.url, publicId: u.publicId }))]);
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? 's' : ''} uploaded`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2.5">
          {value.map((asset, index) => (
            <li key={asset.publicId || asset.url} className="relative">
              <Image
                src={asset.url!}
                alt=""
                width={92}
                height={92}
                unoptimized
                className="h-[92px] w-[92px] rounded-xl border border-border object-cover"
              />
              <button
                type="button"
                aria-label={`Remove image ${index + 1}`}
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <Button type="button" size="sm" variant="subtle" onClick={() => inputRef.current?.click()} disabled={busy}>
        {busy ? <Loader2 className="animate-spin" aria-hidden /> : <ImagePlus aria-hidden />}
        Add screenshots
      </Button>
    </div>
  );
}
