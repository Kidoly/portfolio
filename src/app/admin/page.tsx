'use client';

import { useEffect, useState, type CSSProperties, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Plus, Shield } from 'lucide-react';
import type { BlogPost } from '@/lib/blog/types';
import { useAdmin } from './AdminLayoutClient';
import { BTN_PRIMARY, PageHeader, SectionLabel, Stat, Status, formatDate } from '@/components/admin/ui';

const OAUTH_ERRORS: Record<string, string> = {
  auth_denied: 'Authentification refusée par Authentik.',
  missing_params: 'Paramètres OAuth manquants.',
  invalid_state: 'Session OAuth invalide, réessayez.',
  token_exchange: "Erreur lors de l'échange de jeton.",
  user_info: 'Impossible de récupérer vos informations.',
};

const DARK_INPUT =
  'w-full bg-[#131614] border border-[#333a36] px-3 py-2.5 text-[15px] text-[#e4e7e4] outline-none transition-colors focus:border-[#e4e7e4]';

/** Login screen, in the dark style of the heroes and error pages. */
function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [authentikEnabled, setAuthentikEnabled] = useState(false);

  useEffect(() => {
    fetch('/api/admin/login/')
      .then((res) => res.json())
      .then((data) => setAuthentikEnabled(data.authentik === true))
      .catch(() => {});

    // Error code sent back by the Authentik callback
    const oauthError = new URLSearchParams(window.location.search).get('error');
    if (oauthError) setError(OAUTH_ERRORS[oauthError] ?? "Erreur d'authentification.");
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        window.location.reload();
        return;
      }
      setError('Identifiants invalides.');
    } catch {
      setError('Erreur de connexion.');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#0e100f] text-[#e4e7e4] flex flex-col">
      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-14">
        <header className="flex justify-between items-center gap-5 py-7 text-sm font-medium">
          <a href="/" className="text-base font-semibold hover:no-underline">
            Alban Mary<span className="text-[var(--accent-on-dark)]">.</span>
          </a>
          <a href="/" className="nav-link text-[#9aa19c] hover:text-white hover:no-underline transition-colors">
            Retour au site
          </a>
        </header>
      </div>

      <div className="mx-auto w-full max-w-[1280px] px-6 lg:px-14 flex-1 grid lg:grid-cols-12 gap-x-5 gap-y-12 items-center py-12">
        <div className="lg:col-span-6 flex flex-col gap-6">
          <span className="font-mono text-[13px] text-[#7d8580] typing" style={{ '--steps': 9 } as CSSProperties}>
            $ sudo -i
          </span>
          <h1 className="m-0 font-extrabold leading-[0.84] tracking-[-0.055em]" style={{ fontSize: 'clamp(72px, 12vw, 168px)' }}>
            Admin<span className="text-[var(--accent-on-dark)] cursor-blink">.</span>
          </h1>
          <p className="m-0 text-[18px] leading-[1.55] text-[#9aa19c] max-w-[440px]">
            Backoffice du blog : articles, commentaires et import depuis Wiki.js.
          </p>
        </div>

        <div className="lg:col-span-5 lg:col-start-8 bg-[#161917] border border-[#2c322e] shadow-[0_20px_40px_rgba(0,0,0,0.4)]">
          <div className="flex justify-between px-5 py-2.5 border-b border-[#232825] font-mono text-[13px] text-[#7d8580]">
            <span>login</span>
            <span>~/admin</span>
          </div>
          <div className="p-5 flex flex-col gap-5 text-[15px]">
            {error && (
              <p role="alert" className="m-0 border border-[var(--accent-on-dark)] px-4 py-3 text-[14px]">
                {error}
              </p>
            )}

            {authentikEnabled && (
              <>
                <a
                  href="/api/admin/auth/authentik"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e4e7e4] text-[#0e100f] font-bold px-6 py-3 hover:bg-[var(--accent)] hover:text-[#f3f1ec] hover:no-underline transition-colors"
                >
                  <Shield className="w-4 h-4" aria-hidden /> Se connecter avec Authentik
                </a>
                <div className="flex items-center gap-3 font-mono text-[12px] text-[#7d8580]">
                  <span className="flex-1 border-t border-[#2c322e]" />
                  ou
                  <span className="flex-1 border-t border-[#2c322e]" />
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-[12px] text-[#9aa19c]">utilisateur</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  className={DARK_INPUT}
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="font-mono text-[12px] text-[#9aa19c]">mot de passe</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className={DARK_INPUT}
                />
              </label>
              <button
                type="submit"
                disabled={loading}
                className={`mt-1 rounded-full font-bold px-6 py-3 cursor-pointer transition-colors disabled:opacity-60 ${
                  authentikEnabled
                    ? 'border-2 border-[#e4e7e4] hover:bg-[#e4e7e4] hover:text-[#0e100f]'
                    : 'bg-[#e4e7e4] text-[#0e100f] hover:bg-[var(--accent)] hover:text-[#f3f1ec]'
                }`}
              >
                {loading ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

interface CommentStatusOnly {
  status: 'pending' | 'approved' | 'rejected';
}

function Dashboard() {
  const { user } = useAdmin();
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [comments, setComments] = useState<CommentStatusOnly[] | null>(null);

  useEffect(() => {
    fetch('/api/admin/posts/')
      .then((res) => (res.ok ? res.json() : []))
      .then(setPosts)
      .catch(() => setPosts([]));
    fetch('/api/admin/comments/')
      .then((res) => (res.ok ? res.json() : []))
      .then(setComments)
      .catch(() => setComments([]));
  }, []);

  const published = posts?.filter((p) => p.published).length;
  const pending = comments?.filter((c) => c.status === 'pending').length;
  const recent = posts ? [...posts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5) : [];
  const firstName = user?.name.split(' ')[0] ?? '';

  const shortcuts = [
    { href: '/admin/posts/', title: 'Articles', text: 'Écrire, modifier et publier les articles du blog.' },
    {
      href: '/admin/comments/',
      title: 'Commentaires',
      text: pending ? `${pending} commentaire${pending > 1 ? 's' : ''} en attente de modération.` : 'Aucun commentaire en attente.',
    },
    { href: '/admin/sync/', title: 'Wiki.js', text: 'Importer les pages du wiki, en brouillon.' },
  ];

  return (
    <div>
      <PageHeader prompt="$ whoami" title={firstName ? `Bonjour ${firstName}` : 'Tableau de bord'}>
        <Link href="/admin/posts/new/" className={BTN_PRIMARY}>
          <Plus className="w-4 h-4" aria-hidden /> Nouvel article
        </Link>
      </PageHeader>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-5 gap-y-8">
        <Stat value={posts?.length ?? '-'} label="articles" />
        <Stat value={published ?? '-'} label="publiés" />
        <Stat value={posts && published !== undefined ? posts.length - published : '-'} label="brouillons" />
        <Stat value={pending ?? '-'} label="commentaires en attente" />
      </div>

      <section className="pt-14 lg:pt-16">
        <SectionLabel n="01">Raccourcis</SectionLabel>
        <div className="flex flex-col border-b-2 border-[#141414]">
          {shortcuts.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group grid grid-cols-[minmax(0,1fr)_auto] gap-5 items-center py-5 border-t-2 border-[#141414] hover:text-[var(--accent)] hover:no-underline transition-colors"
            >
              <span className="flex flex-col gap-1">
                <span className="text-[24px] font-bold tracking-[-0.015em] leading-[1.15]">{s.title}</span>
                <span className="text-[15px] text-[#4a4a48]">{s.text}</span>
              </span>
              <ArrowRight className="w-5 h-5 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      {recent.length > 0 && (
        <section className="pt-14 lg:pt-16">
          <SectionLabel n="02">Derniers articles modifiés</SectionLabel>
          <div className="flex flex-col border-b-2 border-[#141414]">
            {recent.map((post) => (
              <Link
                key={post.id}
                href={`/admin/posts/${post.id}/edit/`}
                className="group grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_110px_130px] gap-x-5 gap-y-1 items-baseline py-4 border-t border-[#c9c5bd] first:border-t-2 first:border-[#141414] hover:no-underline"
              >
                <span className="text-[17px] font-semibold truncate group-hover:text-[var(--accent)] transition-colors">{post.title}</span>
                <Status on={post.published} />
                <span className="font-plex text-[12px] text-[#68655f] col-span-2 sm:col-span-1 sm:text-right">
                  {formatDate(post.updatedAt)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function AdminPage() {
  const { authenticated } = useAdmin();
  return authenticated ? <Dashboard /> : <LoginForm />;
}
