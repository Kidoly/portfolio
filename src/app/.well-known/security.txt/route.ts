import { CONTACT_EMAIL } from '@/config/legal';

export const dynamic = 'force-dynamic';

const SITE_URL = 'https://albanmary.com';

// GET /.well-known/security.txt (RFC 9116). Expires always lands about 11 months ahead, as the RFC
// recommends (< 1 year), so the file never goes stale; the contact comes from src/config/legal.ts.
export function GET() {
  const expires = new Date();
  expires.setUTCMonth(expires.getUTCMonth() + 11, 1);
  expires.setUTCHours(0, 0, 0, 0);

  const body = [
    `Contact: mailto:${CONTACT_EMAIL}`,
    `Expires: ${expires.toISOString()}`,
    'Preferred-Languages: fr, en',
    `Canonical: ${SITE_URL}/.well-known/security.txt`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=86400' },
  });
}
