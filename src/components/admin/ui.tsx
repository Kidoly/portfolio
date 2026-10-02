import type { ReactNode } from 'react';

/* Back office building blocks, in the site's 4b design (tokens in globals.css): ink on paper,
   square corners, pills for actions, Plex/JetBrains Mono for labels and terminal touches. */

const BTN =
  'inline-flex items-center justify-center gap-2 rounded-full font-bold text-[14px] whitespace-nowrap transition-colors cursor-pointer hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed';
export const BTN_PRIMARY = `${BTN} bg-[#141414] text-[#f3f1ec] px-5 py-2.5 hover:bg-[var(--accent)] disabled:hover:bg-[#141414]`;
export const BTN_SECONDARY = `${BTN} border-2 border-[#141414] px-[18px] py-2 hover:bg-[#141414] hover:text-[#f3f1ec]`;
export const BTN_DANGER = `${BTN} border-2 border-[var(--accent)] text-[var(--accent)] px-[18px] py-2 hover:bg-[var(--accent)] hover:text-[#f3f1ec]`;
export const ICON_BTN =
  'inline-flex items-center justify-center w-9 h-9 text-[#4a4a48] hover:text-[#141414] hover:bg-[#e6e3dc] transition-colors cursor-pointer';

export const INPUT =
  'w-full bg-white/70 border border-[#c9c5bd] px-3 py-2.5 text-[15px] text-[#141414] outline-none transition-colors focus:border-[#141414] placeholder:text-[#68655f]';
export const LABEL = 'block font-plex text-[12px] text-[#4a4a48] mb-1.5';
export const HINT = 'font-plex text-[12px] text-[#68655f] mt-1.5';
export const TAG = 'inline-flex items-center gap-1 font-mono text-[12px] bg-[#e6e3dc] text-[#141414] px-2 py-1';

/** Filter pill (« Tous », « Publiés »…), dark when selected. */
export function pill(on: boolean) {
  return `cursor-pointer rounded-full px-3.5 py-1.5 border font-mono text-[13px] transition-colors ${
    on ? 'bg-[#141414] text-[#f3f1ec] border-[#141414]' : 'border-[#c9c5bd] hover:border-[#141414]'
  }`;
}

/** Page title with a terminal prompt above it and the actions on the right. */
export function PageHeader({ prompt, title, children }: { prompt: string; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-5 pb-8 lg:pb-10">
      <div className="flex flex-col gap-3 min-w-0">
        <span className="font-mono text-[13px] text-[#68655f] break-all">{prompt}</span>
        <h1 className="m-0 font-extrabold tracking-[-0.045em] leading-[0.95]" style={{ fontSize: 'clamp(36px, 5vw, 56px)' }}>
          {title}
          <span className="text-[var(--accent)]">.</span>
        </h1>
      </div>
      {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
    </div>
  );
}

/** Section label, as on the site: « (01) Raccourcis ». */
export function SectionLabel({ n, children }: { n: string; children: ReactNode }) {
  return (
    <h2 className="m-0 font-plex text-[13px] font-normal pb-4">
      ({n}) {children}
    </h2>
  );
}

export function Loading({ dark = false }: { dark?: boolean }) {
  return (
    <div role="status" className={`font-mono text-[13px] py-20 flex justify-center ${dark ? 'text-[#7d8580]' : 'text-[#68655f]'}`}>
      chargement<span className="animate-pulse">_</span>
    </div>
  );
}

/** « ● publié » / « ○ brouillon », the dot is decorative: the word carries the status. */
export function Status({ on, labels = ['publié', 'brouillon'] }: { on: boolean; labels?: [string, string] }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[12px] whitespace-nowrap">
      <span
        aria-hidden="true"
        className={`size-2 rounded-full ${on ? 'bg-[oklch(0.62_0.15_150)]' : 'border border-[#68655f]'}`}
      />
      {on ? labels[0] : labels[1]}
    </span>
  );
}

/** Framed message, like the notes of the articles; errors get the accent. */
export function Notice({ tone = 'info', title, children }: { tone?: 'info' | 'error' | 'success'; title?: string; children: ReactNode }) {
  const border = tone === 'error' ? 'border-[var(--accent)]' : 'border-[#141414]';
  const label = title ?? (tone === 'error' ? 'erreur' : tone === 'success' ? 'ok' : 'info');
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`border-2 ${border} px-5 py-4 flex flex-col gap-1.5 text-[15px] leading-[1.55]`}>
      <span className={`font-plex text-[12px] ${tone === 'error' ? 'text-[var(--accent)]' : 'text-[#4a4a48]'}`}>{label}</span>
      <div>{children}</div>
    </div>
  );
}

/** Big figure with its label under a 2px rule, like the stats band of the home page. */
export function Stat({ value, label }: { value: ReactNode; label: string }) {
  return (
    <div className="border-t-2 border-[#141414] pt-4 pr-4 flex flex-col gap-1">
      <span className="font-extrabold tracking-[-0.04em] leading-none text-[44px]">{value}</span>
      <span className="text-[14px] text-[#4a4a48]">{label}</span>
    </div>
  );
}

/** Readable message of a failed API call: its { error } body when there is one. */
export async function readError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    if (typeof data?.error === 'string') return data.error;
  } catch {}
  return `erreur ${res.status}`;
}

export function formatDate(iso: string, withTime = false) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('fr-FR', withTime ? { dateStyle: 'short', timeStyle: 'short' } : { dateStyle: 'medium' });
}
