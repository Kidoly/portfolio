type Umami = { track: (event: string, data?: Record<string, string | number>) => void };

/** Local storage key the Umami tracker reads to skip this browser (privacy page opt-out, owner's visits). */
export const STATS_OPT_OUT_KEY = 'umami.disabled';

/** Custom event in the audience stats; does nothing when the tracker is off, blocked or opted out. */
export function track(event: string, data?: Record<string, string | number>) {
  if (typeof window === 'undefined') return;
  (window as Window & { umami?: Umami }).umami?.track(event, data);
}
