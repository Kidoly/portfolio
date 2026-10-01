'use client';

import { useEffect } from 'react';
import { useLanguage, useLocalizedDocument } from '@/contexts/LanguageContext';
import ErrorView from '@/components/errors/ErrorView';

const COPY = {
  fr: {
    title: 'Une erreur est survenue.',
    text: 'Le serveur n’a pas pu afficher cette page. Réessayez dans un instant ; si le problème persiste, écrivez-moi à alban.mary1@gmail.com.',
    home: 'Retour à l’accueil',
    blog: 'Lire le blog',
    retry: 'Réessayer',
  },
  en: {
    title: 'Something went wrong.',
    text: 'The server could not render this page. Try again in a moment; if it keeps failing, email me at alban.mary1@gmail.com.',
    home: 'Back to home',
    blog: 'Read the blog',
    retry: 'Try again',
  },
};

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { language } = useLanguage();
  useLocalizedDocument();
  const copy = COPY[language];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorView
      lang={language}
      code="500"
      prompt="$ systemctl status albanmary.com"
      output={
        <>
          <span className="text-[var(--accent-on-dark)]">●</span> albanmary.com — failed
          {error.digest ? ` (ref ${error.digest})` : ''}
        </>
      }
      copy={copy}
      action={
        <button
          type="button"
          onClick={reset}
          className="bg-[#e4e7e4] text-[#0e100f] rounded-full px-6 py-3.5 cursor-pointer hover:bg-[var(--accent)] hover:text-[#f3f1ec] transition-colors"
        >
          {copy.retry}
        </button>
      }
    />
  );
}
