import { getPostBySlug } from '@/lib/blog/posts';
import { ogResponse, OgTitleCard } from '@/lib/og';

/** Share card of an article. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const title = post?.published ? post.title : 'Notes d’infra';
  const category = post?.published ? post.category || 'Blog' : 'Blog';

  return ogResponse(<OgTitleCard category={category} title={title} />);
}
