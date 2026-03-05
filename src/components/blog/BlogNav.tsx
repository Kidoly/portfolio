'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Rss } from 'lucide-react';

export default function BlogNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
    >
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo / Home */}
        <Link
          href="/"
          className={`font-bold text-lg transition ${
            scrolled ? 'text-gray-900' : 'text-white'
          }`}
        >
          Alban Mary
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/blog/"
            className={`text-sm font-medium transition hover:text-blue-500 ${
              scrolled ? 'text-gray-600' : 'text-blue-200'
            }`}
          >
            Articles
          </Link>
          <Link
            href="/#projects"
            className={`text-sm font-medium transition hover:text-blue-500 ${
              scrolled ? 'text-gray-600' : 'text-blue-200'
            }`}
          >
            Projets
          </Link>
          <Link
            href="/#certifications"
            className={`text-sm font-medium transition hover:text-blue-500 ${
              scrolled ? 'text-gray-600' : 'text-blue-200'
            }`}
          >
            Certifications
          </Link>
          <Link
            href="/blog/feed.xml"
            className={`transition hover:text-orange-500 ${
              scrolled ? 'text-gray-400' : 'text-blue-300'
            }`}
            title="Flux RSS"
          >
            <Rss className="w-4 h-4" />
          </Link>
          <Link
            href="/#contact"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Me contacter
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className={`md:hidden transition ${
            scrolled ? 'text-gray-900' : 'text-white'
          }`}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-3">
            <Link href="/blog/" onClick={() => setOpen(false)} className="text-gray-700 font-medium py-2">
              Articles
            </Link>
            <Link href="/#projects" onClick={() => setOpen(false)} className="text-gray-700 font-medium py-2">
              Projets
            </Link>
            <Link href="/#certifications" onClick={() => setOpen(false)} className="text-gray-700 font-medium py-2">
              Certifications
            </Link>
            <Link
              href="/#contact"
              onClick={() => setOpen(false)}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium text-center hover:bg-blue-700 transition"
            >
              Me contacter
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
