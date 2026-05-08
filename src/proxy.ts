import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'change-me-in-production-please'
);

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
      const token = request.cookies.get('admin_token')?.value;
      if (!token) {
        return denyAccess(request, isAdminApi);
      }
      try {
        await jwtVerify(token, JWT_SECRET);
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
