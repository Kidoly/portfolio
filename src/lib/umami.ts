import type { NextRequest } from 'next/server';
import { getClientIp } from '@/lib/security/request-guard';

/**
 * Audience measurement with a self-hosted Umami: no cookie, no IP address stored, so no consent
 * banner (CNIL exemption for audience measurement). Off unless both variables are set, read at
 * request time so the Docker image needs no rebuild. The tracker and its beacon go through
 * /stats/ on the site's own origin (route handlers in src/app/stats), which keeps the CSP same-origin.
 */
export function umamiConfig(): { url: string; websiteId: string } | null {
  const url = process.env.UMAMI_URL?.trim().replace(/\/+$/, '');
  const websiteId = process.env.UMAMI_WEBSITE_ID?.trim();
  return url && websiteId ? { url, websiteId } : null;
}

/**
 * Anonymous event sent by the server, for files that cannot run the tracker (the CV PDF, opened from
 * the site, LinkedIn or a job board). Skipped for Do Not Track / Global Privacy Control, for the extra
 * range requests of PDF viewers, and when Umami is off. Never throws.
 */
export async function sendServerEvent(request: NextRequest, name: string): Promise<void> {
  const config = umamiConfig();
  if (!config || request.method !== 'GET') return;
  if (request.headers.get('dnt') === '1' || request.headers.get('sec-gpc') === '1') return;
  const range = request.headers.get('range');
  if (range && !range.startsWith('bytes=0-')) return;

  const ip = getClientIp(request);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': request.headers.get('user-agent') ?? '',
  };
  if (ip !== 'unknown') headers['X-Forwarded-For'] = ip;

  let hostname = request.nextUrl.hostname;
  try {
    if (process.env.SITE_URL) hostname = new URL(process.env.SITE_URL).hostname;
  } catch {}

  const payload = {
    website: config.websiteId,
    hostname,
    url: request.nextUrl.pathname,
    referrer: request.headers.get('referer') ?? '',
    language: request.headers.get('accept-language')?.split(',')[0]?.trim() ?? '',
    screen: '',
    title: '',
    name,
  };
  try {
    await fetch(`${config.url}/api/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ type: 'event', payload }),
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
  } catch {}
}
