import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'change-me-in-production-please'
);

// Routes that don't require authentication
const PUBLIC_PATHS = [
  '/admin',             // Login page itself
  '/api/admin/login',   // Login endpoint
  '/api/admin/auth/',   // Authentik OAuth flow (callback, etc.)
  '/api/admin/me',      // Auth status check (returns 401 if not logged in)
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => {
    // Exact match (with optional trailing slash)
    if (pathname === path || pathname === `${path}/`) return true;
    // Prefix match for paths ending with /
    if (path.endsWith('/') && pathname.startsWith(path)) return true;
    return false;
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin and /api/admin routes
  const isAdminPage = pathname.startsWith('/admin');
  const isAdminApi = pathname.startsWith('/api/admin');

  if (!isAdminPage && !isAdminApi) {
    return NextResponse.next();
  }

  // Allow public paths through
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for admin token
  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    return denyAccess(request, isAdminApi);
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    return denyAccess(request, isAdminApi);
  }
}

function denyAccess(request: NextRequest, isApi: boolean): NextResponse {
  if (isApi) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Redirect unauthenticated users to the admin login page
  const loginUrl = new URL('/admin', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
