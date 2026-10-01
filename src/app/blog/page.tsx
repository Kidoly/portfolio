import { Metadata } from 'next';
import { getPublishedPosts, getAllTags, getAllCategories, getPostSummary } from '@/lib/blog/posts';
import BlogListClient from './BlogListClient';

const BLOG_DESCRIPTION =
  'Notes d\'infra d\'Alban Mary : virtualisation, conteneurs, réseau et sécurité. Ce qu\'il met en place dans son homelab et en alternance, documenté pas à pas.';

export const metadata: Metadata = {
  title: 'Blog - Notes d\'infra',
  description: BLOG_DESCRIPTION,
  openGraph: {
    title: 'Notes d\'infra - Blog d\'Alban Mary',
    description: BLOG_DESCRIPTION,
    url: 'https://albanmary.com/blog',
    type: 'website',
    siteName: 'Alban Mary',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Notes d\'infra - Blog d\'Alban Mary',
    description: BLOG_DESCRIPTION,
  },
  alternates: {
    canonical: 'https://albanmary.com/blog',
    types: {
      'application/rss+xml': [
        { url: '/blog/feed.xml', title: 'Blog Alban Mary - RSS Feed' },
      ],
    },
  },
};

const jsonLdBase = {
  '@context': 'https://schema.org',
  '@type': ['CollectionPage', 'ItemList'],
  name: 'Blog - Alban Mary',
  description: BLOG_DESCRIPTION,
  url: 'https://albanmary.com/blog',
  isPartOf: {
    '@type': 'WebSite',
    '@id': 'https://albanmary.com/#website',
  },
  author: {
    '@type': 'Person',
    name: 'Alban Mary',
    url: 'https://albanmary.com',
  },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://albanmary.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: 'https://albanmary.com/blog',
      },
    ],
  },
};

export const dynamic = 'force-dynamic';

export default function BlogPage() {
  const posts = getPublishedPosts().map(getPostSummary);
  const tags = getAllTags();
  const categories = getAllCategories();

  const jsonLd = {
    ...jsonLdBase,
    itemListElement: posts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'BlogPosting',
        url: `https://albanmary.com/blog/${post.slug}`,
        name: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        author: {
          '@type': 'Person',
          name: post.author
        }
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogListClient posts={posts} tags={tags} categories={categories} />
    </>
  );
}
