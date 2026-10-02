'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { BTN_PRIMARY, HINT, Notice, PageHeader, SectionLabel, Stat, readError } from '@/components/admin/ui';

interface SyncResult {
  synced: number;
  created: number;
  updated: number;
  errors: string[];
}

interface SyncConfig {
  configured: boolean;
  host: string | null;
}

const STEPS = [
  'Connexion au Wiki.js par son API GraphQL.',
  'Lecture de chaque page du wiki, avec son contenu Markdown et ses tags.',
  'Conversion en article : temps de lecture calculé, première image en couverture, catégorie tirée du chemin de la page.',
  "Un article déjà importé garde sa description, sa catégorie, son SEO et son statut ; seuls le titre, le contenu et les tags suivent le wiki.",
  'Les nouvelles pages arrivent en brouillon : à relire, puis à publier depuis Articles.',
];

export default function SyncPage() {
  const [config, setConfig] = useState<SyncConfig | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);

  useEffect(() => {
    fetch('/api/admin/sync/')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then(setConfig)
      .catch(() => setConfig({ configured: false, host: null }));
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch('/api/admin/sync/', { method: 'POST' });
      if (res.ok) setResult(await res.json());
      else setResult({ synced: 0, created: 0, updated: 0, errors: [await readError(res)] });
    } catch {
      setResult({ synced: 0, created: 0, updated: 0, errors: ['Erreur de connexion au serveur.'] });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <PageHeader prompt="$ wiki sync --to ~/blog" title="Wiki.js" />
      <p className="m-0 max-w-[680px] text-[19px] leading-[1.5] text-[#4a4a48] pb-12">
        Les pages du Wiki.js deviennent des articles du blog : les nouvelles arrivent en brouillon, celles déjà importées sont mises à jour.
      </p>

      <section className="pb-12">
        <SectionLabel n="01">Connexion</SectionLabel>
        <div className="border-t-2 border-[#141414] pt-4">
          <span className="inline-flex items-center gap-2 font-mono text-[14px]" role="status">
            <span
              aria-hidden="true"
              className={`size-2 rounded-full ${config?.configured ? 'bg-[oklch(0.62_0.15_150)]' : 'border border-[#68655f]'}`}
            />
            {config === null ? 'vérification…' : config.configured ? `connecté à ${config.host}` : 'non configuré'}
          </span>
          {config && !config.configured && (
            <p className={HINT}>
              Renseigner <code>WIKI_API_URL</code> et <code>WIKI_API_KEY</code> dans l&apos;environnement du serveur (.env.local en local,
              variables du conteneur en production).
            </p>
          )}
        </div>
      </section>

      <section className="pb-12">
        <SectionLabel n="02">Synchronisation</SectionLabel>
        <div className="border-t-2 border-[#141414] pt-4 flex flex-wrap items-center justify-between gap-5">
          <p className="m-0 max-w-[560px] text-[16px] leading-[1.55] text-[#4a4a48]">
            Toutes les pages du wiki sont lues. Rien n&apos;est publié automatiquement.
          </p>
          <button onClick={handleSync} disabled={syncing || !config?.configured} className={BTN_PRIMARY}>
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} aria-hidden />
            {syncing ? 'Synchronisation…' : 'Synchroniser'}
          </button>
        </div>

        {result && (
          <div className="pt-10 flex flex-col gap-8">
            <div className="grid grid-cols-3 gap-5">
              <Stat value={result.synced} label="pages lues" />
              <Stat value={result.created} label="articles créés" />
              <Stat value={result.updated} label="articles mis à jour" />
            </div>
            {result.errors.length > 0 ? (
              <Notice tone="error" title={`erreurs (${result.errors.length})`}>
                <ul className="m-0 pl-5 list-disc">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </Notice>
            ) : (
              <Notice tone="success">Synchronisation terminée.</Notice>
            )}
          </div>
        )}
      </section>

      <section>
        <SectionLabel n="03">Fonctionnement</SectionLabel>
        <ol className="m-0 p-0 list-none flex flex-col border-b-2 border-[#141414]">
          {STEPS.map((step, i) => (
            <li key={step} className="grid grid-cols-[48px_minmax(0,1fr)] gap-4 py-4 border-t border-[#c9c5bd] first:border-t-2 first:border-[#141414]">
              <span className="font-plex text-[13px] text-[var(--accent)] pt-0.5">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-[16px] leading-[1.55]">{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
