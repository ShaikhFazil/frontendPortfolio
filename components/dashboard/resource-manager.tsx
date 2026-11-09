'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, Switch, TagInput, Textarea } from '@/components/ui/field';
import { Badge, ConfirmDialog, EmptyState, ErrorState, Skeleton } from '@/components/ui/misc';
import { GalleryField, ImageField } from './image-upload';
import { api, ApiError } from '@/lib/client-api';
import { cn } from '@/lib/utils';

export type FieldType =
  | 'text'
  | 'url'
  | 'number'
  | 'textarea'
  | 'select'
  | 'switch'
  | 'tags'
  | 'image'
  | 'gallery';

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  options?: string[];
  folder?: string;
  full?: boolean;
  rows?: number;
};

export type ColumnDef<T> = {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

export type ResourceConfig<T> = {
  endpoint: string;
  singular: string;
  plural: string;
  description: string;
  fields: FieldDef[];
  columns: ColumnDef<T>[];
  defaults: Record<string, unknown>;
  filters?: { key: string; label: string; options: { value: string; label: string }[] }[];
  searchPlaceholder?: string;
};

type Row = Record<string, any> & { _id?: string; order?: number; published?: boolean };

export default function ResourceManager<T extends Row>({ config }: { config: ResourceConfig<T> }) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const [editing, setEditing] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<T | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await api.get<T[]>(`${config.endpoint}/all?limit=100`);
      setRows(data);
    } catch (error) {
      setLoadError(
        error instanceof ApiError ? error.message : `Could not load ${config.plural.toLowerCase()}`
      );
    } finally {
      setLoading(false);
    }
  }, [config.endpoint, config.plural]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesFilters = Object.entries(filters).every(
        ([key, value]) => !value || String(row[key]) === value
      );
      if (!matchesFilters) return false;
      if (!term) return true;
      return JSON.stringify(row).toLowerCase().includes(term);
    });
  }, [rows, search, filters]);

  const save = async (values: Record<string, unknown>) => {
    setBusy(true);
    try {
      const payload = cleanPayload(values, config.fields);
      if (editing?._id) {
        const updated = await api.put<T>(`${config.endpoint}/${editing._id}`, payload);
        setRows((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
        toast.success(`${config.singular} updated`);
      } else {
        const created = await api.post<T>(config.endpoint, payload);
        setRows((prev) => [...prev, created]);
        toast.success(`${config.singular} created`);
      }
      setEditing(null);
      setCreating(false);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? [error.message, ...(error.details || []).map((d) => `${d.field}: ${d.message}`)].join(' · ')
          : 'Save failed';
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleting?._id) return;
    setBusy(true);
    try {
      await api.del(`${config.endpoint}/${deleting._id}`);
      setRows((prev) => prev.filter((r) => r._id !== deleting._id));
      toast.success(`${config.singular} deleted`);
      setDeleting(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rows.length) return;

    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    const reordered = next.map((row, i) => ({ ...row, order: i }));
    setRows(reordered);

    try {
      await api.patch(`${config.endpoint}/reorder`, {
        items: reordered.map((row) => ({ id: row._id, order: row.order })),
      });
    } catch {
      toast.error('Could not save the new order');
      load();
    }
  };

  const togglePublished = async (row: T) => {
    try {
      const updated = await api.put<T>(`${config.endpoint}/${row._id}`, {
        published: !row.published,
      });
      setRows((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not change visibility');
    }
  };

  const open = creating || !!editing;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold">{config.plural}</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{config.description}</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setCreating(true);
          }}
        >
          <Plus aria-hidden />
          New {config.singular.toLowerCase()}
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={config.searchPlaceholder || `Search ${config.plural.toLowerCase()}`}
            aria-label={`Search ${config.plural.toLowerCase()}`}
            className="pl-9"
          />
        </div>

        {config.filters?.map((filter) => (
          <Select
            key={filter.key}
            aria-label={filter.label}
            value={filters[filter.key] || ''}
            onChange={(e) => setFilters((f) => ({ ...f, [filter.key]: e.target.value }))}
            className="w-auto min-w-[160px]"
          >
            <option value="">{filter.label}: all</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-[72px] w-full" />
          ))}
        </div>
      ) : loadError ? (
        <ErrorState message={loadError} onRetry={load} />
      ) : visible.length === 0 ? (
        <EmptyState
          title={rows.length ? 'Nothing matches that' : `No ${config.plural.toLowerCase()} yet`}
          description={
            rows.length
              ? 'Try a different search term or clear the filters.'
              : `Add your first ${config.singular.toLowerCase()} and it appears on the public site straight away.`
          }
          action={
            rows.length ? (
              <Button variant="subtle" size="sm" onClick={() => { setSearch(''); setFilters({}); }}>
                Clear filters
              </Button>
            ) : (
              <Button size="sm" onClick={() => setCreating(true)}>
                <Plus aria-hidden />
                New {config.singular.toLowerCase()}
              </Button>
            )
          }
        />
      ) : (
        <ul className="space-y-2.5">
          {visible.map((row) => {
            const index = rows.findIndex((r) => r._id === row._id);
            return (
              <li
                key={row._id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-[hsl(var(--surface))] px-4 py-3.5"
              >
                <div className="flex shrink-0 flex-col">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={index <= 0 || !!search}
                    onClick={() => move(index, -1)}
                    className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={index >= rows.length - 1 || !!search}
                    onClick={() => move(index, 1)}
                    className="text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid min-w-0 flex-1 gap-1 sm:grid-cols-[2fr_1fr_auto] sm:items-center sm:gap-4">
                  {config.columns.map((column) => (
                    <div key={column.key} className={cn('min-w-0 truncate text-sm', column.className)}>
                      {column.render ? column.render(row) : String(row[column.key] ?? '')}
                    </div>
                  ))}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => togglePublished(row)}
                    aria-label={row.published ? 'Unpublish' : 'Publish'}
                  >
                    <Badge tone={row.published ? 'success' : 'neutral'}>
                      {row.published ? 'Live' : 'Hidden'}
                    </Badge>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Edit ${config.singular.toLowerCase()}`}
                    onClick={() => {
                      setCreating(false);
                      setEditing(row);
                    }}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Delete ${config.singular.toLowerCase()}`}
                    onClick={() => setDeleting(row)}
                    className="hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {open && (
        <ResourceForm
          config={config}
          initial={editing || (config.defaults as T)}
          isNew={creating}
          busy={busy}
          onCancel={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSave={save}
        />
      )}

      <ConfirmDialog
        open={!!deleting}
        title={`Delete this ${config.singular.toLowerCase()}?`}
        description="This removes it from the public site immediately and cannot be undone. Any images it owns are deleted from Cloudinary unless another record still uses them."
        busy={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}

/** Strips empty optional values so the backend's zod schemas stay happy. */
function cleanPayload(values: Record<string, unknown>, fields: FieldDef[]) {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (['_id', 'createdAt', 'updatedAt', '__v', 'slug'].includes(key)) continue;
    const def = fields.find((f) => f.name === key);
    if (def?.type === 'number') {
      out[key] = value === '' || value === undefined ? 0 : Number(value);
    } else if (def?.type === 'image') {
      out[key] = value && (value as any).url ? value : { url: '', publicId: '' };
    } else {
      out[key] = value;
    }
  }
  return out;
}

function ResourceForm<T extends Row>({
  config,
  initial,
  isNew,
  busy,
  onCancel,
  onSave,
}: {
  config: ResourceConfig<T>;
  initial: T;
  isNew: boolean;
  busy: boolean;
  onCancel: () => void;
  onSave: (values: Record<string, unknown>) => void;
}) {
  const [values, setValues] = useState<Record<string, any>>(() => ({
    ...config.defaults,
    ...initial,
  }));

  const set = (name: string, value: unknown) => setValues((v) => ({ ...v, [name]: value }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-form-title"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="flex h-full w-full max-w-2xl flex-col border-l border-border bg-background">
        <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
          <h2 id="resource-form-title" className="font-display text-lg font-semibold">
            {isNew ? `New ${config.singular.toLowerCase()}` : `Edit ${config.singular.toLowerCase()}`}
          </h2>
          <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Close">
            <X />
          </Button>
        </header>

        <form
          id="resource-form"
          className="flex-1 overflow-y-auto px-6 py-6"
          onSubmit={(e) => {
            e.preventDefault();
            onSave(values);
          }}
        >
          <div className="grid gap-5 sm:grid-cols-2">
            {config.fields.map((field) => {
              const id = `field-${field.name}`;
              const value = values[field.name];

              return (
                <Field
                  key={field.name}
                  label={field.type === 'switch' ? undefined : field.label}
                  htmlFor={id}
                  required={field.required}
                  hint={field.hint}
                  className={field.full || field.type !== 'text' ? 'sm:col-span-2' : undefined}
                >
                  {field.type === 'textarea' && (
                    <Textarea
                      id={id}
                      rows={field.rows || 4}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={value ?? ''}
                      onChange={(e) => set(field.name, e.target.value)}
                    />
                  )}

                  {field.type === 'select' && (
                    <Select
                      id={id}
                      required={field.required}
                      value={value ?? ''}
                      onChange={(e) => set(field.name, e.target.value)}
                    >
                      <option value="">Choose one</option>
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </Select>
                  )}

                  {field.type === 'switch' && (
                    <Switch
                      id={id}
                      label={field.label}
                      checked={!!value}
                      onChange={(v) => set(field.name, v)}
                    />
                  )}

                  {field.type === 'tags' && (
                    <TagInput
                      id={id}
                      value={Array.isArray(value) ? value : []}
                      onChange={(v) => set(field.name, v)}
                      placeholder={field.placeholder}
                    />
                  )}

                  {field.type === 'image' && (
                    <ImageField
                      id={id}
                      label={field.label}
                      folder={field.folder}
                      value={value}
                      onChange={(asset) => set(field.name, asset || { url: '', publicId: '' })}
                    />
                  )}

                  {field.type === 'gallery' && (
                    <GalleryField
                      id={id}
                      folder={field.folder}
                      value={Array.isArray(value) ? value : []}
                      onChange={(assets) => set(field.name, assets)}
                    />
                  )}

                  {(field.type === 'text' || field.type === 'url' || field.type === 'number') && (
                    <Input
                      id={id}
                      type={field.type === 'number' ? 'number' : field.type === 'url' ? 'url' : 'text'}
                      required={field.required}
                      placeholder={field.placeholder}
                      value={value ?? ''}
                      onChange={(e) => set(field.name, e.target.value)}
                    />
                  )}
                </Field>
              );
            })}
          </div>
        </form>

        <footer className="flex shrink-0 justify-end gap-2.5 border-t border-border px-6 py-4">
          <Button variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" form="resource-form" loading={busy}>
            {isNew ? `Create ${config.singular.toLowerCase()}` : 'Save changes'}
          </Button>
        </footer>
      </div>
    </div>
  );
}
