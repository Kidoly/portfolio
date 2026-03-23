'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Eye, EyeOff, RefreshCw, Plus, Lock, Shield } from 'lucide-react';
import { MessageSquare } from 'lucide-react';

// Login form shown when not authenticated
function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authentikEnabled, setAuthentikEnabled] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if Authentik SSO is available
    fetch('/api/admin/login')
      .then((res) => res.json())
      .then((data) => setAuthentikEnabled(data.authentik === true))
      .catch(() => {});

    // Check for OAuth error from redirect
    const oauthError = searchParams.get('error');
    if (oauthError) {
      const messages: Record<string, string> = {
        auth_denied: 'Authentification refusée par Authentik',
        missing_params: 'Paramètres OAuth manquants',
        invalid_state: 'Session OAuth invalide, réessayez',
        token_exchange: 'Erreur lors de l\'échange de token',
        user_info: 'Impossible de récupérer vos informations',
      };
      setError(messages[oauthError] || 'Erreur d\'authentification');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.refresh();
        window.location.reload();
      } else {
        setError('Identifiants invalides');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Admin</h1>
          <p className="text-gray-500 mt-2">Connectez-vous pour gérer vos articles</p>
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg mb-4">{error}</p>
        )}

        {/* Authentik SSO Button */}
        {authentikEnabled && (
          <>
            <a
              href="/api/admin/auth/authentik"
              className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-2.5 rounded-lg font-medium hover:bg-orange-700 transition mb-4"
            >
              <Shield className="w-5 h-5" />
              Se connecter avec Authentik
            </a>
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-400">ou</span>
              </div>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom d&apos;utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Dashboard shown when authenticated
function Dashboard() {
  const [stats, setStats] = useState<{
    total: number;
    published: number;
    drafts: number;
  } | null>(null);
  const [pendingComments, setPendingComments] = useState<number>(0);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/posts')
      .then((res) => res.json())
      .then((posts) => {
        setStats({
          total: posts.length,
          published: posts.filter((p: any) => p.published).length,
          drafts: posts.filter((p: any) => !p.published).length,
        });
      })
      .catch(() => {});

    fetch('/api/admin/comments')
      .then((res) => (res.ok ? res.json() : []))
      .then((comments) => {
        setPendingComments(comments.filter((c: any) => c.status === 'pending').length);
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <button
          onClick={() => router.push('/admin/posts/new')}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Nouvel article
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-500">Total articles</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {stats?.total ?? '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <Eye className="w-5 h-5 text-green-600" />
            <h3 className="text-sm font-medium text-gray-500">Publiés</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">
            {stats?.published ?? '—'}
          </p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-2">
            <EyeOff className="w-5 h-5 text-yellow-600" />
            <h3 className="text-sm font-medium text-gray-500">Brouillons</h3>
          </div>
          <p className="text-3xl font-bold text-yellow-600">
            {stats?.drafts ?? '—'}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <button
          onClick={() => router.push('/admin/posts')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition text-left"
        >
          <FileText className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Gérer les articles</h3>
          <p className="text-sm text-gray-500">
            Créer, modifier et publier vos articles de blog
          </p>
        </button>
        <button
          onClick={() => router.push('/admin/comments')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition text-left"
        >
          <MessageSquare className="w-8 h-8 text-emerald-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Modérer les commentaires</h3>
          <p className="text-sm text-gray-500">
            {pendingComments} commentaire(s) en attente de validation
          </p>
        </button>
        <button
          onClick={() => router.push('/admin/sync')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition text-left"
        >
          <RefreshCw className="w-8 h-8 text-cyan-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-1">Synchroniser Wiki.js</h3>
          <p className="text-sm text-gray-500">
            Importer les pages README depuis votre Wiki.js
          </p>
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/admin/me')
      .then((res) => {
        setAuthenticated(res.ok);
      })
      .catch(() => setAuthenticated(false));
  }, []);

  if (authenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authenticated) {
    return <LoginForm />;
  }

  return <Dashboard />;
}
