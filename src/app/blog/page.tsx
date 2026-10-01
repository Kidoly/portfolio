import { Metadata } from 'next';
import { getPublishedPosts, getAllTags, getAllCategories, getPostSummary } from '@/lib/blog/posts';
import BlogListClient from './BlogListClient';

export const metadata: Metadata = {
  title: 'Blog - Articles Tech, Systèmes & Cybersécurité',
  description:
    'Découvrez les articles d\'Alban Mary sur le développement web, l\'administration système, la cybersécurité et les réseaux. Tutoriels, guides et retours d\'expérience.',
  keywords: [
    'blog tech', 'tutoriel linux', 'guide cybersécurité', 'administration système',
    'docker', 'proxmox', 'développement web', 'devops', 'réseau',
  ],
  openGraph: {
    title: 'Blog - Alban Mary | Articles Tech & Cybersécurité',
    description:
      'Articles sur le développement web, l\'administration système, la cybersécurité et les réseaux.',
    url: 'https://albanmary.com/blog',
    type: 'website',
    siteName: 'Alban Mary',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog - Alban Mary',
    description:
      'Articles sur le développement web, la cybersécurité et les réseaux.',
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
  description:
    'Articles sur le développement web, l\'administration système et la cybersécurité',
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
