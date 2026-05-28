import { createHmac, timingSafeEqual } from 'crypto';

const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function secret(): string {
  const s = process.env.ADMIN_JWT_SECRET;
  if (!s) throw new Error('ADMIN_JWT_SECRET is not set');
  return s;
}

export function generateReviewToken(commentId: string, action: 'approve' | 'reject'): string {
  const expires = Date.now() + TTL_MS;
  const payload = `${commentId}:${action}:${expires}`;
  const sig = createHmac('sha256', secret()).update(payload).digest('hex');
  return Buffer.from(JSON.stringify({ commentId, action, expires, sig })).toString('base64url');
}

export function verifyReviewToken(
  token: string
): { commentId: string; action: 'approve' | 'reject' } | null {
  try {
    const { commentId, action, expires, sig } = JSON.parse(
      Buffer.from(token, 'base64url').toString('utf-8')
    );
    if (typeof commentId !== 'string' || typeof sig !== 'string') return null;
    if (action !== 'approve' && action !== 'reject') return null;
    if (Date.now() > expires) return null;

    const payload = `${commentId}:${action}:${expires}`;
    const expected = createHmac('sha256', secret()).update(payload).digest('hex');

    const sigBuf = Buffer.from(sig, 'hex');
    const expBuf = Buffer.from(expected, 'hex');
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null;

    return { commentId, action };
  } catch {
    return null;
  }
}
