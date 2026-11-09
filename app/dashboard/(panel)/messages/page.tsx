'use client';

import { useCallback, useEffect, useState } from 'react';
import { Archive, ArchiveRestore, Mail, MailOpen, Reply, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/field';
import { Badge, ConfirmDialog, EmptyState, ErrorState, Skeleton } from '@/components/ui/misc';
import { api, ApiError } from '@/lib/client-api';
import type { ContactMessage } from '@/lib/types';
import { cn } from '@/lib/utils';

const formatDate = (value: string) =>
  new Date(value).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function MessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'inbox' | 'unread' | 'archived'>('inbox');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [open, setOpen] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState<ContactMessage | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (view === 'unread') params.set('read', 'false');
    params.set('archived', view === 'archived' ? 'true' : 'false');
    if (search.trim()) params.set('search', search.trim());

    try {
      // this endpoint sends pagination in `meta`, so read the whole envelope
      const envelope = await api.getEnvelope<ContactMessage[]>(`/contact?${params}`);
      setMessages(envelope.data || []);
      setPages(envelope.meta?.pages || 1);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not load messages');
    } finally {
      setLoading(false);
    }
  }, [page, view, search]);

  useEffect(() => {
    const timer = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  const patch = async (message: ContactMessage, body: Partial<ContactMessage>) => {
    try {
      const updated = await api.put<ContactMessage>(`/contact/${message._id}`, body);
      setMessages((prev) =>
        view === 'inbox' && updated.archived
          ? prev.filter((m) => m._id !== updated._id)
          : prev.map((m) => (m._id === updated._id ? updated : m))
      );
      if (open?._id === updated._id) setOpen(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update the message');
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.del(`/contact/${deleting._id}`);
      setMessages((prev) => prev.filter((m) => m._id !== deleting._id));
      if (open?._id === deleting._id) setOpen(null);
      toast.success('Message deleted');
      setDeleting(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold">Messages</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything submitted through the contact form on the public site.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            placeholder="Search name, email or message"
            aria-label="Search messages"
            className="pl-9"
          />
        </div>
        <Select
          aria-label="View"
          value={view}
          onChange={(e) => {
            setPage(1);
            setView(e.target.value as typeof view);
          }}
          className="w-auto min-w-[150px]"
        >
          <option value="inbox">Inbox</option>
          <option value="unread">Unread</option>
          <option value="archived">Archived</option>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[84px]" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : messages.length === 0 ? (
        <EmptyState
          icon={Mail}
          title={view === 'archived' ? 'Nothing archived' : 'No messages yet'}
          description={
            view === 'archived'
              ? 'Messages you archive are kept here.'
              : 'When someone fills in the contact form, it lands here.'
          }
        />
      ) : (
        <ul className="space-y-2.5">
          {messages.map((message) => (
            <li
              key={message._id}
              className={cn(
                'rounded-2xl border bg-[hsl(var(--surface))] p-4 transition-colors',
                message.read ? 'border-border' : 'border-primary/35'
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => {
                    setOpen(open?._id === message._id ? null : message);
                    if (!message.read) patch(message, { read: true });
                  }}
                  aria-expanded={open?._id === message._id}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{message.name}</span>
                    {!message.read && <Badge tone="accent">New</Badge>}
                    {message.archived && <Badge>Archived</Badge>}
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                    {message.email} · {formatDate(message.createdAt)}
                  </p>
                  {message.subject && <p className="mt-1.5 text-sm">{message.subject}</p>}
                  {open?._id !== message._id && (
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{message.message}</p>
                  )}
                </button>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={message.read ? 'Mark as unread' : 'Mark as read'}
                    onClick={() => patch(message, { read: !message.read })}
                  >
                    {message.read ? <MailOpen /> : <Mail />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={message.archived ? 'Restore' : 'Archive'}
                    onClick={() => patch(message, { archived: !message.archived })}
                  >
                    {message.archived ? <ArchiveRestore /> : <Archive />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete"
                    className="hover:text-destructive"
                    onClick={() => setDeleting(message)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>

              {open?._id === message._id && (
                <div className="mt-4 border-t border-border pt-4">
                  <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">
                    {message.message}
                  </p>
                  <Button asChild variant="subtle" size="sm" className="mt-4">
                    <a
                      href={`mailto:${message.email}?subject=${encodeURIComponent(
                        `Re: ${message.subject || 'Your message'}`
                      )}`}
                    >
                      <Reply aria-hidden />
                      Reply by email
                    </a>
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="subtle" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="font-mono text-xs text-muted-foreground">
            Page {page} of {pages}
          </span>
          <Button
            variant="subtle"
            size="sm"
            disabled={page >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete this message?"
        description="It is removed permanently. Archive it instead if you only want it out of the inbox."
        busy={busy}
        onConfirm={remove}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
