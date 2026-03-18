'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract all h2 and h3 headings from the article
    const articleElement = document.querySelector('.blog-content');
    if (!articleElement) return;

    const headingElements = Array.from(
      articleElement.querySelectorAll('h2, h3')
    ) as HTMLElement[];

    const extractedHeadings = headingElements
      .filter((el) => el.id) // Only include headings with IDs (added by rehype-slug)
      .map((el) => ({
        id: el.id,
        text: el.textContent || '',
        level: parseInt(el.tagName[1], 10),
      }));

    setHeadings(extractedHeadings);

    // Track active heading on scroll
    const handleScroll = () => {
      const headingPositions = headingElements.map((el) => ({
        id: el.id,
        top: el.getBoundingClientRect().top,
      }));

      const activeHeading = headingPositions.find((pos) => pos.top > 0);
      if (activeHeading) {
        setActiveId(activeHeading.id);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (headings.length === 0) return null;

  return (
    <aside className="hidden lg:block sticky top-20 h-fit">
      <nav className="bg-gray-100 p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Table of Contents</h3>
        <ul className="space-y-1 text-sm">
          {headings.map((heading) => {
            const isH2 = heading.level === 2;
            return (
              <li
                key={heading.id}
                style={{ paddingLeft: `${(heading.level - 2) * 16}px` }}
              >
                <Link
                  href={`#${heading.id}`}
                  className={`block transition-all py-1 px-2 rounded ${
                    isH2 ? 'font-semibold' : 'font-normal'
                  } ${
                    activeId === heading.id
                      ? isH2
                        ? 'text-blue-700 bg-blue-100'
                        : 'text-blue-600 bg-blue-50'
                      : isH2
                        ? 'text-gray-800 hover:text-blue-600 hover:bg-blue-50'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {heading.text}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
