'use client';

import { useSyncExternalStore } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { STATS_OPT_OUT_KEY } from '@/lib/track';

const TEXT = {
  fr: {
    off: 'La mesure d’audience n’est pas active sur le site.',
    counted: 'Vos visites sont comptées, de façon anonyme.',
    excluded: 'Vos visites ne sont pas comptées sur ce navigateur.',
    disable: 'Ne plus compter mes visites',
    enable: 'Réactiver la mesure',
  },
  en: {
    off: 'Audience measurement is not active on the site.',
    counted: 'Your visits are counted, anonymously.',
    excluded: 'Your visits are not counted on this browser.',
    disable: 'Stop counting my visits',
    enable: 'Turn measurement back on',
  },
};

type State = 'loading' | 'off' | 'counted' | 'excluded';

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener('storage', onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener('storage', onChange);
  };
}

/** 'off' when the site serves no tracker, otherwise whether this browser opted out. */
function readState(): State {
  if (!document.querySelector('script[src="/stats/script.js"]')) return 'off';
  try {
    return localStorage.getItem(STATS_OPT_OUT_KEY) !== null ? 'excluded' : 'counted';
  } catch {
    return 'counted';
  }
}

/** Opt-out of the audience stats for this browser, stored where the Umami tracker reads it. */
export default function AnalyticsOptOut() {
  const { language } = useLanguage();
  const t = TEXT[language];
  const state = useSyncExternalStore(subscribe, readState, () => 'loading' as State);

  const toggle = () => {
    try {
      if (state === 'excluded') localStorage.removeItem(STATS_OPT_OUT_KEY);
      else localStorage.setItem(STATS_OPT_OUT_KEY, '1');
    } catch {}
    listeners.forEach((notify) => notify());
  };

  if (state === 'loading') return null;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-2 border-[#141414] px-5 py-4">
      <span role="status">{t[state]}</span>
      {state !== 'off' && (
        <button onClick={toggle} className="font-bold border-b-2 border-[var(--accent)] pb-0.5 cursor-pointer hover:text-[var(--accent)] transition-colors">
          {state === 'excluded' ? t.enable : t.disable}
        </button>
      )}
    </div>
  );
}
