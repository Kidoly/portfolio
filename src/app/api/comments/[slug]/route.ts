import { NextRequest, NextResponse } from 'next/server';
import {
  BlogComment,
  generateCommentId,
  getCommentsByPost,
  saveComment,
} from '@/lib/blog/comments';
import { getPostBySlug } from '@/lib/blog/posts';
import { sendCommentNotification } from '@/lib/blog/comment-mailer';
import { cleanText, createRateLimiter, EMAIL_RE, getClientIp, readJsonBody } from '@/lib/security/request-guard';

const perIpLimit = createRateLimiter({ windowMs: 10 * 60 * 1000, max: 5 }); // 5 comments / 10 min per IP
const globalLimit = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 60 }); // 60 comments / hour overall

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

    const body = await readJsonBody(request, 8 * 1024);
    if ('error' in body) return body.error;
    const { data } = body;

    // Honeypot field for bots: pretend success, store nothing
    if (data.website) {
      return NextResponse.json({ success: true });
    }

    const ip = getClientIp(request);
    if (!perIpLimit(ip)) {
      return NextResponse.json(
        { error: 'Trop de commentaires. Merci de patienter avant de réessayer.' },
        { status: 429 }
      );
    }

    // Only allow comments on existing, published posts
    const post = getPostBySlug(slug);
    if (!post || !post.published) {
      return NextResponse.json({ error: 'Article introuvable.' }, { status: 404 });
    }

    const name = cleanText(data.name, 80, { singleLine: true });
    const email = cleanText(data.email ?? '', 254, { singleLine: true });
    const message = cleanText(data.message, 1500);

    if (!name || !message || email === null) {
      return NextResponse.json(
        { error: 'Nom (80 caractères max) et message (1500 caractères max) requis.' },
        { status: 400 }
      );
    }

    if (email && !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: 'Email invalide.' },
        { status: 400 }
      );
    }

    if (!globalLimit('comments')) {
      return NextResponse.json(
        { error: 'Trop de commentaires. Merci de patienter avant de réessayer.' },
        { status: 429 }
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
      ip,
    };

    saveComment(comment);

    // Fire-and-forget - don't block the response if email fails
    sendCommentNotification(comment)
      .then(() => console.log('[comment] notification email sent for', comment.id))
      .catch((err) => console.error('[comment] notification email failed:', err));

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
