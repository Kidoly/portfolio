import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/blog/auth';

export async function authGuard(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  return null; // null means authorized
}
