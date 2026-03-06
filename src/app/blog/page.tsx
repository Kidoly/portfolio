import { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedPosts, getAllTags, getAllCategories } from '@/lib/blog/posts';
import { BlogPostMeta } from '@/lib/blog/types';
import { Calendar, Clock, Tag, ArrowLeft, Search } from 'lucide-react';
import BlogListClient from './BlogListClient';
import BlogNav from '@/components/blog/BlogNav';

export const metadata: Metadata = {
  title: 'Blog — Articles Tech, Systèmes & Cybersécurité',
  description:
    'Découvrez les articles d\'Alban Mary sur le développement web, l\'administration système, la cybersécurité et les réseaux. Tutoriels, guides et retours d\'expérience.',
  keywords: [
    'blog tech', 'tutoriel linux', 'guide cybersécurité', 'administration système',
    'docker', 'proxmox', 'développement web', 'devops', 'réseau',
  ],
  openGraph: {
    title: 'Blog — Alban Mary | Articles Tech & Cybersécurité',
    description:
      'Articles sur le développement web, l\'administration système, la cybersécurité et les réseaux.',
    url: 'https://albanmary.com/blog',
    type: 'website',
    siteName: 'Alban Mary',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog — Alban Mary',
    description:
      'Articles sur le développement web, la cybersécurité et les réseaux.',
  },
  alternates: {
    canonical: 'https://albanmary.com/blog',
    types: {
      'application/rss+xml': [
        { url: '/blog/feed.xml', title: 'Blog Alban Mary — RSS Feed' },
      ],
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Blog — Alban Mary',
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

export const revalidate = 60;

export default function BlogPage() {
  const posts = getPublishedPosts();
  const tags = getAllTags();
  const categories = getAllCategories();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogNav />
      <main className="min-h-screen bg-gray-50 pt-16">
        {/* Hero Banner */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white py-20">
          <div className="container mx-auto px-6">
            <Link
              href="/"
              className="inline-flex items-center text-blue-300 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au portfolio
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog</h1>
            <p className="text-xl text-blue-200 max-w-2xl">
              Articles, tutoriels et retours d&apos;expérience sur le développement,
              les réseaux et la cybersécurité.
            </p>
          </div>
        </section>

        {/* Blog Content */}
        <BlogListClient posts={posts} tags={tags} categories={categories} />
      </main>
    </>
  );
}
