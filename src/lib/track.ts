type Umami = { track: (event: string, data?: Record<string, string | number>) => void };

/** Local storage key the Umami tracker reads to skip this browser (privacy page opt-out, owner's visits). */
export const STATS_OPT_OUT_KEY = 'umami.disabled';

/**
 * Custom event in the audience stats (anonymous, see the privacy policy). Waits for the deferred
 * tracker when it is still loading; does nothing when it is off, blocked or opted out.
 */
export function track(event: string, data?: Record<string, string | number>): void {
  if (typeof window === 'undefined') return;
  const w = window as Window & { umami?: Umami };
  if (w.umami) {
    w.umami.track(event, data);
    return;
  }
  document
    .querySelector('script[src="/stats/script.js"]')
    ?.addEventListener('load', () => w.umami?.track(event, data), { once: true });
}
