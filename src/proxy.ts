import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

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

function buildCspHeaders(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}'`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "frame-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "upgrade-insecure-requests",
  ].join('; ');
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

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
  response.headers.set('Content-Security-Policy', buildCspHeaders(nonce));
  return response;
}

export const config = {
  matcher: [
    {
      source: '/((?!_next/static|_next/image|favicon\\.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
