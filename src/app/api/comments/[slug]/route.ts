import { NextRequest, NextResponse } from 'next/server';
import {
  BlogComment,
  generateCommentId,
  getCommentsByPost,
  saveComment,
} from '@/lib/blog/comments';
import { getPostBySlug } from '@/lib/blog/posts';
import { sendCommentNotification } from '@/lib/blog/comment-mailer';

// Simple in-memory rate limiter (per IP)
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes
const MAX_COMMENTS = 5; // 5 comments per IP per window

// Remove C0/C1 control characters (keep \n \r \t for multi-line content)
function stripControlChars(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');
}

function sanitizeText(value: string, maxLength: number, singleLine = false): string {
  let v = stripControlChars(value);
  if (singleLine) v = v.replace(/[\r\n]+/g, ' ');
  return v.trim().slice(0, maxLength);
}

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  return forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown';
}

/** Returns true when the IP is within its quota (and records the hit). */
function checkRateLimit(ip: string): boolean {
  if (ip === 'unknown') return true;
  const now = Date.now();
  const entry = rateLimit.get(ip);
  if (entry && now - entry.timestamp < RATE_LIMIT_WINDOW) {
    if (entry.count >= MAX_COMMENTS) return false;
    entry.count += 1;
    return true;
  }
  rateLimit.set(ip, { count: 1, timestamp: now });
  return true;
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

    // Rate limiting per IP
    if (!checkRateLimit(getClientIp(request))) {
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

    const body = await request.json();

    const website = typeof body.website === 'string' ? body.website.trim() : '';
    if (website) {
      return NextResponse.json({ success: true });
    }

    const name = sanitizeText(String(body.name || ''), 80, true);
    const email = sanitizeText(String(body.email || ''), 254, true);
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
