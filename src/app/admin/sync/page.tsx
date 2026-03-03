'use client';

import { useState } from 'react';
import { RefreshCw, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function SyncPage() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{
    synced: number;
    created: number;
    updated: number;
    errors: string[];
  } | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const err = await res.json();
        setResult({ synced: 0, created: 0, updated: 0, errors: [err.error || 'Erreur inconnue'] });
      }
    } catch (err) {
      setResult({
        synced: 0,
        created: 0,
        updated: 0,
        errors: ['Erreur de connexion au serveur'],
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        Synchronisation Wiki.js
      </h1>
      <p className="text-gray-500 mb-8">
        Importez automatiquement les pages README de votre Wiki.js et
        transformez-les en articles de blog optimisés pour le SEO.
      </p>

      {/* Configuration info */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <h2 className="font-semibold text-gray-900 mb-3">Configuration</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 w-32">Wiki.js URL:</span>
            <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">
              {process.env.NEXT_PUBLIC_WIKI_URL || 'Non configuré'}
            </code>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 w-32">API Key:</span>
            <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">
              {process.env.NEXT_PUBLIC_WIKI_API_KEY ? '••••••••' : 'Non configuré'}
            </code>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Configurez <code className="bg-gray-100 px-1 rounded">WIKI_API_URL</code> et{' '}
          <code className="bg-gray-100 px-1 rounded">WIKI_API_KEY</code> dans votre fichier{' '}
          <code className="bg-gray-100 px-1 rounded">.env.local</code>
        </p>
      </div>

      {/* Sync button */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900 mb-1">
              Lancer la synchronisation
            </h2>
            <p className="text-sm text-gray-500">
              Toutes les pages Wiki.js seront importées. Les articles existants
              seront mis à jour, les nouveaux seront créés en brouillon.
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition font-medium whitespace-nowrap"
          >
            {syncing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Synchronisation...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Synchroniser
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Résultats</h2>

          <div className="grid gap-4 md:grid-cols-3 mb-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-blue-700">{result.synced}</p>
              <p className="text-sm text-blue-600">Pages synchronisées</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{result.created}</p>
              <p className="text-sm text-green-600">Nouveaux articles</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-yellow-700">{result.updated}</p>
              <p className="text-sm text-yellow-600">Articles mis à jour</p>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4">
              <h3 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Erreurs ({result.errors.length})
              </h3>
              <ul className="space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i} className="text-sm text-red-600">
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.errors.length === 0 && result.synced > 0 && (
            <div className="bg-green-50 rounded-lg p-4 flex items-center gap-3">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-green-700 font-medium">
                Synchronisation terminée avec succès !
              </p>
            </div>
          )}
        </div>
      )}

      {/* How it works */}
      <div className="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-4">
          Comment ça fonctionne
        </h2>
        <ol className="space-y-3 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
              1
            </span>
            <span>
              Le système se connecte à votre Wiki.js via l&apos;API GraphQL
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
              2
            </span>
            <span>
              Chaque page README est récupérée avec son contenu Markdown
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
              3
            </span>
            <span>
              Le Markdown est transformé en article de blog avec métadonnées SEO
              automatiques (titre, description, temps de lecture, balises
              structurées)
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
              4
            </span>
            <span>
              Les nouveaux articles sont créés en brouillon — publiez-les
              manuellement après révision
            </span>
          </li>
        </ol>
      </div>
    </div>
  );
}
