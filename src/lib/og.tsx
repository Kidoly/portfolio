import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Shared Open Graph image style (direction 4b "Hero sombre"). */

export const OG_SIZE = { width: 1200, height: 630 };

export const OG_TAGLINE = 'Administrateur systèmes & réseaux, orienté cybersécurité.';

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
