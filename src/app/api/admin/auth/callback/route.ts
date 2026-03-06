import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeAuthentikCode,
  getAuthentikUserInfo,
  createToken,
  buildRedirectUri,
  buildBaseUrl,
} from '@/lib/blog/auth';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const baseUrl = buildBaseUrl(request);

  // Handle Authentik errors
  if (error) {
    console.error('Authentik auth error:', error, searchParams.get('error_description'));
    return NextResponse.redirect(new URL('/admin?error=auth_denied', baseUrl));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/admin?error=missing_params', baseUrl));
  }

  // Verify CSRF state
  const storedState = request.cookies.get('oauth_state')?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(new URL('/admin?error=invalid_state', baseUrl));
  }

  // Exchange code for tokens (redirect_uri must match the one used in the authorize request)
  const redirectUri = buildRedirectUri(request);
  const tokens = await exchangeAuthentikCode(code, redirectUri);
  if (!tokens) {
    return NextResponse.redirect(new URL('/admin?error=token_exchange', baseUrl));
  }

  // Get user info
  const userInfo = await getAuthentikUserInfo(tokens.access_token);
  if (!userInfo) {
    return NextResponse.redirect(new URL('/admin?error=user_info', baseUrl));
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
  const response = NextResponse.redirect(new URL('/admin', baseUrl));

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
