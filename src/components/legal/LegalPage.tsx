'use client';

import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage, useLocalizedDocument } from '@/contexts/LanguageContext';
import { LEGAL, type LegalBlock, type LegalDocId } from '@/content/legal';
import { LEGAL_UPDATED_AT } from '@/config/legal';
import { formatPostDate } from '@/lib/blog/format';
import LegalLinks from './LegalLinks';
import AnalyticsOptOut from './AnalyticsOptOut';

const CONTAINER = 'mx-auto w-full max-w-[1280px] px-6 lg:px-14';

const UI = {
  fr: { updated: 'Dernière mise à jour', switchTo: 'EN', switchLabel: 'Passer le site en anglais' },
  en: { updated: 'Last updated', switchTo: 'FR', switchLabel: 'Switch the site to French' },
};

const LINK_CLASS = 'font-medium border-b-2 border-[var(--accent)] hover:no-underline hover:text-[var(--accent)] transition-colors';

/** Turns the "[label](href)" links of the legal texts into anchors. */
function inline(text: string): ReactNode[] {
  return text.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (!link) return <Fragment key={i}>{part}</Fragment>;
    const [, label, href] = link;
    if (href.startsWith('/')) {
      return <Link key={i} href={href} className={LINK_CLASS}>{label}</Link>;
    }
    const external = href.startsWith('http');
    return (
      <a key={i} href={href} className={LINK_CLASS} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {label}
      </a>
    );
  });
}

function Block({ block }: { block: LegalBlock }) {
  if (typeof block === 'string') return <p className="m-0">{inline(block)}</p>;
  if ('optOut' in block) return <AnalyticsOptOut />;
  return (
    <ul className="m-0 pl-5 list-disc flex flex-col gap-2 marker:text-[#68655f]">
      {block.list.map((item) => (
        <li key={item}>{inline(item)}</li>
      ))}
    </ul>
  );
}

/** Legal notice / privacy policy, light page in the site style, FR + EN. */
export default function LegalPage({ doc: id }: { doc: LegalDocId }) {
  const { language, setLanguage } = useLanguage();
  const doc = LEGAL[language][id];
  const ui = UI[language];
  useLocalizedDocument({ title: `${doc.title} | Alban Mary`, description: doc.description });

  return (
    <main className="bg-[#f3f1ec] text-[#141414] font-sans min-h-screen">
      <div className={CONTAINER}>
        <header className="grid grid-cols-2 lg:grid-cols-12 gap-5 items-center py-7 text-sm font-medium">
          <Link href="/" className="lg:col-span-3 text-base font-semibold hover:no-underline">
            Alban Mary<span className="text-[var(--accent)]">.</span>
          </Link>
          <nav className="hidden lg:flex lg:col-span-7 gap-7 text-[#4a4a48]">
            <Link href="/" className="hover:text-[#141414] hover:no-underline transition-colors">Portfolio</Link>
            <Link href="/blog/" className="hover:text-[#141414] hover:no-underline transition-colors">Articles</Link>
          </nav>
          <button
            onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            className="lg:col-span-2 justify-self-end border-b-2 border-[#141414] pb-0.5 font-bold cursor-pointer"
            aria-label={ui.switchLabel}
          >
            {ui.switchTo}
          </button>
        </header>

        <section className="grid lg:grid-cols-12 gap-5 pt-10 lg:pt-16 pb-14 border-b-2 border-[#141414]">
          <div className="lg:col-span-3 font-plex text-[13px]">({doc.label})</div>
          <div className="lg:col-span-9 flex flex-col gap-6">
            <h1 className="m-0 font-extrabold tracking-[-0.05em]" style={{ fontSize: 'clamp(44px, 8vw, 96px)', lineHeight: 0.92 }}>
              {doc.title}
            </h1>
            <p className="m-0 text-[18px] leading-[1.6] text-[#4a4a48] max-w-[640px]">{doc.intro}</p>
            <span className="font-plex text-[12px] text-[#68655f]">
              {ui.updated} : {formatPostDate(LEGAL_UPDATED_AT, language)}
            </span>
          </div>
        </section>

        {doc.sections.map((section, i) => (
          <section key={section.title} className="grid lg:grid-cols-12 gap-x-5 gap-y-4 pt-10 lg:pt-14">
            <h2 className="lg:col-span-3 m-0 font-plex text-[13px] font-normal">
              ({String(i + 1).padStart(2, '0')}) {section.title}
            </h2>
            <div className="lg:col-span-7 flex flex-col gap-4 text-[18px] leading-[1.6] text-[#2a2a28]">
              {section.blocks.map((block, j) => (
                <Block key={j} block={block} />
              ))}
            </div>
          </section>
        ))}

        <footer className="mt-24 py-6 border-t border-[#c9c5bd] text-[13px] flex flex-wrap justify-between gap-x-5 gap-y-2">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <span>© 2026 Alban Mary</span>
            <LegalLinks lang={language} />
          </div>
          <div className="flex gap-5">
            <a href="https://github.com/Kidoly" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
              GitHub <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
            </a>
            <a href="https://www.linkedin.com/in/alban-mary/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1">
              LinkedIn <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
