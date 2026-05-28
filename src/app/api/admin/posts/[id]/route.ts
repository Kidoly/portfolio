import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getPostById, savePost, deletePost, generateSlug } from '@/lib/blog/posts';
import { getReadingTime } from '@/lib/blog/markdown';
import { authGuard, getRequestUser } from '@/lib/blog/api-auth';

function sanitizeImageUrl(url: unknown): string | undefined {
  if (!url || typeof url !== 'string') return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return undefined;
    return url;
  } catch {
    return undefined;
  }
}
import { adminLog } from '@/lib/blog/auth';
import { commitFile, deleteFile } from '@/lib/blog/github';

// GET /api/admin/posts/[id]
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await authGuard(request);
  if (authError) return authError;

  const { id } = await params;
  const post = getPostById(id);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json(post);
}

// PUT /api/admin/posts/[id]
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await authGuard(request);
  if (authError) return authError;

  const { id } = await params;
  const post = getPostById(id);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  try {
    const body = await request.json();

    // Update fields
    if (body.title !== undefined) {
      post.title = body.title;
      if (body.updateSlug) {
        post.slug = generateSlug(body.title);
      }
    }
    if (body.slug !== undefined) post.slug = body.slug;
    if (body.content !== undefined) {
      post.content = body.content;
      post.readingTime = getReadingTime(body.content);
    }
    if (body.description !== undefined) post.description = body.description;
    if (body.tags !== undefined) post.tags = body.tags;
    if (body.category !== undefined) post.category = body.category;
    if (body.coverImage !== undefined) post.coverImage = sanitizeImageUrl(body.coverImage);
    if (body.locale !== undefined) post.locale = body.locale;
    if (body.seoTitle !== undefined) post.seoTitle = body.seoTitle;
    if (body.seoDescription !== undefined) post.seoDescription = body.seoDescription;
    if (body.canonicalUrl !== undefined) post.canonicalUrl = body.canonicalUrl;

    // Handle publishing
    if (body.published !== undefined) {
      if (body.published && !post.published) {
        post.publishedAt = new Date().toISOString();
      }
      post.published = body.published;
    }

    const saved = savePost(post);

    revalidatePath('/blog');
    revalidatePath(`/blog/${saved.slug}`);

    const user = await getRequestUser(request);
    adminLog('post.update', user, { id: saved.id, title: saved.title, published: saved.published });

    if (saved.published) {
      commitFile({
        path: `content/blog/${saved.id}.json`,
        content: JSON.stringify(saved, null, 2),
        message: `blog: update "${saved.title}"`,
        author: { name: user?.name || user?.username || 'Admin', email: user?.email || 'admin@portfolio' },
      });
    }

    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

// DELETE /api/admin/posts/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await authGuard(request);
  if (authError) return authError;

  const { id } = await params;
  const post = getPostById(id);
  const success = deletePost(id);
  if (!success) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  revalidatePath('/blog');

  const user = await getRequestUser(request);
  adminLog('post.delete', user, { id, title: post?.title });

  deleteFile({
    path: `content/blog/${id}.json`,
    message: `blog: delete "${post?.title ?? id}"`,
    author: { name: user?.name || user?.username || 'Admin', email: user?.email || 'admin@portfolio' },
  });

  return NextResponse.json({ success: true });
}
