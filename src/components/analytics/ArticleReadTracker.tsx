'use client';

import { useEffect, useRef } from 'react';
import { track } from '@/lib/track';

/** Placed right after the article body: « article-read » once the reader gets to the end. */
export default function ArticleReadTracker({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // The huge top margin keeps the marker "visible" once scrolled past, even by a jump (End key, anchor)
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        track('article-read', { slug });
      },
      { rootMargin: '100000px 0px 0px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [slug]);

  return <div ref={ref} aria-hidden="true" />;
}
