import { NextRequest, NextResponse } from 'next/server';
import { getAuthentikAuthUrl, isAuthentikEnabled, buildRedirectUri } from '@/lib/blog/auth';

export async function GET(request: NextRequest) {
  if (!isAuthentikEnabled()) {
    return NextResponse.json({ error: 'Authentik is not configured' }, { status: 400 });
  }

  // Generate a random state for CSRF protection
  const state = crypto.randomUUID();
  const redirectUri = buildRedirectUri(request.url);

  const authUrl = getAuthentikAuthUrl(state, redirectUri);

  const response = NextResponse.redirect(authUrl);

  // Store state in a short-lived cookie for verification on callback
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  });

  return response;
}
