import { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/blog/posts';
import type { BlogPost } from '@/lib/blog/types';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://albanmary.com';
  // The legal pages are noindex, so not listed

  let posts: BlogPost[] = [];
  try {
    // Posts republished from another site keep their canonical there
    posts = getPublishedPosts().filter(
      (post) => !post.canonicalUrl || post.canonicalUrl.replace(/\/?$/, '/') === `${baseUrl}/blog/${post.slug}/`
    );
  } catch {
    // If content directory doesn't exist yet
  }

  // A static page changes with a deploy or with the posts it lists. A lastmod
  // that is always "now" would teach crawlers to ignore it.
  const built = process.env.BUILD_TIME ? Date.parse(process.env.BUILD_TIME) : 0;
  const lastChange = (listed: BlogPost[]) =>
    new Date(Math.max(built, ...listed.map((post) => Date.parse(post.updatedAt) || 0)) || Date.now());

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: lastChange(posts.slice(0, 3)),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog/`,
      lastModified: lastChange(posts),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/proxmox/`,
      lastModified: lastChange(posts.filter((post) => post.tags.includes('proxmox'))),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ];

  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}/`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...blogPages];
}
