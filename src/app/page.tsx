import type { Metadata } from 'next';
import { getPublishedPosts } from '@/lib/blog/posts';
import PortfolioClient, { type BlogPreview } from '@/components/portfolio/PortfolioClient';
import { BIRTH_DATE, getAge } from '@/config/profile';
import { jsonLd, PERSON, SITE_URL } from '@/lib/structured-data';
import fr from '@/locales/fr.json';

// Title, description and og:* come from the root layout. The canonical stays
// here: declared in the layout, every page without its own would inherit it.
export const metadata: Metadata = {
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': [
        { url: '/blog/feed.xml', title: 'Blog Alban Mary - RSS Feed' },
      ],
    },
  },
};

const profileJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  '@id': `${SITE_URL}/#profilepage`,
  url: `${SITE_URL}/`,
  name: fr.portfolio.meta.title,
  description: fr.portfolio.meta.description,
  inLanguage: 'fr',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  ...(process.env.BUILD_TIME && { dateModified: process.env.BUILD_TIME }),
  mainEntity: PERSON,
};

export const dynamic = 'force-dynamic';

export default function Home() {
  const latest = getPublishedPosts().slice(0, 3);

  const posts: BlogPreview[] = latest.map((post) => ({
    title: post.title,
    url: `/blog/${post.slug}/`,
    cat: post.category || 'Blog',
    date: post.publishedAt || post.updatedAt,
  }));

  // Computed server-side so the hydrated page shows the same value
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(profileJsonLd) }} />
      <PortfolioClient posts={posts} age={getAge(BIRTH_DATE)} />
    </>
  );
}
