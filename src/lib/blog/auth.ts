import { SignJWT, jwtVerify } from 'jose';
import bcryptjs from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'change-me-in-production-please'
);

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '';

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  if (username !== ADMIN_USERNAME) return false;

  // If no hash is set, use a default password (for dev only)
  if (!ADMIN_PASSWORD_HASH) {
    return password === 'admin';
  }

  return bcryptjs.compare(password, ADMIN_PASSWORD_HASH);
}

export async function createToken(username: string): Promise<string> {
  return new SignJWT({ username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ username: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { username: string; role: string };
  } catch {
    return null;
  }
}

// Utility to generate a password hash (run via: node -e "...")
export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 12);
}
