import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAllPosts, savePost, generateSlug, generateId } from '@/lib/blog/posts';
import { getReadingTime } from '@/lib/blog/markdown';
import { authGuard, getRequestUser } from '@/lib/blog/api-auth';
import { adminLog } from '@/lib/blog/auth';
import { commitFile } from '@/lib/blog/github';
import { BlogPost } from '@/lib/blog/types';

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

// GET /api/admin/posts - list all posts (including drafts)
export async function GET(request: NextRequest) {
  const authError = await authGuard(request);
  if (authError) return authError;

  const posts = getAllPosts();
  return NextResponse.json(posts);
}

// POST /api/admin/posts - create a new post
export async function POST(request: NextRequest) {
  const authError = await authGuard(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { title, content, description, tags, category, published, locale, coverImage, seoTitle, seoDescription } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const post: BlogPost = {
      id: generateId(),
      slug: generateSlug(title),
      title,
      description: description || '',
      content,
      author: 'Alban Mary',
      tags: tags || [],
      category: category || 'General',
      coverImage: sanitizeImageUrl(coverImage),
      published: published ?? false,
      publishedAt: published ? new Date().toISOString() : '',
      updatedAt: new Date().toISOString(),
      readingTime: getReadingTime(content),
      locale: locale || 'fr',
      seoTitle: seoTitle || undefined,
      seoDescription: seoDescription || undefined,
    };

    const saved = savePost(post);

    revalidatePath('/blog');
    if (saved.published) {
      revalidatePath(`/blog/${saved.slug}`);
    }

    const user = await getRequestUser(request);
    adminLog('post.create', user, { id: saved.id, title: saved.title, published: saved.published });

    if (saved.published) {
      commitFile({
        path: `content/blog/${saved.id}.json`,
        content: JSON.stringify(saved, null, 2),
        message: `blog: publish "${saved.title}"`,
        author: { name: user?.name || user?.username || 'Admin', email: user?.email || 'admin@portfolio' },
      });
    }

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
