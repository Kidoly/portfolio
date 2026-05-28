import { NextRequest, NextResponse } from 'next/server';
import {
  BlogComment,
  generateCommentId,
  getCommentsByPost,
  saveComment,
} from '@/lib/blog/comments';
import { sendCommentNotification } from '@/lib/blog/comment-mailer';

function sanitizeText(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const comments = getCommentsByPost(slug, 'approved');

  const publicComments = comments.map((comment) => ({
    id: comment.id,
    postSlug: comment.postSlug,
    authorName: comment.authorName,
    content: comment.content,
    createdAt: comment.createdAt,
  }));

  return NextResponse.json(publicComments);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const website = typeof body.website === 'string' ? body.website.trim() : '';
    if (website) {
      return NextResponse.json({ success: true });
    }

    const name = sanitizeText(String(body.name || ''), 80);
    const email = sanitizeText(String(body.email || ''), 254);
    const message = sanitizeText(String(body.message || ''), 1500);

    if (!name || !message) {
      return NextResponse.json(
        { error: 'Nom et message requis.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const comment: BlogComment = {
      id: generateCommentId(),
      postSlug: slug,
      authorName: name,
      authorEmail: email || undefined,
      content: message,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
      ip: getClientIp(request),
    };

    saveComment(comment);

    // Fire-and-forget — don't block the response if email fails
    sendCommentNotification(comment).catch((err) =>
      console.error('[comment] notification email failed:', err)
    );

    return NextResponse.json({
      success: true,
      message:
        'Votre commentaire a bien été envoyé. Il sera visible après validation.',
    });
  } catch {
    return NextResponse.json(
      { error: 'Impossible d\'envoyer le commentaire.' },
      { status: 500 }
    );
  }
}
