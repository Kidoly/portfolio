'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useReportWebVitals } from 'next/web-vitals';
import { track } from '@/lib/track';

const TIME_BUCKETS: [number, string][] = [
  [10, '< 10 s'],
  [30, '10-30 s'],
  [60, '30 s-1 min'],
  [180, '1-3 min'],
  [600, '3-10 min'],
];

function timeBucket(ms: number) {
  const s = ms / 1000;
  return TIME_BUCKETS.find(([max]) => s < max)?.[1] ?? '> 10 min';
}

/**
 * Site-wide measures, anonymous and site-only (CNIL audience-measurement exemption): outbound links,
 * downloads and email links, Core Web Vitals of real visits, and visible time spent on each page.
 * Links that carry their own data-umami-event are left to the Umami tracker.
 */
export default function StatsListener() {
  const pathname = usePathname();

  useReportWebVitals((metric) => {
    if (metric.name !== 'LCP' && metric.name !== 'CLS' && metric.name !== 'INP') return;
    track('web-vitals', {
      metric: metric.name,
      value: metric.name === 'CLS' ? Math.round(metric.value * 1000) / 1000 : Math.round(metric.value),
      rating: metric.rating,
      page: window.location.pathname,
    });
  });

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.type === 'auxclick' && event.button !== 1) return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
      if (!link || link.hasAttribute('data-umami-event')) return;
      const url = new URL(link.href, window.location.href);
      if (url.protocol === 'mailto:') return track('email', { page: window.location.pathname });
      if (/\.pdf$/i.test(url.pathname)) return track('download', { file: url.pathname.split('/').pop() ?? '' });
      if (url.protocol.startsWith('http') && url.host !== window.location.host) {
        track('outbound', { url: (url.host + url.pathname).replace(/\/$/, '') });
      }
    };
    document.addEventListener('click', onClick, true);
    document.addEventListener('auxclick', onClick, true);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('auxclick', onClick, true);
    };
  }, []);

  // Visible time on the page, sent once when the visitor leaves it (tab hidden or navigation)
  useEffect(() => {
    let start = document.visibilityState === 'visible' ? Date.now() : 0;
    let total = 0;
    let sent = false;
    const pause = () => {
      if (start) total += Date.now() - start;
      start = 0;
    };
    const flush = () => {
      if (sent) return;
      pause();
      sent = true;
      if (total > 0) track('time-on-page', { page: pathname, time: timeBucket(total) });
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
      else if (!sent) start = Date.now();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [pathname]);

  return null;
}
