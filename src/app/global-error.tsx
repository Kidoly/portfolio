'use client';

import './globals.css';
import { fontVariables } from './fonts';
import ErrorView from '@/components/errors/ErrorView';

/** Last-resort page when the root layout itself fails: no providers, French only. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="fr">
      <body className={`${fontVariables} font-sans bg-[#0e100f]`}>
        <ErrorView
          lang="fr"
          code="500"
          prompt="$ systemctl status albanmary.com"
          output={`● albanmary.com - failed${error.digest ? ` (ref ${error.digest})` : ''}`}
          copy={{
            title: 'Une erreur est survenue.',
            text: 'Le site n’a pas pu se charger. Réessayez dans un instant ; si le problème persiste, écrivez-moi à alban.mary1@gmail.com.',
            home: 'Retour à l’accueil',
            blog: 'Lire le blog',
          }}
          action={
            <button
              type="button"
              onClick={reset}
              className="bg-[#e4e7e4] text-[#0e100f] rounded-full px-6 py-3.5 cursor-pointer hover:bg-[var(--accent)] hover:text-[#f3f1ec] transition-colors"
            >
              Réessayer
            </button>
          }
        />
      </body>
    </html>
  );
}
