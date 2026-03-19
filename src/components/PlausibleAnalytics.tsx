'use client';

import { useEffect } from 'react';

type PlausibleFn = ((...args: unknown[]) => void) & {
  q?: unknown[][];
  init?: (options?: Record<string, unknown>) => void;
  o?: Record<string, unknown>;
};

declare global {
  interface Window {
    plausible?: PlausibleFn;
  }
}

export default function PlausibleAnalytics() {
  useEffect(() => {
    // Add Plausible script for privacy-friendly analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://plausible.io/js/pa-RSYdJnXxiw9yDZhX9VJJM.js';
    document.head.appendChild(script);

    // Initialize Plausible
    if (!window.plausible) {
      const queueFn = ((...args: unknown[]) => {
        (queueFn.q = queueFn.q || []).push(args);
      }) as PlausibleFn;

      window.plausible = queueFn;
    }

    window.plausible.init = window.plausible.init || ((options?: Record<string, unknown>) => {
      if (!window.plausible) return;
      window.plausible.o = options || {};
    });

    window.plausible.init();
  }, []);

  return null;
}
