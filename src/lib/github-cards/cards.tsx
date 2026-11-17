import type { CSSProperties, ReactNode } from 'react';
import * as fontkit from 'fontkit';
import satori from 'satori';
import type { SimpleIcon } from 'simple-icons';
import { IMAGE_COLORS as C, imageFontFiles, loadImageFonts } from '@/lib/image-theme';
import { SITE_URL } from '@/lib/structured-data';
import { BANDS, BUTTONS, HERO, STACK, type Tool } from './content';
import { CARD_TTL_SECONDS, githubActivity, GITHUB_LOGIN, latestPost, type GithubActivity, type LatestPost, type Streak } from './data';

/**
 * Cards of the GitHub profile README (github.com/Kidoly), all served by the site at
 * /github/<name>.svg so that they follow its look. satori turns every glyph into a
 * path: GitHub shows the images through <img>, where web fonts never load.
 */

const W = 1000;
const SITE = new URL(SITE_URL).host;

// --- Rendering ----------------------------------------------------------------------

async function toSvg(node: ReactNode, height: number, width = W): Promise<string> {
  return satori(node, { width, height, fonts: await loadImageFonts() });
}

let metrics: Promise<{ sans: fontkit.Font; mono: fontkit.Font }> | undefined;

/** Advance width of `text` in px, as satori lays it out (wrapping is computed ahead). */
async function measure(text: string, font: 'sans' | 'mono', size: number): Promise<number> {
  metrics ??= imageFontFiles().then(({ archivo500, mono }) => ({
    sans: fontkit.create(archivo500) as fontkit.Font,
    mono: fontkit.create(mono) as fontkit.Font,
  }));
  const f = (await metrics)[font];
  return (f.layout(text).advanceWidth / f.unitsPerEm) * size;
}

/** SVG response the README can show; GitHub's image proxy keeps it CARD_TTL_SECONDS. */
export function svgResponse(svg: string): Response {
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': `public, max-age=${CARD_TTL_SECONDS}, s-maxage=${CARD_TTL_SECONDS}`,
    },
  });
}

// --- Building blocks ------------------------------------------------------------------

const Row = ({ style, children }: { style?: CSSProperties; children: ReactNode }) => (
  <div style={{ display: 'flex', boxSizing: 'border-box', ...style }}>{children}</div>
);

const Mono = ({ style, children }: { style?: CSSProperties; children: ReactNode }) => (
  <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: 13, color: C.dim, ...style }}>{children}</div>
);

/** Root of a card: the site's dark panel with a 1px rule, square corners. */
const Card = ({ style, children }: { style?: CSSProperties; children: ReactNode }) => (
  <Row
    style={{
      width: '100%',
      height: '100%',
      background: C.bg,
      border: `1px solid ${C.rule}`,
      color: C.text,
      fontFamily: 'Archivo',
      ...style,
    }}
  >
    {children}
  </Row>
);

/** Right arrow, drawn: the fonts' latin subsets have no U+2192. */
const Arrow = ({ colour }: { colour: string }) => (
  <svg width={14} height={14} viewBox="0 0 16 16">
    <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke={colour} strokeWidth={1.6} />
  </svg>
);

// --- Formatting -----------------------------------------------------------------------

const fmt = (day: string, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...opts }).format(new Date(`${day}T12:00:00Z`));
const dayMonth = (day: string) => fmt(day, { day: 'numeric', month: 'short' });
const fullDate = (day: string) => fmt(day, { day: 'numeric', month: 'short', year: 'numeric' });
const num = (n: number) => n.toLocaleString('en-US');
const plural = (n: number, word: string) => `${num(n)} ${word}${n === 1 ? '' : 's'}`;
const days = (s: Streak) => (s.length === 1 ? 'day' : 'days');

// --- Hero -----------------------------------------------------------------------------

function heroCard(gh: GithubActivity): Promise<string> {
  return toSvg(
    <Card style={{ flexDirection: 'column', justifyContent: 'space-between', padding: '30px 44px 26px' }}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Mono style={{ fontSize: 15 }}>$ whoami</Mono>
        <Row style={{ alignItems: 'center', gap: 10 }}>
          <div style={{ width: 9, height: 9, borderRadius: 9, background: C.ok }} />
          <Mono style={{ fontSize: 14, color: C.ok }}>{HERO.status}</Mono>
        </Row>
      </Row>
      <Row style={{ flexDirection: 'column', gap: 14 }}>
        <Row style={{ fontWeight: 800, fontSize: 92, lineHeight: 0.92, letterSpacing: -4.1 }}>
          {HERO.name}
          <span style={{ color: C.accent }}>.</span>
        </Row>
        <Row style={{ fontSize: 28, fontWeight: 500 }}>{HERO.role}</Row>
        <Row style={{ fontSize: 17, fontWeight: 500, color: C.text2, maxWidth: 760, lineHeight: 1.4 }}>{HERO.intro}</Row>
      </Row>
      <Row style={{ justifyContent: 'space-between', borderTop: `1px solid ${C.rule}`, paddingTop: 16 }}>
        <Mono>{HERO.place}</Mono>
        <Mono>{`${plural(gh.repos, 'public repo')} · ${plural(gh.total, 'contribution')} since ${gh.since.slice(0, 4)}`}</Mono>
      </Row>
    </Card>,
    330
  );
}

// --- Activity -------------------------------------------------------------------------

const CELL = 14;
const GAP = 3;
const WEEKS = 53;

type Day = { date: string; count: number } | null;

/** The last 53 weeks, Monday first; days after today are null. */
function calendar(gh: GithubActivity): Day[][] {
  const today = new Date(`${gh.today}T12:00:00Z`);
  const weekday = (today.getUTCDay() + 6) % 7;
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - weekday - (WEEKS - 1) * 7);
  return Array.from({ length: WEEKS }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + w * 7 + d);
      const iso = date.toISOString().slice(0, 10);
      return iso > gh.today ? null : { date: iso, count: gh.counts.get(iso) ?? 0 };
    })
  );
}

/** Heat level 0–4 from the quartiles of the active days in the window. */
function levels(weeks: Day[][]) {
  const active = weeks
    .flat()
    .flatMap((d) => (d?.count ? [d.count] : []))
    .sort((a, b) => a - b);
  const q = (p: number) => active[Math.min(active.length - 1, Math.floor(p * active.length))] ?? 0;
  const [q1, q2, q3] = [q(0.25), q(0.5), q(0.75)];
  return (n: number) => (n === 0 ? 0 : n <= q1 ? 1 : n <= q2 ? 2 : n <= q3 ? 3 : 4);
}

function Stat({ label, value, unit, sub, colour, first }: { label: string; value: number; unit: string; sub: string; colour?: string; first?: boolean }) {
  return (
    <Row
      style={{
        flexDirection: 'column',
        gap: 6,
        flexGrow: 1,
        flexBasis: 0,
        paddingLeft: first ? 0 : 24,
        borderLeft: first ? 'none' : `1px solid ${C.rule}`,
      }}
    >
      <Mono style={{ fontSize: 12 }}>{label}</Mono>
      <Row style={{ alignItems: 'baseline', gap: 10 }}>
        <Row style={{ fontSize: 52, fontWeight: 800, letterSpacing: -2, lineHeight: 1, color: colour ?? C.text }}>{num(value)}</Row>
        <Row style={{ fontSize: 17, fontWeight: 500, color: C.text2 }}>{unit}</Row>
      </Row>
      <Mono style={{ fontSize: 12 }}>{sub}</Mono>
    </Row>
  );
}

function activityCard(gh: GithubActivity): Promise<string> {
  const weeks = calendar(gh);
  const level = levels(weeks);
  const yearTotal = weeks.flat().reduce((s, d) => s + (d?.count ?? 0), 0);
  const gridW = WEEKS * (CELL + GAP) - GAP;
  const { current, longest } = gh;

  // Month labels over the first week starting in that month
  const months = weeks.flatMap((week, i) => {
    const first = week.find(Boolean);
    if (!first || first.date.slice(8) > '07' || i >= WEEKS - 2) return [];
    return [
      <div key={first.date} style={{ position: 'absolute', left: i * (CELL + GAP), top: 0, fontFamily: 'JetBrains Mono', fontSize: 11, color: C.dim }}>
        {fmt(first.date, { month: 'short' })}
      </div>,
    ];
  });

  return toSvg(
    <Card style={{ flexDirection: 'column', padding: '28px 40px 22px', gap: 26 }}>
      <Row>
        <Stat
          first
          label="current streak"
          value={current.length}
          unit={days(current)}
          sub={current.start && current.end ? `${dayMonth(current.start)} – ${dayMonth(current.end)}` : 'none running'}
          colour={C.accentOnDark}
        />
        <Stat
          label="longest streak"
          value={longest.length}
          unit={days(longest)}
          sub={longest.start && longest.end ? `${dayMonth(longest.start)} – ${fullDate(longest.end)}` : 'none yet'}
        />
        <Stat label="contributions" value={gh.total} unit="total" sub={`${num(yearTotal)} in the last year`} />
      </Row>
      <Row style={{ flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', position: 'relative', width: gridW, height: 14 }}>{months}</div>
        <Row style={{ gap: GAP }}>
          {weeks.map((week, w) => (
            <Row key={w} style={{ flexDirection: 'column', gap: GAP }}>
              {week.map((d, i) => (
                <div key={i} style={{ width: CELL, height: CELL, background: d ? C.heat[level(d.count)] : 'transparent' }} />
              ))}
            </Row>
          ))}
        </Row>
      </Row>
      <Row style={{ justifyContent: 'space-between', alignItems: 'center', width: gridW }}>
        <Mono style={{ fontSize: 12 }}>{`updated ${fullDate(gh.today)} · github.com/${GITHUB_LOGIN}`}</Mono>
        <Row style={{ alignItems: 'center', gap: 4 }}>
          <Mono style={{ fontSize: 12, marginRight: 6 }}>less</Mono>
          {C.heat.map((c) => (
            <div key={c} style={{ width: 11, height: 11, background: c }} />
          ))}
          <Mono style={{ fontSize: 12, marginLeft: 6 }}>more</Mono>
        </Row>
      </Row>
    </Card>,
    356
  );
}

// --- Latest post ----------------------------------------------------------------------

function latestPostCard(post: LatestPost | null): Promise<string> {
  const title = post?.title ?? 'Notes d’infra, coming soon.';
  const size = title.length <= 46 ? 32 : title.length <= 70 ? 27 : 23;
  return toSvg(
    <Card style={{ flexDirection: 'column', justifyContent: 'space-between', padding: '24px 40px 22px' }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Mono>~/blog · latest post</Mono>
        {post && <Mono>{`${fullDate(post.date)} · ${plural(post.count, 'post')}`}</Mono>}
      </Row>
      <Row style={{ fontSize: size, fontWeight: 800, letterSpacing: -0.6, lineHeight: 1.12, maxWidth: 880 }}>{title}</Row>
      <Row style={{ justifyContent: 'space-between', borderTop: `1px solid ${C.rule}`, paddingTop: 14 }}>
        <Mono>Hands-on write-ups from work and the homelab, in French.</Mono>
        <Row style={{ alignItems: 'center', gap: 8 }}>
          <Mono style={{ color: C.accentOnDark }}>{`read on ${SITE}/blog`}</Mono>
          <Arrow colour={C.accentOnDark} />
        </Row>
      </Row>
    </Card>,
    184
  );
}

// --- Section band ---------------------------------------------------------------------

function bandCard({ number, title, desc }: (typeof BANDS)[keyof typeof BANDS], path: string): Promise<string> {
  return toSvg(
    <Card style={{ alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 40px 20px 36px', borderLeft: `4px solid ${C.accent}` }}>
      <Row style={{ alignItems: 'baseline', gap: 16 }}>
        <Mono style={{ fontSize: 15, color: C.accentOnDark }}>{`${number} /`}</Mono>
        <Row style={{ fontSize: 44, fontWeight: 800, letterSpacing: -1.6, lineHeight: 1 }}>{title}</Row>
      </Row>
      <Row style={{ flexDirection: 'column', alignItems: 'flex-end', gap: 6, maxWidth: 480 }}>
        <Mono style={{ fontSize: 12 }}>{path}</Mono>
        <Row style={{ fontSize: 16, fontWeight: 500, color: C.text2, textAlign: 'right' }}>{desc}</Row>
      </Row>
    </Card>,
    92
  );
}

// --- Logos ------------------------------------------------------------------------------

const ICON = 16;

function luminance(hex: string): number {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** A simple-icons logo in its brand colour (the text colour when too dark for the panel). */
const Logo = ({ icon, colour }: { icon: SimpleIcon; colour?: string }) => (
  <svg width={ICON} height={ICON} viewBox="0 0 24 24">
    <path d={icon.path} fill={colour ?? (luminance(icon.hex) < 0.08 ? C.text : `#${icon.hex}`)} />
  </svg>
);

/** Framed letters, for tools without a usable logo. */
const Monogram = ({ letters, colour }: { letters: string; colour?: string }) => (
  <Row
    style={{
      width: ICON,
      height: ICON,
      alignItems: 'center',
      justifyContent: 'center',
      border: `1px solid ${colour ?? C.dim}`,
      fontFamily: 'JetBrains Mono',
      fontSize: 10,
      lineHeight: 1,
      color: colour ?? C.text2,
    }}
  >
    {letters}
  </Row>
);

// --- Stack row --------------------------------------------------------------------------

const CHIP = { h: 36, padX: 13, gap: 10, iconGap: 9, font: 15 };

/** Number of rows boxes of `widths` wrap into, the way flex-wrap does. */
function wrappedRows(widths: number[], available: number, gap: number): number {
  let count = 1;
  let x = 0;
  for (const w of widths) {
    if (x > 0 && x + gap + w > available) {
      count++;
      x = w;
    } else {
      x += (x > 0 ? gap : 0) + w;
    }
  }
  return count;
}

async function stackCard({ area, tools }: { area: string; tools: Tool[] }): Promise<string> {
  const LEFT = 250;
  const PAD = 22;
  const widths = await Promise.all(
    tools.map(async ([label]) => 2 + 2 * CHIP.padX + ICON + CHIP.iconGap + Math.ceil(await measure(label, 'sans', CHIP.font)))
  );
  const rows = wrappedRows(widths, W - 2 - LEFT - 1 - 2 * PAD, CHIP.gap);
  const height = Math.max(2 * PAD + rows * CHIP.h + (rows - 1) * CHIP.gap, 112) + 2;

  return toSvg(
    <Card>
      <Row
        style={{
          width: LEFT,
          flexShrink: 0,
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: `${PAD - 2}px 22px`,
          background: C.panel2,
          borderRight: `1px solid ${C.rule}`,
        }}
      >
        <Mono style={{ fontSize: 12 }}>{`${String(tools.length).padStart(2, '0')} tools`}</Mono>
        <Row style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.4, lineHeight: 1.15 }}>{area}</Row>
      </Row>
      <Row style={{ flexWrap: 'wrap', alignContent: 'center', gap: CHIP.gap, padding: PAD, flexGrow: 1 }}>
        {tools.map(([label, icon]) => (
          <Row
            key={label}
            style={{
              height: CHIP.h,
              alignItems: 'center',
              gap: CHIP.iconGap,
              padding: `0 ${CHIP.padX}px`,
              border: `1px solid ${C.rule2}`,
              background: C.panel,
              fontSize: CHIP.font,
              fontWeight: 500,
            }}
          >
            {icon ? <Logo icon={icon} /> : <Monogram letters={label[0]} />}
            {label}
          </Row>
        ))}
      </Row>
    </Card>,
    height
  );
}

// --- Contact button ---------------------------------------------------------------------

async function buttonCard({ label, mark, primary }: (typeof BUTTONS)[string]): Promise<string> {
  const ink = primary ? '#ffffff' : undefined;
  const width = Math.ceil(2 + 2 * 16 + ICON + 10 + (await measure(label, 'mono', 14)));
  return toSvg(
    <Row
      style={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        gap: 10,
        padding: '0 16px',
        background: primary ? C.accent : C.bg,
        border: `1px solid ${primary ? C.accent : C.rule2}`,
        color: ink ?? C.text,
        fontFamily: 'JetBrains Mono',
        fontSize: 14,
      }}
    >
      {mark === null ? (
        <Row style={{ width: ICON, height: ICON, alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: 8, background: ink ?? C.accent }} />
        </Row>
      ) : typeof mark === 'string' ? (
        <Monogram letters={mark} colour={ink} />
      ) : (
        <Logo icon={mark} colour={ink} />
      )}
      {label}
    </Row>,
    44,
    width
  );
}

// --- Registry ---------------------------------------------------------------------------

type CardDef = { render: () => Promise<string>; live: boolean };

/** Every card by name (/github/<name>.svg); `live` ones read GitHub or the blog. */
export const CARDS: Record<string, CardDef> = {
  hero: { live: true, render: async () => heroCard(await githubActivity()) },
  activity: { live: true, render: async () => activityCard(await githubActivity()) },
  'latest-post': { live: true, render: () => latestPostCard(latestPost()) },
  ...Object.fromEntries(Object.entries(BANDS).map(([key, band]) => [`band-${key}`, { live: false, render: () => bandCard(band, `~/${key}`) }])),
  ...Object.fromEntries(Object.entries(STACK).map(([key, row]) => [`stack-${key}`, { live: false, render: () => stackCard(row) }])),
  ...Object.fromEntries(Object.entries(BUTTONS).map(([key, button]) => [`btn-${key}`, { live: false, render: () => buttonCard(button) }])),
};

const rendered = new Map<string, Promise<string>>();

/** SVG of a card; the static ones only change with a deploy, so they are drawn once. */
export function renderCard(name: string): Promise<string> | null {
  const card = Object.prototype.hasOwnProperty.call(CARDS, name) ? CARDS[name] : undefined;
  if (!card) return null;
  if (card.live) return card.render();
  let svg = rendered.get(name);
  if (!svg) {
    svg = card.render();
    svg.catch(() => rendered.delete(name));
    rendered.set(name, svg);
  }
  return svg;
}
