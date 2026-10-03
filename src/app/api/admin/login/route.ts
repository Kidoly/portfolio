import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, createToken, isAuthentikEnabled, authLog } from '@/lib/blog/auth';
import { createRateLimiter, getClientIp, readJsonBody } from '@/lib/security/request-guard';

// Brute-force protection: 5 attempts / 15 min per IP, 30 / hour overall
const perIpLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 5 });
const globalLimit = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 30 });

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    if (!perIpLimit(ip) || !globalLimit('login')) {
      authLog('denied', { provider: 'local', ip, reason: 'rate limited' });
      return NextResponse.json({ error: 'Too many attempts, try again later' }, { status: 429 });
    }

    const body = await readJsonBody(request, 4 * 1024);
    if ('error' in body) return body.error;
    const { username, password } = body.data;

    if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const valid = await verifyCredentials(username, password);
    if (!valid) {
      authLog('denied', { username, provider: 'local', ip, reason: 'invalid credentials' });
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = await createToken({
      username,
      name: username,
      role: 'admin',
      provider: 'local',
    });

    authLog('login', { username, provider: 'local', ip });
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400,
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Return Authentik status so the login UI knows whether to show the button
export async function GET() {
  return NextResponse.json({ authentik: isAuthentikEnabled() });
}
