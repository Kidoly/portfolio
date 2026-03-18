'use client';

import { useEffect } from 'react';

interface GiscusConfig {
  repo: string;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: string;
  strict: boolean;
  reactionsEnabled: boolean;
  emitMetadata: boolean;
  inputPosition: 'top' | 'bottom';
  lang: string;
  loading: 'lazy' | 'auto';
}

export default function CommentsSection() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', 'Kidoly/portfolio');
    script.setAttribute('data-repo-id', 'R_kgDOL-4K1g'); // Replace with your repo ID
    script.setAttribute('data-category', 'Blog Comments');
    script.setAttribute('data-category-id', 'DIC_kwDOL-4K1s4CeXRy'); // Replace with your category ID
    script.setAttribute('data-mapping', 'pathname');
    script.setAttribute('data-strict', 'false');
    script.setAttribute('data-reactions-enabled', 'true');
    script.setAttribute('data-emit-metadata', 'false');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'light');
    script.setAttribute('data-lang', 'fr');
    script.setAttribute('data-loading', 'lazy');
    script.async = true;
    script.crossOrigin = 'anonymous';

    const commentsDiv = document.getElementById('giscus-container');
    if (commentsDiv) {
      commentsDiv.appendChild(script);
    }
  }, []);

  return <div id="giscus-container" className="py-8" />;
}
