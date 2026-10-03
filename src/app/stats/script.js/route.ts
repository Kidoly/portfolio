import { umamiConfig } from '@/lib/umami';

export const dynamic = 'force-dynamic';

const TTL_MS = 60 * 60 * 1000;
let cached: { body: string; at: number } | null = null;

const js = (body: string, status: number, cacheControl: string) =>
  new Response(body, { status, headers: { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': cacheControl } });

// GET /stats/script.js - the Umami tracker, served from the site's own origin
export async function GET() {
  const config = umamiConfig();
  if (!config) return new Response('Not found', { status: 404 });

  if (!cached || Date.now() - cached.at > TTL_MS) {
    try {
      const res = await fetch(`${config.url}/script.js`, { cache: 'no-store', signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`umami ${res.status}`);
      // The site uses trailing slashes: post to /stats/api/send/ directly instead of through a 308
      const body = (await res.text()).replace(/\/api\/send(?=["'`])/g, '/api/send/');
      cached = { body, at: Date.now() };
    } catch {
      // Umami unreachable: serve the last copy if there is one, otherwise a no-op
      if (!cached) return js('', 503, 'no-store');
    }
  }
  return js(cached.body, 200, 'public, max-age=3600');
}
