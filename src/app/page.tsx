import { getPublishedPosts } from '@/lib/blog/posts';
import PortfolioClient, { type BlogPreview } from '@/components/portfolio/PortfolioClient';

export const dynamic = 'force-dynamic';

export default function Home() {
  const latest = getPublishedPosts().slice(0, 3);

  const posts: BlogPreview[] = latest.map((post) => ({
    title: post.title,
    url: `/blog/${post.slug}/`,
    cat: post.category || 'Blog',
    date: post.publishedAt || post.updatedAt,
  }));

  return <PortfolioClient posts={posts} />;
}
