'use client';

import { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const articleElement = document.querySelector('.blog-content');
    if (!articleElement) return;

    const headingElements = Array.from(articleElement.querySelectorAll('h2, h3')) as HTMLElement[];

    const extracted = headingElements
      .filter((el) => el.id)
      .map((el) => ({ id: el.id, text: el.textContent || '', level: parseInt(el.tagName[1], 10) }));

    setHeadings(extracted);

    const handleScroll = () => {
      const positions = headingElements.map((el) => ({ id: el.id, top: el.getBoundingClientRect().top }));
      const active = positions.find((pos) => pos.top > 0);
      if (active) setActiveId(active.id);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (headings.length === 0) return null;

  let h2Count = 0;

  return (
    <aside className="hidden lg:flex flex-col sticky top-6 h-fit font-plex text-[13px]">
      <span className="pb-3 text-[#8a8680]">(Sommaire)</span>
      {headings.map((h) => {
        const isH2 = h.level === 2;
        const num = isH2 ? String(++h2Count).padStart(2, '0') : '';
        const active = activeId === h.id;
        return (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`py-2.5 border-t border-[#c9c5bd] transition-colors hover:no-underline hover:text-[var(--accent)] ${
              active ? 'text-[#141414]' : 'text-[#4a4a48]'
            } ${isH2 ? '' : 'pl-4'}`}
          >
            {num && <span className="text-[var(--accent)] mr-2">{num}.</span>}
            {h.text}
          </a>
        );
      })}
    </aside>
  );
}
