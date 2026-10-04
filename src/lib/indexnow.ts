/**
 * IndexNow: tells Bing, Yandex, Seznam, Naver… that pages changed, so they
 * recrawl them now instead of on their next visit (Google does not use it).
 * Off unless INDEXNOW_KEY is set; the key is served at /indexnow-key.txt.
 */

const SITE_URL = 'https://albanmary.com';

export function indexNowKey(): string | null {
  const key = process.env.INDEXNOW_KEY?.trim();
  return key && /^[A-Za-z0-9-]{8,128}$/.test(key) ? key : null;
}

/** Submits site paths (e.g. `/blog/slug/`). Never throws. */
export async function notifyIndexNow(paths: string[]): Promise<void> {
  const key = indexNowKey();
  if (!key || process.env.NODE_ENV !== 'production') return;

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key,
        keyLocation: `${SITE_URL}/indexnow-key.txt`,
        urlList: [...new Set(paths)].map((path) => `${SITE_URL}${path}`),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.error('[indexnow] submit failed:', res.status, await res.text());
  } catch (err) {
    console.error('[indexnow] submit error:', err);
  }
}
