import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Look of the images the site draws with satori: share cards (og.png) and the
 * GitHub profile README cards (/github/*.svg). One place to change with the design.
 */

// The site's dark tokens (globals.css) in sRGB: satori does not parse oklch()
export const IMAGE_COLORS = {
  bg: '#0e100f', // --dark
  panel: '#161917', // --panel
  panel2: '#131614', // --panel-2
  rule: '#232825', // --drule
  rule2: '#2c322e', // --drule-2
  text: '#e4e7e4', // --dtext
  text2: '#9aa19c', // --dtext-2
  dim: '#7d8580', // --dim
  faint: '#6c736e', // share cards' small print
  accent: '#d73626', // oklch(0.58 0.2 30)
  accentOnDark: '#ea4f3b', // --accent-on-dark
  ok: '#6de18b', // --ok
  // Contribution heatmap: none, then the accent at rising strength
  heat: ['#1b1f1d', '#4a1f19', '#7a2a1f', '#a83024', '#d73626'],
};

type FontWeight = 500 | 800;
export type ImageFont = { name: string; data: Buffer; weight: FontWeight | 400; style: 'normal' };

const read = (file: string) => readFile(join(process.cwd(), 'assets', 'fonts', file));

let files: Promise<{ archivo500: Buffer; archivo800: Buffer; mono: Buffer }> | undefined;

/** Font files of the images (latin subset, WOFF: satori cannot read WOFF2), read once. */
export function imageFontFiles() {
  files ??= Promise.all([read('Archivo-500.woff'), read('Archivo-800.woff'), read('JetBrainsMono-400.woff')]).then(
    ([archivo500, archivo800, mono]) => ({ archivo500, archivo800, mono })
  );
  return files;
}

/** Archivo 500/800 + JetBrains Mono, as satori / next/og take them. */
export async function loadImageFonts(): Promise<ImageFont[]> {
  const { archivo500, archivo800, mono } = await imageFontFiles();
  return [
    { name: 'Archivo', data: archivo800, weight: 800, style: 'normal' },
    { name: 'Archivo', data: archivo500, weight: 500, style: 'normal' },
    { name: 'JetBrains Mono', data: mono, weight: 400, style: 'normal' },
  ];
}
