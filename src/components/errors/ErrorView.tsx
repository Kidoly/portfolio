import type { CSSProperties, ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { LEGAL_LABELS } from '@/components/legal/LegalLinks';

const CONTAINER = 'mx-auto w-full max-w-[1280px] px-6 lg:px-14';

export interface ErrorCopy {
  title: string;
  text: string;
  home: string;
  blog: string;
}

interface Props {
  lang: 'fr' | 'en';
  /** "404", "500"… shown as the huge heading */
  code: string;
  /** Terminal lines above the heading: the command, then its output */
  prompt: string;
  output: ReactNode;
  copy: ErrorCopy;
  /** Extra primary action (e.g. "Try again"), shown before the links */
  action?: ReactNode;
}

const PILL = 'rounded-full px-6 py-3.5 transition-colors hover:no-underline';

/**
 * Error page in the 4b "Hero sombre" style. Plain anchors and no context so it
 * also renders from global-error, when the root layout itself failed.
 */
export default function ErrorView({ lang, code, prompt, output, copy, action }: Props) {
  return (
    <main className="min-h-screen bg-[#0e100f] text-[#e4e7e4] font-sans flex flex-col">
      <div className={CONTAINER}>
        <header className="flex justify-between items-center gap-5 py-7 text-sm font-medium">
          <a href="/" className="text-base font-semibold hover:no-underline">
            Alban Mary<span className="text-[var(--accent-on-dark)]">.</span>
          </a>
          <nav className="flex gap-7 text-[#9aa19c]">
            <a href="/" className="hover:text-white hover:no-underline transition-colors">Portfolio</a>
            <a href="/blog/" className="hover:text-white hover:no-underline transition-colors">Articles</a>
          </nav>
        </header>
      </div>

      <div className={`${CONTAINER} flex-1 flex flex-col justify-center gap-8 lg:gap-10 py-14`}>
        <div className="font-mono text-[13px] flex flex-col gap-1.5 break-all">
          <span className="text-[#7d8580] typing" style={{ '--steps': prompt.length } as CSSProperties}>
            {prompt}
          </span>
          <span className="text-[#9aa19c] boot" style={{ '--d': '1s' } as CSSProperties}>
            {output}
          </span>
        </div>
        <h1
          className="m-0 font-extrabold leading-[0.84] tracking-[-0.055em]"
          style={{ fontSize: 'clamp(120px, 26vw, 280px)' }}
        >
          {code}
          <span className="text-[var(--accent-on-dark)] cursor-blink">.</span>
        </h1>
        <div className="flex flex-col gap-6 max-w-[620px]">
          <p className="m-0 font-medium tracking-[-0.015em]" style={{ fontSize: 'clamp(26px, 4vw, 38px)', lineHeight: 1.12 }}>
            {copy.title}
          </p>
          <p className="m-0 text-[18px] leading-[1.55] text-[#9aa19c]">{copy.text}</p>
          <div className="flex flex-wrap gap-3 items-center text-[15px] font-bold pt-1">
            {action}
            <a
              href="/"
              className={
                action
                  ? `${PILL} border-2 border-[#e4e7e4] px-5 py-3 hover:bg-[#e4e7e4] hover:text-[#0e100f]`
                  : `${PILL} bg-[#e4e7e4] text-[#0e100f] hover:bg-[var(--accent)] hover:text-[#f3f1ec]`
              }
            >
              {copy.home}
            </a>
            <a href="/blog/" className="px-2.5 py-3 border-b-2 border-[var(--accent-on-dark)] hover:no-underline">
              {copy.blog}
            </a>
          </div>
        </div>
      </div>

      <div className={CONTAINER}>
        <footer className="py-6 border-t border-[#232825] text-[13px] text-[#9aa19c] flex flex-wrap justify-between gap-x-5 gap-y-2">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <span>© 2026 Alban Mary</span>
            <a href="/mentions-legales/" className="hover:text-white">{LEGAL_LABELS[lang].mentions}</a>
            <a href="/confidentialite/" className="hover:text-white">{LEGAL_LABELS[lang].privacy}</a>
          </div>
          <div className="flex gap-5">
            <a href="https://github.com/Kidoly" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-white">
              GitHub <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
            </a>
            <a href="https://www.linkedin.com/in/alban-mary/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-white">
              LinkedIn <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
