import { NextRequest, NextResponse } from 'next/server';
import { authGuard } from '@/lib/blog/api-auth';
import { getAllComments } from '@/lib/blog/comments';

export async function GET(request: NextRequest) {
  const authError = await authGuard(request);
  if (authError) return authError;

  const comments = getAllComments();
  return NextResponse.json(comments);
}
