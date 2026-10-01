'use client';

import { useEffect, useState } from 'react';
import type { TocItem } from '@/lib/blog/markdown';

/**
 * Sticky table of contents (desktop left column), built server-side from the
 * article H2s. The client only highlights the section being read.
 */
export default function TableOfContents({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);

    let frame = 0;
    const update = () => {
      frame = 0;
      const current = headings.filter((el) => el.getBoundingClientRect().top <= 120).pop();
      setActiveId(current?.id ?? '');
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [items]);

  return (
    <nav
      aria-label="Sommaire"
      className="hidden lg:flex lg:col-span-3 flex-col sticky top-6 self-start max-h-[calc(100vh-48px)] overflow-y-auto font-plex text-[13px]"
    >
      <span className="pb-3">(Sommaire)</span>
      {items.map((item, i) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          aria-current={activeId === item.id ? 'location' : undefined}
          className={`py-2.5 border-t border-[#c9c5bd] transition-colors hover:no-underline hover:text-[var(--accent)] ${
            activeId === item.id ? 'text-[#141414]' : 'text-[#4a4a48]'
          }`}
        >
          {i + 1}. {item.text}
        </a>
      ))}
    </nav>
  );
}
