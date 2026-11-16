import { getPublishedPosts } from '@/lib/blog/posts';

/**
 * Live data of the GitHub profile README cards: contributions from the GitHub GraphQL
 * API, the latest post from the blog itself.
 */

export const GITHUB_LOGIN = 'Kidoly';
const TZ = 'Europe/Paris';
/** The cards are refreshed every 5 minutes: GitHub is asked at most that often. */
export const CARD_TTL_SECONDS = 300;

export interface Streak {
  length: number;
  start: string | null;
  end: string | null;
}

export interface GithubActivity {
  repos: number;
  since: string;
  today: string;
  /** Contributions per "YYYY-MM-DD" day, since the account was created */
  counts: Map<string, number>;
  total: number;
  current: Streak;
  longest: Streak;
}

export interface LatestPost {
  title: string;
  slug: string;
  date: string;
  count: number;
}

/** Any token works (contributions are public data); a dedicated one can be set. */
function token(): string | undefined {
  return process.env.GITHUB_STATS_TOKEN || process.env.GITHUB_TOKEN || undefined;
}

async function graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const auth = token();
  if (!auth) throw new Error('GITHUB_STATS_TOKEN (or GITHUB_TOKEN) is not set');
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
    cache: 'no-store',
    signal: AbortSignal.timeout(10_000),
  });
  const body = (await res.json()) as { data?: T; errors?: unknown };
  if (!res.ok || body.errors || !body.data) throw new Error(`GitHub GraphQL ${res.status}: ${JSON.stringify(body.errors ?? body)}`);
  return body.data;
}

/** "YYYY-MM-DD" of a date in the profile's time zone. */
function isoDay(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
}

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

type Calendar = { contributionCalendar: { weeks: { contributionDays: { date: string; contributionCount: number }[] }[] } };

async function fetchActivity(): Promise<GithubActivity> {
  const { user } = await graphql<{ user: { createdAt: string; repositories: { totalCount: number } } }>(
    `query($login: String!) {
      user(login: $login) {
        createdAt
        repositories(ownerAffiliations: OWNER, privacy: PUBLIC, isFork: false) { totalCount }
      }
    }`,
    { login: GITHUB_LOGIN }
  );

  // contributionsCollection spans at most a year: one aliased field per year
  const today = isoDay();
  const fields: string[] = [];
  for (let y = Number(user.createdAt.slice(0, 4)); y <= Number(today.slice(0, 4)); y++) {
    fields.push(`y${y}: contributionsCollection(from: "${y}-01-01T00:00:00Z", to: "${y}-12-31T23:59:59Z") {
      contributionCalendar { weeks { contributionDays { date contributionCount } } }
    }`);
  }
  const years = await graphql<{ user: Record<string, Calendar> }>(
    `query($login: String!) { user(login: $login) { ${fields.join('\n')} } }`,
    { login: GITHUB_LOGIN }
  );

  const counts = new Map<string, number>();
  for (const year of Object.values(years.user)) {
    for (const week of year.contributionCalendar.weeks) {
      for (const day of week.contributionDays) if (day.date <= today) counts.set(day.date, day.contributionCount);
    }
  }

  return {
    repos: user.repositories.totalCount,
    since: user.createdAt.slice(0, 10),
    today,
    counts,
    ...streaks(counts, today),
  };
}

/** Longest streak and total over every day; the current one is still alive while today is empty. */
function streaks(counts: Map<string, number>, today: string) {
  let total = 0;
  const none: Streak = { length: 0, start: null, end: null };
  let longest = none;
  let run = none;
  for (const day of [...counts.keys()].sort()) {
    const n = counts.get(day) ?? 0;
    total += n;
    if (n > 0) {
      run = run.length ? { ...run, length: run.length + 1, end: day } : { length: 1, start: day, end: day };
      if (run.length > longest.length) longest = run;
    } else {
      run = none;
    }
  }

  const end = counts.get(today) ? today : addDays(today, -1);
  let start = end;
  let length = 0;
  while ((counts.get(start) ?? 0) > 0) {
    length++;
    start = addDays(start, -1);
  }
  const current = length ? { length, start: addDays(start, 1), end } : none;
  return { total, longest, current };
}

let cached: { at: number; data: GithubActivity } | undefined;
let pending: Promise<GithubActivity> | undefined;

/**
 * Activity fetched at most every CARD_TTL_SECONDS, shared by the cards; when GitHub
 * fails, the last good answer is kept rather than breaking the README.
 */
export async function githubActivity(): Promise<GithubActivity> {
  if (cached && Date.now() - cached.at < CARD_TTL_SECONDS * 1000) return cached.data;
  pending ??= fetchActivity()
    .then((data) => {
      cached = { at: Date.now(), data };
      return data;
    })
    .catch((error) => {
      if (cached) {
        console.error('GitHub cards: keeping the last activity,', error);
        return cached.data;
      }
      throw error;
    })
    .finally(() => {
      pending = undefined;
    });
  return pending;
}

export function latestPost(): LatestPost | null {
  const posts = getPublishedPosts();
  const post = posts[0];
  if (!post) return null;
  return { title: post.title, slug: post.slug, date: post.publishedAt.slice(0, 10), count: posts.length };
}
