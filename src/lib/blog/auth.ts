import { SignJWT, jwtVerify } from 'jose';
import bcryptjs from 'bcryptjs';

if (!process.env.ADMIN_JWT_SECRET) {
  throw new Error('ADMIN_JWT_SECRET environment variable is required but not set.');
}
if (!process.env.ADMIN_PASSWORD_HASH) {
  throw new Error('ADMIN_PASSWORD_HASH environment variable is required but not set.');
}

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

// --- Authentik OIDC config ---
const AUTHENTIK_URL = process.env.AUTHENTIK_URL || ''; // e.g. https://auth.yourdomain.com
const AUTHENTIK_CLIENT_ID = process.env.AUTHENTIK_CLIENT_ID || '';
const AUTHENTIK_CLIENT_SECRET = process.env.AUTHENTIK_CLIENT_SECRET || '';
export const AUTHENTIK_ALLOWED_GROUP = process.env.AUTHENTIK_ALLOWED_GROUP || '';

const AUTH_DEBUG = process.env.AUTH_DEBUG === 'true';

type AuthEvent = 'login' | 'logout' | 'granted' | 'denied' | 'error';

export function authLog(event: AuthEvent, details: {
  email?: string;
  username?: string;
  groups?: string[];
  provider?: string;
  ip?: string;
  reason?: string;
}) {
  if (!AUTH_DEBUG) return;
  const ts = new Date().toISOString();
  const prefix: Record<AuthEvent, string> = {
    login:   '[auth:login  ]',
    logout:  '[auth:logout ]',
    granted: '[auth:granted]',
    denied:  '[auth:denied ]',
    error:   '[auth:error  ]',
  };
  const parts = [
    `${prefix[event]} ${ts}`,
    details.username && `user=${details.username}`,
    details.email    && `email=${details.email}`,
    details.provider && `via=${details.provider}`,
    details.ip       && `ip=${details.ip}`,
    details.groups   && `groups=[${details.groups.join(', ')}]`,
    details.reason   && `reason=${details.reason}`,
  ].filter(Boolean);
  const log = ['login', 'logout', 'granted'].includes(event) ? console.log : console.warn;
  log(parts.join(' | '));
}

type AdminAction =
  | 'post.create' | 'post.update' | 'post.delete'
  | 'comment.update' | 'comment.delete'
  | 'sync';

export function adminLog(action: AdminAction, user: { username?: string; email?: string } | null, details?: Record<string, string | boolean | undefined>) {
  if (!AUTH_DEBUG) return;
  const ts = new Date().toISOString();
  const parts = [
    `[admin:${action.padEnd(14)}] ${ts}`,
    user?.username && `user=${user.username}`,
    ...Object.entries(details ?? {}).map(([k, v]) => v !== undefined ? `${k}=${v}` : null),
  ].filter(Boolean);
  console.log(parts.join(' | '));
}

export function isAuthentikEnabled(): boolean {
  return !!(AUTHENTIK_URL && AUTHENTIK_CLIENT_ID && AUTHENTIK_CLIENT_SECRET);
}

/** Resolve the public-facing base URL — works behind reverse proxies and inside Docker */
export function buildBaseUrl(request: { headers: Headers; url: string }): string {
  // 1. Explicit SITE_URL env var (most reliable for Docker)
  const siteUrl = process.env.SITE_URL;
  if (siteUrl) {
    return siteUrl.replace(/\/$/, '');
  }

  // 2. Reverse proxy headers (X-Forwarded-Host)
  const forwardedHost = request.headers.get('x-forwarded-host');
  if (forwardedHost) {
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    return `${proto}://${forwardedHost}`;
  }

  // 3. Host header (works on localhost without proxy)
  const host = request.headers.get('host');
  if (host) {
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    return `${proto}://${host}`;
  }

  // 4. Last resort: request.url
  const url = new URL(request.url);
  return url.origin;
}

/** Build the redirect URI — works behind reverse proxies and inside Docker */
export function buildRedirectUri(request: { headers: Headers; url: string }): string {
  return `${buildBaseUrl(request)}/api/admin/auth/callback`;
}

export function getAuthentikAuthUrl(state: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: AUTHENTIK_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid profile email groups',
    state,
  });
  return `${AUTHENTIK_URL}/application/o/authorize/?${params.toString()}`;
}

export async function exchangeAuthentikCode(code: string, redirectUri: string): Promise<{
  access_token: string;
  id_token: string;
  token_type: string;
} | null> {
  try {
    const res = await fetch(`${AUTHENTIK_URL}/application/o/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: AUTHENTIK_CLIENT_ID,
        client_secret: AUTHENTIK_CLIENT_SECRET,
        redirect_uri: redirectUri,
        code,
      }),
    });

    if (!res.ok) {
      console.error('Authentik token exchange failed:', await res.text());
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error('Authentik token exchange error:', err);
    return null;
  }
}

export async function getAuthentikUserInfo(accessToken: string): Promise<{
  sub: string;
  name: string;
  preferred_username: string;
  email: string;
  groups?: string[];
} | null> {
  try {
    const res = await fetch(`${AUTHENTIK_URL}/application/o/userinfo/`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// --- Local auth ---
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  if (username !== ADMIN_USERNAME) return false;
  return bcryptjs.compare(password, ADMIN_PASSWORD_HASH);
}

// --- JWT tokens (used by both local and Authentik) ---
interface TokenPayload {
  username: string;
  name: string;
  email?: string;
  role: string;
  provider: 'local' | 'authentik';
}

export async function createToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload } as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// Utility to generate a password hash (run via: node -e "...")
export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12);
}
