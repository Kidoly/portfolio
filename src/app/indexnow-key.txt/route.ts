import { indexNowKey } from '@/lib/indexnow';

export const dynamic = 'force-dynamic';

/** Proves to the IndexNow engines that the submitted URLs belong to this site. */
export function GET() {
  const key = indexNowKey();
  if (!key) return new Response('Not Found', { status: 404 });
  return new Response(key, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
