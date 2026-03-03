import { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedPosts, getAllTags, getAllCategories } from '@/lib/blog/posts';
import { BlogPostMeta } from '@/lib/blog/types';
import { Calendar, Clock, Tag, ArrowLeft, Search } from 'lucide-react';
import BlogListClient from './BlogListClient';

export const metadata: Metadata = {
  title: 'Blog - Alban Mary | Articles Tech & Cybersécurité',
  description:
    'Découvrez les articles d\'Alban Mary sur le développement web, l\'administration système, la cybersécurité et les réseaux. Tutoriels, guides et retours d\'expérience.',
  keywords:
    'blog, développement web, cybersécurité, réseaux, système, linux, docker, tutoriel, guide',
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
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'Blog - Alban Mary',
  description:
    'Articles sur le développement web, l\'administration système et la cybersécurité',
  url: 'https://albanmary.com/blog',
  author: {
    '@type': 'Person',
    name: 'Alban Mary',
    url: 'https://albanmary.com',
  },
};

export const dynamic = 'force-dynamic';

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
      <main className="min-h-screen bg-gray-50">
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
