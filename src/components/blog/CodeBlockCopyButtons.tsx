'use client';

import { useEffect } from 'react';

export default function CodeBlockCopyButtons() {
  useEffect(() => {
    const pres = Array.from(document.querySelectorAll<HTMLPreElement>('.blog-content pre'));

    pres.forEach((pre) => {
      if (pre.querySelector('.cb-bar')) return; // already processed
      const code = pre.querySelector('code');
      if (!code) return;

      const lang = code.getAttribute('data-language') || 'bash';

      const bar = document.createElement('div');
      bar.className = 'cb-bar';

      const langLabel = document.createElement('span');
      langLabel.className = 'cb-lang';
      langLabel.textContent = lang;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'cb-copy';
      button.textContent = 'copier';
      button.addEventListener('click', async () => {
        // Copy the code without the injected "$ " prompts
        const clone = code.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('.cb-prompt').forEach((el) => el.remove());
        try {
          await navigator.clipboard.writeText(clone.textContent || '');
          button.textContent = 'copié ✓';
          setTimeout(() => {
            button.textContent = 'copier';
          }, 1500);
        } catch {
          /* clipboard unavailable */
        }
      });

      bar.appendChild(langLabel);
      bar.appendChild(button);
      pre.insertBefore(bar, pre.firstChild);
    });
  }, []);

  return null;
}
