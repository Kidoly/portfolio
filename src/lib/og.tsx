import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { ReactElement } from 'react';
import { ImageResponse } from 'next/og';

/**
 * Shared Open Graph image style (direction 4b "Hero sombre").
 *
 * Share cards are served by `og.png` route handlers rather than the
 * opengraph-image convention: with trailingSlash its extension-less URLs answer
 * a 308 to `/opengraph-image/`, one more hop for every crawler fetching them.
 */

export const OG_SIZE = { width: 1200, height: 630 };

/** og:image entry (twitter:image is filled from it) for a card served at `url`. */
export function ogImage(url: string, alt: string) {
  return { url, alt, type: 'image/png', ...OG_SIZE };
}

/** PNG response of a share card. */
export async function ogResponse(card: ReactElement): Promise<ImageResponse> {
  return new ImageResponse(card, { ...OG_SIZE, fonts: await loadOgFonts() });
}

export const OG_TAGLINE = 'Ingénieur systèmes & réseaux.';

// Satori does not parse oklch(): sRGB equivalents of the design tokens.
export const OG_COLORS = {
  bg: '#0e100f',
  text: '#e4e7e4',
  text2: '#9aa19c',
  dim: '#6c736e',
  rule: '#232825',
  rule2: '#2c322e',
  accent: '#d73626', // oklch(0.58 0.2 30)
  ok: '#6de18b', // oklch(0.82 0.16 150)
};

type OgFont = { name: string; data: Buffer; weight: 400 | 500 | 800; style: 'normal' };

let fonts: Promise<OgFont[]> | undefined;

/** Archivo 500/800 + JetBrains Mono (latin subset, WOFF: next/og cannot read WOFF2). */
export function loadOgFonts(): Promise<OgFont[]> {
  const read = (file: string) => readFile(join(process.cwd(), 'assets', 'fonts', file));
  fonts ??= Promise.all([read('Archivo-800.woff'), read('Archivo-500.woff'), read('JetBrainsMono-400.woff')]).then(
    ([archivo800, archivo500, mono]) => [
      { name: 'Archivo', data: archivo800, weight: 800, style: 'normal' },
      { name: 'Archivo', data: archivo500, weight: 500, style: 'normal' },
      { name: 'JetBrains Mono', data: mono, weight: 400, style: 'normal' },
    ]
  );
  return fonts;
}

/** "Alban Mary." with the dot in the accent colour. */
export function OgBrand({ size }: { size: number }) {
  return (
    <div
      style={{
        display: 'flex',
        fontFamily: 'Archivo',
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: '-0.045em',
        color: OG_COLORS.text,
      }}
    >
      Alban Mary<span style={{ color: OG_COLORS.accent }}>.</span>
    </div>
  );
}

function titleSize(title: string): number {
  if (title.length <= 32) return 88;
  if (title.length <= 48) return 76;
  if (title.length <= 72) return 64;
  return 54;
}

/** Share card of a page with a category tag and a title (articles, Proxmox page). */
export function OgTitleCard({ category, title, url = 'albanmary.com/blog' }: { category: string; title: string; url?: string }) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '60px 72px',
        background: OG_COLORS.bg,
        color: OG_COLORS.text,
        fontFamily: 'Archivo',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ display: 'flex' }}>
          <span
            style={{
              fontFamily: 'JetBrains Mono',
              fontSize: 24,
              color: OG_COLORS.ok,
              border: `1px solid ${OG_COLORS.rule2}`,
              padding: '6px 14px',
            }}
          >
            {category}
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            fontWeight: 800,
            fontSize: titleSize(title),
            lineHeight: 0.98,
            letterSpacing: '-0.045em',
          }}
        >
          {title}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          borderTop: `1px solid ${OG_COLORS.rule}`,
          paddingTop: 28,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <OgBrand size={44} />
          <span style={{ fontSize: 24, fontWeight: 500, color: OG_COLORS.text2 }}>{OG_TAGLINE}</span>
        </div>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 22, color: OG_COLORS.dim }}>{url}</span>
      </div>
    </div>
  );
}
