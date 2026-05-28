import { NextRequest, NextResponse } from 'next/server';
import { verifyCredentials, createToken, isAuthentikEnabled, authLog } from '@/lib/blog/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
      ?? request.headers.get('x-real-ip')
      ?? 'unknown';

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
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Return Authentik status so the login UI knows whether to show the button
export async function GET() {
  return NextResponse.json({ authentik: isAuthentikEnabled() });
}
