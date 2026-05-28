import { NextRequest, NextResponse } from 'next/server';
import { authGuard, getRequestUser } from '@/lib/blog/api-auth';
import { adminLog } from '@/lib/blog/auth';
import { deleteComment, updateComment } from '@/lib/blog/comments';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await authGuard(request);
  if (authError) return authError;

  const { id } = await params;

  try {
    const body = await request.json();
    const status = body?.status;

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = updateComment(id, { status });
    if (!updated) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const user = await getRequestUser(request);
    adminLog('comment.update', user, { id, status });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update comment' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await authGuard(request);
  if (authError) return authError;

  const { id } = await params;
  const deleted = deleteComment(id);

  if (!deleted) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  }

  const user = await getRequestUser(request);
  adminLog('comment.delete', user, { id });

  return NextResponse.json({ success: true });
}
