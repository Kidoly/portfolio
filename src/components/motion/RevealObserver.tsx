'use client';

import { useEffect } from 'react';

const COUNT_MS = 1200;

/**
 * Counts a [data-count] number up to its own text ("99,99 %", "15+", "4 yrs"...). The figures are
 * drawn by CSS from data-shown, so the text node React owns is never touched.
 */
function countUp(el: HTMLElement) {
  const match = /^(\D*)(\d+(?:[.,]\d+)?)(.*)$/.exec(el.textContent ?? '');
  if (!match) return;
  const [, before, number, after] = match;
  const separator = number.includes(',') ? ',' : '.';
  const decimals = number.split(/[.,]/)[1]?.length ?? 0;
  const target = Number(number.replace(',', '.'));
  const start = performance.now();
  el.setAttribute('data-counting', '');
  const frame = (now: number) => {
    const t = Math.min(1, (now - start) / COUNT_MS);
    const value = target * (1 - (1 - t) ** 3); // ease-out cubic
    el.setAttribute('data-shown', before + value.toFixed(decimals).replace('.', separator) + after);
    if (t < 1) requestAnimationFrame(frame);
    else el.removeAttribute('data-counting');
  };
  requestAnimationFrame(frame);
}

/**
 * One-shot scroll reveals: [data-reveal] elements fade and rise into place as they enter the
 * viewport, and the [data-count] numbers inside them count up (styles in globals.css). Nothing is
 * hidden without JS or for visitors who ask for reduced motion, nor anything already on screen.
 */
export default function RevealObserver() {
  useEffect(() => {
    if (!matchMedia('(prefers-reduced-motion: no-preference)').matches || !('IntersectionObserver' in window)) return;
    const root = document.documentElement;

    const reveal = (el: Element, count: boolean) => {
      el.setAttribute('data-in', '');
      if (count) el.querySelectorAll<HTMLElement>('[data-count]').forEach(countUp);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          io.unobserve(entry.target);
          reveal(entry.target, true);
        }
      },
      { rootMargin: '0px 0px -8% 0px' }
    );
    const onScreen = (el: Element) => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    };
    const track = (el: Element, count: boolean) => {
      if (el.hasAttribute('data-in')) return;
      if (onScreen(el)) reveal(el, count);
      else io.observe(el);
    };

    document.querySelectorAll('[data-reveal]').forEach((el) => track(el, true));
    root.setAttribute('data-motion', '');

    // Elements React creates later (language switch, blog filters) are revealed too, without counting again
    const mo = new MutationObserver((records) => {
      for (const record of records) {
        record.addedNodes.forEach((node) => {
          if (!(node instanceof Element)) return;
          if (node.matches('[data-reveal]')) track(node, false);
          node.querySelectorAll('[data-reveal]').forEach((el) => track(el, false));
        });
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      root.removeAttribute('data-motion');
    };
  }, []);

  return null;
}
