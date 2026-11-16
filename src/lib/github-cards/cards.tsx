import type { CSSProperties, ReactNode } from 'react';
import satori from 'satori';
import { loadOgFonts } from '@/lib/og';
import { CARD_TTL_SECONDS, GITHUB_LOGIN, type GithubActivity, type LatestPost, type Streak } from './data';

/**
 * Cards of the GitHub profile README (github.com/Kidoly), served as SVG by the
 * /github/*.svg routes. satori turns every glyph into a path: GitHub shows the
 * images through <img>, where web fonts never load. The static cards (stack, section
 * bands, buttons) are generated in the Kidoly/Kidoly repository itself.
 */

const W = 1000;

// The site's dark tokens, in sRGB (satori does not parse oklch())
const C = {
  bg: '#0e100f',
  rule: '#232825',
  text: '#e4e7e4',
  text2: '#9aa19c',
  dim: '#7d8580',
  accent: '#d73626',
  accentOnDark: '#ea4f3b',
  ok: '#6de18b',
  // Heatmap: no contributions, then the accent at rising strength
  heat: ['#1b1f1d', '#4a1f19', '#7a2a1f', '#a83024', '#d73626'],
};

const SITE = 'albanmary.com';
const HERO = {
  name: 'Alban Mary',
  role: 'Systems & network engineer',
  intro: 'Work-study at Epsight, a hosting and managed services provider, and 5th year at EPSI Nantes.',
  status: 'open to a full-time role · Oct 2027',
  place: 'Nantes, France · or remote',
};

// --- Rendering ----------------------------------------------------------------------

async function toSvg(node: ReactNode, height: number, width = W): Promise<string> {
  const fonts = await loadOgFonts();
  return satori(node, { width, height, fonts });
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

export function heroCard(gh: GithubActivity): Promise<string> {
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

export function activityCard(gh: GithubActivity): Promise<string> {
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

export function latestPostCard(post: LatestPost | null): Promise<string> {
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
