'use client';

import { useEffect, useState } from 'react';
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

/** Opt-out of the audience stats for this browser, stored where the Umami tracker reads it. */
export default function AnalyticsOptOut() {
  const { language } = useLanguage();
  const t = TEXT[language];
  const [state, setState] = useState<State>('loading');

  useEffect(() => {
    const active = Boolean(document.querySelector('script[src="/stats/script.js"]'));
    let excluded = false;
    try {
      excluded = localStorage.getItem(STATS_OPT_OUT_KEY) !== null;
    } catch {}
    setState(!active ? 'off' : excluded ? 'excluded' : 'counted');
  }, []);

  const toggle = () => {
    try {
      if (state === 'excluded') localStorage.removeItem(STATS_OPT_OUT_KEY);
      else localStorage.setItem(STATS_OPT_OUT_KEY, '1');
      setState(state === 'excluded' ? 'counted' : 'excluded');
    } catch {}
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
