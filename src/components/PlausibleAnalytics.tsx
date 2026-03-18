'use client';

import { useEffect } from 'react';

export default function PlausibleAnalytics() {
  useEffect(() => {
    // Add Plausible script for privacy-friendly analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://plausible.io/js/pa-RSYdJnXxiw9yDZhX9VJJM.js';
    document.head.appendChild(script);

    // Initialize Plausible
    window.plausible = window.plausible || function() {
      (window.plausible.q = window.plausible.q || []).push(arguments);
    };
    window.plausible.init = window.plausible.init || function(i) {
      window.plausible.o = i || {};
    };
    window.plausible.init();
  }, []);

  return null;
}
