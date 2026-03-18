'use client';

import { useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeBlockCopyButtons() {
  useEffect(() => {
    // Find all code blocks and add copy button functionality
    const preBlocks = document.querySelectorAll('pre');

    preBlocks.forEach((pre) => {
      const codeBlock = pre.querySelector('code');
      if (!codeBlock) return;

      // Create button container
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'absolute top-3 right-3 z-10';

      const button = document.createElement('button');
      button.className =
        'p-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded transition-colors flex items-center gap-1.5 text-xs';
      button.title = 'Copy code to clipboard';

      // SVG for copy icon
      const copyIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      copyIcon.setAttribute('width', '16');
      copyIcon.setAttribute('height', '16');
      copyIcon.setAttribute('viewBox', '0 0 24 24');
      copyIcon.setAttribute('fill', 'none');
      copyIcon.setAttribute('stroke', 'currentColor');
      copyIcon.setAttribute('stroke-width', '2');
      copyIcon.setAttribute('stroke-linecap', 'round');
      copyIcon.setAttribute('stroke-linejoin', 'round');
      copyIcon.setAttribute('class', 'copy-icon');
      copyIcon.innerHTML =
        '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>';

      // SVG for check icon
      const checkIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      checkIcon.setAttribute('width', '16');
      checkIcon.setAttribute('height', '16');
      checkIcon.setAttribute('viewBox', '0 0 24 24');
      checkIcon.setAttribute('fill', 'none');
      checkIcon.setAttribute('stroke', 'currentColor');
      checkIcon.setAttribute('stroke-width', '2');
      checkIcon.setAttribute('stroke-linecap', 'round');
      checkIcon.setAttribute('stroke-linejoin', 'round');
      checkIcon.setAttribute('class', 'check-icon hidden text-green-400');
      checkIcon.innerHTML =
        '<polyline points="20 6 9 17 4 12"></polyline>';

      button.appendChild(copyIcon);
      button.appendChild(checkIcon);

      button.addEventListener('click', async () => {
        const code = codeBlock.textContent || '';
        try {
          await navigator.clipboard.writeText(code);

          // Show check icon
          copyIcon.classList.add('hidden');
          checkIcon.classList.remove('hidden');

          // Reset after 2 seconds
          setTimeout(() => {
            copyIcon.classList.remove('hidden');
            checkIcon.classList.add('hidden');
          }, 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      });

      buttonContainer.appendChild(button);
      pre.style.position = 'relative';
      pre.insertBefore(buttonContainer, pre.firstChild);
    });
  }, []);

  return null;
}
