import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAllPosts, savePost, generateSlug, generateId } from '@/lib/blog/posts';
import { getReadingTime } from '@/lib/blog/markdown';
import { authGuard } from '@/lib/blog/api-auth';
import { BlogPost } from '@/lib/blog/types';

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
      coverImage: coverImage || undefined,
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

    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}
