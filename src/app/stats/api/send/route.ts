import { NextRequest } from 'next/server';
import { umamiConfig } from '@/lib/umami';
import { createRateLimiter, getClientIp } from '@/lib/security/request-guard';

export const dynamic = 'force-dynamic';

const MAX_BODY = 8 * 1024;
const allow = createRateLimiter({ windowMs: 60_000, max: 120 });

// POST /stats/api/send - Umami beacon, relayed with the visitor's IP and user agent (Umami keeps neither)
export async function POST(request: NextRequest) {
  const config = umamiConfig();
  if (!config) return new Response(null, { status: 204 });

  const ip = getClientIp(request);
  if (!allow(ip)) return new Response(null, { status: 429 });

  const body = await request.text();
  if (body.length > MAX_BODY) return new Response(null, { status: 413 });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': request.headers.get('user-agent') ?? '',
  };
  if (ip !== 'unknown') headers['X-Forwarded-For'] = ip;
  const cacheToken = request.headers.get('x-umami-cache');
  if (cacheToken) headers['x-umami-cache'] = cacheToken;

  try {
    const res = await fetch(`${config.url}/api/send`, {
      method: 'POST',
      headers,
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    return new Response(await res.text(), {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') ?? 'text/plain', 'Cache-Control': 'no-store' },
    });
  } catch {
    // Stats must never break a page: Umami down is silently ignored
    return new Response(null, { status: 204 });
  }
}
