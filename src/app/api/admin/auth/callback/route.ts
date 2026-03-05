import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeAuthentikCode,
  getAuthentikUserInfo,
  createToken,
  buildRedirectUri,
} from '@/lib/blog/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  // Handle Authentik errors
  if (error) {
    console.error('Authentik auth error:', error, searchParams.get('error_description'));
    return NextResponse.redirect(new URL('/admin?error=auth_denied', request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/admin?error=missing_params', request.url));
  }

  // Verify CSRF state
  const storedState = request.cookies.get('oauth_state')?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(new URL('/admin?error=invalid_state', request.url));
  }

  // Exchange code for tokens (redirect_uri must match the one used in the authorize request)
  const redirectUri = buildRedirectUri(request.url);
  const tokens = await exchangeAuthentikCode(code, redirectUri);
  if (!tokens) {
    return NextResponse.redirect(new URL('/admin?error=token_exchange', request.url));
  }

  // Get user info
  const userInfo = await getAuthentikUserInfo(tokens.access_token);
  if (!userInfo) {
    return NextResponse.redirect(new URL('/admin?error=user_info', request.url));
  }

  // Create our own JWT with user info
  const token = await createToken({
    username: userInfo.preferred_username || userInfo.email,
    name: userInfo.name || userInfo.preferred_username,
    email: userInfo.email,
    role: 'admin',
    provider: 'authentik',
  });

  // Redirect to admin dashboard with auth cookie
  const response = NextResponse.redirect(new URL('/admin', request.url));

  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 86400, // 24h
    path: '/',
  });

  // Clean up OAuth state cookie
  response.cookies.delete('oauth_state');

  return response;
}
