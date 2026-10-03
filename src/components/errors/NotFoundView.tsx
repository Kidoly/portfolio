'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/track';
import { useLanguage, useLocalizedDocument } from '@/contexts/LanguageContext';
import ErrorView from './ErrorView';

const COPY = {
  fr: {
    title: 'Page introuvable.',
    text: 'Cette page n’existe pas ou a été déplacée. Les articles sont sur le blog, le reste sur la page d’accueil.',
    home: 'Retour à l’accueil',
    blog: 'Lire le blog',
  },
  en: {
    title: 'Page not found.',
    text: 'This page does not exist or has moved. Articles are on the blog, everything else is on the home page.',
    home: 'Back to home',
    blog: 'Read the blog',
  },
};

export default function NotFoundView() {
  const { language } = useLanguage();
  useLocalizedDocument();
  const pathname = usePathname() || '/';
  // Broken links: the 404 path, with the referrer Umami records for the page view
  useEffect(() => {
    track('404', { path: pathname });
  }, [pathname]);
  return (
    <ErrorView
      lang={language}
      code="404"
      prompt={`$ cd ${pathname}`}
      output={`bash: cd: ${pathname}: No such file or directory`}
      copy={COPY[language]}
    />
  );
}
