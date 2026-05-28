import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, authLog } from '@/lib/blog/auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;
  if (token) {
    const payload = await verifyToken(token);
    if (payload) {
      authLog('logout', {
        username: payload.username,
        email: payload.email,
        provider: payload.provider,
      });
    }
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });
  return response;
}
