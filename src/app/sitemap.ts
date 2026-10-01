import { MetadataRoute } from 'next';
import { getPublishedPosts } from '@/lib/blog/posts';
import { LEGAL_UPDATED_AT } from '@/config/legal';

export const dynamic = 'force-dynamic';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://albanmary.com';
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/blog/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...['mentions-legales', 'confidentialite'].map((page) => ({
      url: `${baseUrl}/${page}/`,
      lastModified: new Date(LEGAL_UPDATED_AT),
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    })),
  ];

  // Blog posts
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = getPublishedPosts();
    blogPages = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}/`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {
    // If content directory doesn't exist yet
  }

  return [...staticPages, ...blogPages];
}
