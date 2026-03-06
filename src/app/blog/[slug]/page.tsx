import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPostBySlug, getPublishedPosts, getRelatedPosts } from '@/lib/blog/posts';
import { markdownToHtml, generateSeoTitle } from '@/lib/blog/markdown';
import { Calendar, Clock, ArrowLeft, Tag, User } from 'lucide-react';
import BlogNav from '@/components/blog/BlogNav';
import AuthorCard from '@/components/blog/AuthorCard';
import RelatedPosts from '@/components/blog/RelatedPosts';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateStaticParams() {
  const posts = getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: 'Article non trouvé' };
  }

  const title = post.seoTitle || generateSeoTitle(post.title);
  const description = post.seoDescription || post.description;

  return {
    title,
    description,
    keywords: post.tags,
    authors: [{ name: post.author, url: 'https://albanmary.com' }],
    openGraph: {
      title,
      description,
      url: `https://albanmary.com/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      tags: post.tags,
      section: post.category,
      siteName: 'Alban Mary',
      locale: post.locale === 'en' ? 'en_US' : 'fr_FR',
      images: post.coverImage
        ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: post.coverImage ? [post.coverImage] : [],
      creator: '@kidoly',
    },
    alternates: {
      canonical: post.canonicalUrl || `https://albanmary.com/blog/${post.slug}`,
    },
    other: {
      'article:published_time': post.publishedAt || '',
      'article:modified_time': post.updatedAt,
      'article:author': post.author,
      'article:section': post.category || '',
      'article:tag': post.tags.join(','),
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post || !post.published) {
    notFound();
  }

  const contentHtml = await markdownToHtml(post.content);
  const relatedPosts = getRelatedPosts(post, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `https://albanmary.com/blog/${post.slug}`,
    headline: post.title,
    description: post.description,
    author: {
      '@type': 'Person',
      '@id': 'https://albanmary.com/#person',
      name: post.author,
      url: 'https://albanmary.com',
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://albanmary.com/blog/${post.slug}`,
    },
    image: post.coverImage || 'https://albanmary.com/opengraph-image',
    thumbnailUrl: post.coverImage || 'https://albanmary.com/opengraph-image',
    publisher: {
      '@type': 'Person',
      '@id': 'https://albanmary.com/#person',
      name: 'Alban Mary',
      url: 'https://albanmary.com',
    },
    keywords: post.tags.join(', '),
    wordCount: post.content.split(/\s+/).length,
    articleSection: post.category || 'General',
    inLanguage: post.locale,
    isPartOf: {
      '@type': 'WebSite',
      '@id': 'https://albanmary.com/#website',
    },
    isAccessibleForFree: true,
    copyrightHolder: {
      '@type': 'Person',
      name: 'Alban Mary',
    },
  };

  // BreadcrumbList for SEO
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
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
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://albanmary.com/blog/${post.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BlogNav />
      <main className="min-h-screen bg-gray-50 pt-16">
        {/* Header */}
        <header className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white py-16">
          <div className="container mx-auto px-6 max-w-4xl">
            <Link
              href="/blog"
              className="inline-flex items-center text-blue-300 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au blog
            </Link>
            <div className="h-4"></div>

            {post.category && (
              <span className="inline-block bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
                {post.category}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              {post.title}
            </h1>

            <p className="text-lg text-blue-200 mb-6 max-w-2xl">
              {post.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-blue-300">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {post.author}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
              {post.readingTime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {post.readingTime}
                </span>
              )}
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {post.coverImage && (
          <div className="container mx-auto px-6 max-w-4xl -mt-8">
            <div className="relative w-full h-64 md:h-96">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 896px"
                priority
                className="object-cover rounded-xl shadow-lg"
              />
            </div>
          </div>
        )}

        {/* Article Content */}
        <article className="container mx-auto px-6 max-w-4xl py-12">
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm hover:bg-blue-50 hover:text-blue-700 transition"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Author Card — Portfolio CTA */}
          <AuthorCard />

          {/* Related Posts */}
          <RelatedPosts posts={relatedPosts} />
        </article>
      </main>
    </>
  );
}
