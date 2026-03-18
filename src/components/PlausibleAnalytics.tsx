'use client';

import { useEffect } from 'react';

export default function PlausibleAnalytics() {
  useEffect(() => {
    // Add Plausible script for privacy-friendly analytics
    // Replace 'yourdomain.com' with your actual domain
    const script = document.createElement('script');
    script.defer = true;
    script.setAttribute('data-domain', 'albanmary.com');
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);
  }, []);

  return null;
}
