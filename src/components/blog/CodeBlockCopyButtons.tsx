'use client';

import { useEffect } from 'react';

/**
 * Wires the server-rendered "copier" buttons of the article code blocks:
 * copies the code without the "$ " prompts, then shows "copié ✓" for 1.5 s.
 */
export default function CodeBlockCopyButtons() {
  useEffect(() => {
    const onClick = async (event: MouseEvent) => {
      const button = (event.target as Element | null)?.closest<HTMLButtonElement>('.cb-copy');
      const code = button?.closest('.cb')?.querySelector('code');
      if (!button || !code) return;

      const clone = code.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('.cb-prompt').forEach((el) => el.remove());
      try {
        await navigator.clipboard.writeText(clone.textContent || '');
        button.textContent = 'copié ✓';
        window.setTimeout(() => {
          button.textContent = 'copier';
        }, 1500);
      } catch {
        /* clipboard unavailable */
      }
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
