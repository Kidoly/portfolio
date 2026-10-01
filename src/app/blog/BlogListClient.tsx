'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { BlogPostMeta } from '@/lib/blog/types';
import BlogNav from '@/components/blog/BlogNav';
import LegalLinks from '@/components/legal/LegalLinks';
import { formatPostDate } from '@/lib/blog/format';

interface Props {
  posts: BlogPostMeta[];
  tags: string[];
  categories: string[];
}

/** Tag filter URL; the fragment brings the visitor back to the article list. */
function tagHref(tag: string): string {
  return tag ? `/blog/?tag=${encodeURIComponent(tag)}#articles` : '/blog/#articles';
}

export default function BlogListClient({ posts, tags, categories }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();
  // ?tag= filters on load (also from the article tags); ?q= pre-fills the search
  const tag = searchParams.get('tag') ?? '';
  const [q, setQ] = useState(() => searchParams.get('q') ?? '');
  const [category, setCategory] = useState('Tous');

  const query = q.trim().toLowerCase();
  const cats = useMemo(() => ['Tous', ...categories], [categories]);

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const matchCat = category === 'Tous' || post.category === category;
      const matchTag = !tag || post.tags.includes(tag);
      const haystack = [post.title, post.description, post.category, ...post.tags].join(' ').toLowerCase();
      const matchSearch = !query || haystack.includes(query);
      return matchCat && matchTag && matchSearch;
    });
  }, [posts, category, tag, query]);

  const clearFilters = () => {
    setQ('');
    setCategory('Tous');
    if (tag) router.replace(tagHref(''), { scroll: false });
  };

  return (
    <main className="bg-[#f3f1ec] text-[#141414] font-sans min-h-screen">
      {/* Dark hero */}
      <div className="bg-[#0e100f] text-[#e4e7e4] pb-20">
        <BlogNav />

        <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-14">
          <div className="grid lg:grid-cols-12 gap-5 pt-10 lg:pt-16 items-end">
            <div className="lg:col-span-8 flex flex-col gap-5">
              <span className="font-mono text-[13px] text-[#7d8580]">$ ls ~/blog</span>
              <h1 className="m-0 font-extrabold leading-[0.86] tracking-[-0.055em]" style={{ fontSize: 'clamp(56px, 13vw, 168px)' }}>
                Notes<br />d&apos;infra<span className="text-[var(--accent-on-dark)]">.</span>
              </h1>
            </div>
            <p className="lg:col-span-4 m-0 text-[18px] leading-[1.55] text-[#9aa19c]">
              Virtualisation, conteneurs, réseau et sécurité : ce que je mets en place dans mon homelab et en alternance, documenté pas à pas.
            </p>
          </div>

          {/* Search + filters */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 pt-14 font-mono text-[13px]">
            <label className="flex-1 max-w-[520px] flex items-center gap-3 border border-[#333a36] bg-[#131614] px-4 focus-within:border-[#e4e7e4] transition-colors">
              <span className="text-[var(--ok)]">$ grep</span>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Rechercher un article, un tag…"
                className="flex-1 bg-transparent border-none outline-none text-[#e4e7e4] py-3.5 font-mono text-[14px] placeholder:text-[#7d8580]"
              />
              {q && (
                <button onClick={() => setQ('')} className="text-[#9aa19c] hover:text-[#e4e7e4] cursor-pointer font-mono text-[12px]">
                  effacer
                </button>
              )}
            </label>
            <div className="flex flex-wrap gap-2">
              {cats.map((c) => {
                const on = c === category;
                const count = c === 'Tous' ? posts.length : posts.filter((p) => p.category === c).length;
                return (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`cursor-pointer rounded-full px-3.5 py-2 border transition-colors ${
                      on ? 'bg-[#e4e7e4] text-[#0e100f] border-[#e4e7e4]' : 'bg-transparent text-[#e4e7e4] border-[#333a36] hover:border-[#e4e7e4]'
                    }`}
                  >
                    {c} <span className="opacity-60">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Article list */}
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-14">
        <section id="articles" className="grid lg:grid-cols-12 gap-5 pt-20 lg:pt-[88px]">
          <div className="lg:col-span-3 flex flex-col items-start gap-3">
            <span className="font-plex text-[13px]">(Articles)</span>
            {tag && (
              <Link
                href={tagHref('')}
                scroll={false}
                aria-label={`Retirer le filtre #${tag}`}
                className="font-mono text-[13px] bg-[#141414] text-[#f3f1ec] px-2.5 py-1.5 hover:bg-[var(--accent)] hover:no-underline transition-colors"
              >
                #{tag} ×
              </Link>
            )}
          </div>
          <div className="lg:col-span-9 flex flex-col border-b-2 border-[#141414]">
            {filtered.length === 0 ? (
              <div className="border-t-2 border-[#141414] py-10 flex flex-col gap-2.5">
                <span className="text-[24px] font-bold">Aucun article pour {q.trim() ? `« ${q.trim()} »` : tag ? `#${tag}` : 'ce filtre'}.</span>
                <button
                  onClick={clearFilters}
                  className="self-start border-b-2 border-[var(--accent)] pb-0.5 cursor-pointer font-bold text-[15px]"
                >
                  Effacer la recherche
                </button>
              </div>
            ) : (
              filtered.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}/`}
                  className="grid grid-cols-1 sm:grid-cols-[130px_minmax(0,1fr)_110px] gap-x-6 gap-y-3 items-start py-7 -mx-5 px-5 border-t-2 border-[#141414] hover:bg-[#e9e6df] hover:no-underline transition-colors"
                >
                  <div className="flex flex-col gap-2.5 pt-1.5">
                    <span className="font-plex text-[12px] text-[#68655f]">{formatPostDate(post.publishedAt || post.updatedAt)}</span>
                    <span className="font-mono text-[12px] bg-[#e6e3dc] text-[#141414] px-2 py-1 self-start">{post.category}</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[28px] font-bold tracking-[-0.02em] leading-[1.15]">{post.title}</span>
                    <span className="text-[16px] leading-[1.55] text-[#4a4a48] max-w-[620px]">{post.description}</span>
                  </div>
                  <span className="sm:justify-self-end pt-1.5 font-bold text-[15px] whitespace-nowrap border-b-2 border-[var(--accent)] pb-0.5 self-start">
                    Lire →
                  </span>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Tags cloud */}
        {tags.length > 0 && (
          <section className="grid lg:grid-cols-12 gap-5 pt-24 pb-20">
            <div className="font-plex text-[13px] lg:col-span-3">(Tags)</div>
            <div className="lg:col-span-9 flex flex-wrap gap-2">
              {tags.map((t) => {
                const active = t === tag;
                return (
                  <Link
                    key={t}
                    href={tagHref(active ? '' : t)}
                    aria-current={active ? 'true' : undefined}
                    className={`font-mono text-[13px] border px-2.5 py-1.5 hover:no-underline transition-colors ${
                      active
                        ? 'bg-[#141414] text-[#f3f1ec] border-[#141414]'
                        : 'border-[#c9c5bd] hover:border-[#141414]'
                    }`}
                  >
                    #{t}
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-14">
        <footer className="py-6 border-t border-[#c9c5bd] text-[13px] flex flex-wrap justify-between gap-x-5 gap-y-2">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <span>© 2026 Alban Mary</span>
            <LegalLinks />
          </div>
          <div className="flex gap-5">
            <a href="https://github.com/Kidoly" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="https://www.linkedin.com/in/alban-mary/" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="/blog/feed.xml">RSS</a>
          </div>
        </footer>
      </div>
    </main>
  );
}
