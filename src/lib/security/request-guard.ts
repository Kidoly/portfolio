import { NextRequest, NextResponse } from 'next/server';

/** Shared protections for the public forms (contact, comments) and the admin login. */

/**
 * Client IP as seen by the reverse proxy. The proxy appends the address it saw
 * to X-Forwarded-For, so the last entry is the reliable one (earlier entries
 * come from the client and can be forged).
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const last = forwarded?.split(',').map((ip) => ip.trim()).filter(Boolean).pop();
  return last || request.headers.get('x-real-ip')?.trim() || 'unknown';
}

/**
 * Fixed-window in-memory rate limiter. Returns `allow(key)`, false once `max`
 * hits happened within `windowMs`. Expired keys are pruned as the map grows.
 */
export function createRateLimiter({ windowMs, max }: { windowMs: number; max: number }) {
  const hits = new Map<string, { count: number; start: number }>();
  return function allow(key: string): boolean {
    const now = Date.now();
    if (hits.size > 5000) {
      for (const [k, entry] of hits) if (now - entry.start >= windowMs) hits.delete(k);
    }
    const entry = hits.get(key);
    if (!entry || now - entry.start >= windowMs) {
      hits.set(key, { count: 1, start: now });
      return true;
    }
    entry.count += 1;
    return entry.count <= max;
  };
}

async function readCapped(request: NextRequest, maxBytes: number): Promise<string | null> {
  const reader = request.body?.getReader();
  if (!reader) return '';
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}

/**
 * Reads a small JSON object body. Requiring application/json also blocks
 * cross-site form posts: a browser would need a CORS preflight, never granted.
 */
export async function readJsonBody(
  request: NextRequest,
  maxBytes: number
): Promise<{ data: Record<string, unknown> } | { error: NextResponse }> {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return { error: NextResponse.json({ error: 'Content-Type application/json attendu.' }, { status: 415 }) };
  }
  const tooLarge = { error: NextResponse.json({ error: 'Requête trop volumineuse.' }, { status: 413 }) };
  if (Number(request.headers.get('content-length') ?? 0) > maxBytes) return tooLarge;

  const raw = await readCapped(request, maxBytes);
  if (raw === null) return tooLarge;
  try {
    const data: unknown = JSON.parse(raw);
    if (data && typeof data === 'object' && !Array.isArray(data)) return { data: data as Record<string, unknown> };
  } catch {
    /* fall through */
  }
  return { error: NextResponse.json({ error: 'Requête invalide.' }, { status: 400 }) };
}

/**
 * Trimmed text without control characters (and on one line when `singleLine`).
 * Null when the value is not a string or is longer than `maxLength`.
 */
export function cleanText(value: unknown, maxLength: number, { singleLine = false } = {}): string | null {
  if (typeof value !== 'string') return null;
  let text = value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
  if (singleLine) text = text.replace(/[\r\n\t]+/g, ' ');
  text = text.trim();
  return text.length > maxLength ? null : text;
}

export const EMAIL_RE = /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/;
