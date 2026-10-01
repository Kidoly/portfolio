import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getPostDescription, getRelatedPosts } from '@/lib/blog/posts';
import { renderArticle, generateSeoTitle, getReadingTime } from '@/lib/blog/markdown';
import { formatPostDate } from '@/lib/blog/format';
import { ArrowUpRight } from 'lucide-react';
import BlogNav from '@/components/blog/BlogNav';
import TableOfContents from '@/components/blog/TableOfContents';
import CommentsSection from '@/components/blog/CommentsSection';
import CodeBlockCopyButtons from '@/components/blog/CodeBlockCopyButtons';

const CONTAINER = 'mx-auto w-full max-w-[1280px] px-6 lg:px-14';

interface Props {
  params: Promise<{ slug: string }>;
}

// Articles live in the runtime volume (content/blog), not in the build: always
// render per request so a deploy can never serve HTML baked from an older
// snapshot or template. The per-request CSP nonce requires it anyway.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return { title: 'Article non trouvé' };
  }

  const title = post.seoTitle || generateSeoTitle(post.title);
  const description = getPostDescription(post);

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
      ...(post.coverImage && {
        images: [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }]
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(post.coverImage && { images: [post.coverImage] }),
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

  const description = getPostDescription(post);
  const { html: contentHtml, toc } = await renderArticle(post.content, { title: post.title });
  const relatedPosts = getRelatedPosts(post, 2);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `https://albanmary.com/blog/${post.slug}`,
    headline: post.title,
    description,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }}
      />
      <main className="bg-[#f3f1ec] text-[#141414] font-sans min-h-screen">
        {/* Dark hero */}
        <div className="bg-[#0e100f] text-[#e4e7e4] pb-16 lg:pb-[72px]">
          <BlogNav />
          <div className={CONTAINER}>
            <div className="grid lg:grid-cols-12 gap-5 pt-8 lg:pt-12">
              <div className="lg:col-span-3 font-mono text-[13px]">
                <Link href="/blog/" className="text-[#9aa19c] hover:text-white hover:no-underline">← Articles</Link>
              </div>
              <div className="lg:col-span-9 flex flex-col gap-6">
                {post.category && (
                  <span className="font-mono text-[12px] border border-[#2c322e] text-[var(--ok)] px-2 py-1 self-start">
                    {post.category}
                  </span>
                )}
                <h1 className="m-0 font-extrabold tracking-[-0.045em]" style={{ fontSize: 'clamp(38px, 7vw, 80px)', lineHeight: 0.95 }}>
                  {post.title}
                </h1>
                <p className="m-0 text-[20px] leading-[1.55] text-[#9aa19c] max-w-[720px]">{description}</p>
                <div className="flex flex-wrap gap-6 font-mono text-[13px] text-[#9aa19c] pt-3.5 border-t border-[#232825]">
                  <span className="text-[#e4e7e4]">{post.author}</span>
                  <span>{formatPostDate(post.publishedAt || post.updatedAt)}</span>
                  <span>{getReadingTime(post.content, post.locale)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body: TOC + article */}
        <div className={CONTAINER}>
          <div className="grid lg:grid-cols-12 gap-5 pt-12 lg:pt-[72px] items-start">
            {toc.length >= 2 && <TableOfContents items={toc} />}
            <div className="lg:col-span-7 lg:col-start-4 min-w-0">
              <CodeBlockCopyButtons />
              <div className="blog-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-8 mt-6 border-t-2 border-[#141414]">
                  {post.tags.map((tag) => (
                    <span key={tag} className="font-mono text-[13px] bg-[#e6e3dc] px-2.5 py-1.5">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Author card (dark, whoami style) */}
        <div className={CONTAINER}>
          <div className="grid lg:grid-cols-12 gap-5 pt-20">
            <div className="lg:col-span-7 lg:col-start-4 bg-[#0e100f] text-[#e4e7e4] font-mono text-[13px]">
              <div className="px-4 py-2.5 border-b border-[#232825] text-[#6c736e]">$ whoami</div>
              <div className="p-5 flex flex-col gap-3.5">
                <span className="font-sans text-[22px] font-bold">Alban Mary</span>
                <span className="font-sans text-[16px] leading-[1.55] text-[#9aa19c]">
                  Administrateur systèmes &amp; réseaux, orienté cybersécurité. Étudiant à l&apos;EPSI Nantes. J&apos;écris ici ce que je mets en place.
                </span>
                <div className="flex flex-wrap gap-5">
                  <Link href="/" className="text-[var(--ok)] hover:no-underline">Portfolio →</Link>
                  <a href="https://github.com/Kidoly" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">GitHub <ArrowUpRight className="w-3.5 h-3.5" aria-hidden /></a>
                  <a href="https://www.linkedin.com/in/alban-mary/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">LinkedIn <ArrowUpRight className="w-3.5 h-3.5" aria-hidden /></a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className={CONTAINER}>
          <div className="grid lg:grid-cols-12 gap-5 pt-24">
            <div className="font-plex text-[13px] lg:col-span-3">(Commentaires)</div>
            <div className="lg:col-span-7">
              <CommentsSection slug={post.slug} />
            </div>
          </div>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className={CONTAINER}>
            <div className="grid lg:grid-cols-12 gap-5 pt-24 pb-20">
              <div className="font-plex text-[13px] lg:col-span-3">(À lire aussi)</div>
              <div className="lg:col-span-9 flex flex-col border-b-2 border-[#141414]">
                {relatedPosts.map((rp) => (
                  <Link
                    key={rp.id}
                    href={`/blog/${rp.slug}/`}
                    className="grid grid-cols-[1fr_auto] lg:grid-cols-[130px_minmax(0,1fr)_150px_24px] gap-x-5 gap-y-2 items-baseline py-5 border-t-2 border-[#141414] hover:text-[var(--accent)] hover:no-underline transition-colors"
                  >
                    <span className="font-plex text-[12px] text-[#8a8680] order-1">{formatPostDate(rp.publishedAt || rp.updatedAt)}</span>
                    <span className="text-[22px] font-bold tracking-[-0.015em] leading-[1.2] col-span-2 lg:col-span-1 order-3 lg:order-2">{rp.title}</span>
                    <span className="font-mono text-[12px] bg-[#e6e3dc] text-[#141414] px-2 py-1 justify-self-start order-2 lg:order-3">{rp.category}</span>
                    <span className="text-[var(--accent)] justify-self-end hidden lg:flex items-center order-4"><ArrowUpRight className="w-4 h-4" strokeWidth={2.5} aria-hidden /></span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={CONTAINER}>
          <footer className="py-6 border-t border-[#c9c5bd] text-[13px] flex justify-between">
            <span>© 2026 Alban Mary</span>
            <div className="flex gap-5">
              <a href="https://github.com/Kidoly" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://www.linkedin.com/in/alban-mary/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <Link href="/blog/feed.xml">RSS</Link>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
