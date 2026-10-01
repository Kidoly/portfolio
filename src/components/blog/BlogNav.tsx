'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

/**
 * Blog header row - designed to sit inside a dark (#0e100f) hero block.
 * Nav is simplified across the blog: logo · Portfolio · Articles (active) · RSS.
 */
export default function BlogNav() {
  return (
    <header className="mx-auto w-full max-w-[1280px] px-6 lg:px-14">
      <div className="grid grid-cols-2 lg:grid-cols-12 gap-5 items-center py-7 text-sm font-medium text-[#e4e7e4]">
        <Link href="/" className="lg:col-span-3 text-base font-semibold hover:no-underline">
          Alban Mary<span className="text-[var(--accent-on-dark)]">.</span>
        </Link>
        <nav className="hidden lg:flex lg:col-span-7 gap-7">
          <Link href="/" className="text-[#9aa19c] hover:text-white hover:no-underline transition-colors">
            Portfolio
          </Link>
          <span className="border-b-2 border-[var(--accent-on-dark)] pb-0.5">Articles</span>
        </nav>
        <a
          href="/blog/feed.xml"
          className="lg:col-span-2 justify-self-end inline-flex items-center gap-1 font-mono text-[12px] border border-[#333a36] px-2.5 py-1.5 hover:border-[#e4e7e4] hover:no-underline transition-colors"
          title="Flux RSS"
        >
          RSS <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
        </a>
      </div>
    </header>
  );
}
