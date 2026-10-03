import { NextRequest, NextResponse, type NextFetchEvent } from 'next/server';
import { jwtVerify } from 'jose';
import { sendServerEvent } from '@/lib/umami';

/**
 * Resolve the JWT secret at request time. Returns null when it is not
 * configured so the guard can fail closed (deny admin access) instead of
 * verifying tokens against a known, hardcoded fallback secret.
 */
function getJwtSecret(): Uint8Array | null {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

const PUBLIC_PATHS = [
  '/admin',
  '/api/admin/login',
  '/api/admin/auth/',
  '/api/admin/me',
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => {
    if (pathname === path || pathname === `${path}/`) return true;
    if (path.endsWith('/') && pathname.startsWith(path)) return true;
    return false;
  });
}

function denyAccess(request: NextRequest, isApi: boolean): NextResponse {
  if (isApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const loginUrl = new URL('/admin', request.url);
  return NextResponse.redirect(loginUrl);
}

/**
 * Strict CSP: nothing is allowed unless listed. Next.js scripts carry the
 * per-request nonce and 'strict-dynamic' lets them load their own chunks.
 * Fonts are self-hosted by next/font (Google Fonts fetched at build time), so
 * no third-party origin is needed.
 */
function buildCspHeader(nonce: string): string {
  const isDev = process.env.NODE_ENV === 'development';
  return [
    "default-src 'none'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ''}`,
    // React style attributes and next/image need inline styles
    "style-src 'self' 'unsafe-inline'",
    // Article images can be hosted elsewhere (Wiki.js, CDN)
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self'",
    "manifest-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ['upgrade-insecure-requests']),
  ].join('; ');
}

/** Public HTTPS URL for a request the reverse proxy received over plain HTTP. */
function httpsUrl(request: NextRequest): URL {
  const { pathname, search } = request.nextUrl;
  const host = process.env.SITE_URL
    ? new URL(process.env.SITE_URL).host
    : request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? request.nextUrl.host;
  return new URL(`https://${host}${pathname}${search}`);
}

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // Opt-in (HTTPS_REDIRECT=true): only safe when the reverse proxy reports the
  // client scheme in X-Forwarded-Proto, otherwise it would loop.
  if (process.env.HTTPS_REDIRECT === 'true' && request.headers.get('x-forwarded-proto') === 'http') {
    return NextResponse.redirect(httpsUrl(request), 308);
  }

  // The CV is a static PDF without tracker: its downloads are counted here, after the response
  if (pathname === '/Alban_Mary_CV.pdf') event.waitUntil(sendServerEvent(request, 'cv-download'));

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = buildCspHeader(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);
  // Lets the root layout leave the audience tracker out of the back office
  requestHeaders.set('x-pathname', pathname);

  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  if (isAdminPage || isAdminApi) {
    if (!isPublicPath(pathname)) {
      const secret = getJwtSecret();
      const token = request.cookies.get('admin_token')?.value;
      if (!secret || !token) {
        return denyAccess(request, isAdminApi);
      }
      try {
        await jwtVerify(token, secret, { algorithms: ['HS256'] });
      } catch {
        return denyAccess(request, isAdminApi);
      }
    }
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', csp);
  return response;
}

// Prefetch requests are not skipped: the admin guard above must run on every request.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico).*)'],
};
