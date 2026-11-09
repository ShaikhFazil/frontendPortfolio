'use client';

/**
 * Browser-side API client for the dashboard and the public contact form.
 * Uses fetch with `credentials: 'include'` so the httpOnly JWT cookie set by
 * the backend travels with every request. No token is ever stored in JS.
 */

export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
).replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  details?: { field: string; message: string }[];
  constructor(status: number, message: string, details?: ApiError['details']) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type Options = Omit<RequestInit, 'body'> & { body?: unknown; raw?: boolean };

async function request<T>(path: string, options: Options = {}): Promise<T> {
  const { body, raw, headers, ...rest } = options;

  let init: RequestInit = { credentials: 'include', ...rest, headers: { ...headers } };

  if (body instanceof FormData) {
    init.body = body; // let the browser set the multipart boundary
  } else if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json', ...init.headers };
    init.body = JSON.stringify(body);
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new ApiError(0, 'Cannot reach the API. Is the backend running?');
  }

  const text = await res.text();
  const payload = text ? safeParse(text) : null;

  if (!res.ok) {
    throw new ApiError(
      res.status,
      payload?.error?.message || res.statusText || 'Request failed',
      payload?.error?.details
    );
  }

  return (raw ? payload : payload?.data) as T;
}

function safeParse(text: string) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export type Envelope<T> = { success: boolean; data: T; meta?: Record<string, number> };

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),

  /** Returns the whole response envelope, for endpoints that also send `meta`. */
  getEnvelope: <T>(path: string) => request<Envelope<T>>(path, { method: 'GET', raw: true }),

  post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  del: <T>(path: string, body?: unknown) => request<T>(path, { method: 'DELETE', body }),

  /** Uploads a single file to an authenticated endpoint. */
  upload: <T>(path: string, file: File, extra: Record<string, string> = {}) => {
    const fd = new FormData();
    fd.append('file', file);
    Object.entries(extra).forEach(([k, v]) => fd.append(k, v));
    return request<T>(path, { method: 'POST', body: fd });
  },

  uploadMany: <T>(path: string, files: File[], extra: Record<string, string> = {}) => {
    const fd = new FormData();
    files.forEach((f) => fd.append('files', f));
    Object.entries(extra).forEach(([k, v]) => fd.append(k, v));
    return request<T>(path, { method: 'POST', body: fd });
  },
};

/** Client-side guards that mirror the backend's multer limits. */
export const UPLOAD_LIMITS = {
  imageBytes: 5 * 1024 * 1024,
  pdfBytes: 10 * 1024 * 1024,
  imageTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'],
};

export function validateImage(file: File): string | null {
  if (!UPLOAD_LIMITS.imageTypes.includes(file.type)) {
    return 'Choose a PNG, JPG, WebP, GIF or SVG image.';
  }
  if (file.size > UPLOAD_LIMITS.imageBytes) {
    return `Image must be under ${UPLOAD_LIMITS.imageBytes / 1024 / 1024}MB.`;
  }
  return null;
}

export function validatePdf(file: File): string | null {
  if (file.type !== 'application/pdf') return 'Resume must be a PDF file.';
  if (file.size > UPLOAD_LIMITS.pdfBytes) {
    return `PDF must be under ${UPLOAD_LIMITS.pdfBytes / 1024 / 1024}MB.`;
  }
  return null;
}

export function formatBytes(bytes: number) {
  if (!bytes) return '0 KB';
  const kb = bytes / 1024;
  return kb < 1024 ? `${Math.round(kb)} KB` : `${(kb / 1024).toFixed(1)} MB`;
}
