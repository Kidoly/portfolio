import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/blog/posts';
import { loadOgFonts, OG_SIZE, OgTitleCard } from '@/lib/og';

export const runtime = 'nodejs';
export const alt = 'Article du blog d’Alban Mary';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const title = post?.published ? post.title : 'Notes d’infra';
  const category = post?.published ? post.category || 'Blog' : 'Blog';

  return new ImageResponse(<OgTitleCard category={category} title={title} />, { ...size, fonts: await loadOgFonts() });
}
