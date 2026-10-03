'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight, FileText, LayoutDashboard, LogOut, Menu, MessageSquare, RefreshCw, X } from 'lucide-react';
import { Loading } from '@/components/admin/ui';
import { STATS_OPT_OUT_KEY } from '@/lib/track';

export interface AdminUser {
  name: string;
  email?: string;
  provider: 'local' | 'authentik';
}

interface AdminSession {
  /** null while the session is being checked */
  authenticated: boolean | null;
  user: AdminUser | null;
  /** Re-reads the number of comments awaiting moderation, shown in the menu */
  refreshPending: () => void;
}

const AdminContext = createContext<AdminSession>({ authenticated: null, user: null, refreshPending: () => {} });

/** Session of the back office, checked once by the layout. */
export const useAdmin = () => useContext(AdminContext);

const NAV = [
  { href: '/admin/', label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/admin/posts/', label: 'Articles', icon: FileText },
  { href: '/admin/comments/', label: 'Commentaires', icon: MessageSquare },
  { href: '/admin/sync/', label: 'Wiki.js', icon: RefreshCw },
];

const trimSlash = (path: string) => path.replace(/\/+$/, '') || '/';

export default function AdminLayoutClient({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [pending, setPending] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = trimSlash(usePathname() ?? '/admin');
  const router = useRouter();
  const onLoginPage = pathname === '/admin';

  useEffect(() => {
    fetch('/api/admin/me/')
      .then(async (res) => {
        if (!res.ok) return setAuthenticated(false);
        const data = await res.json();
        setUser({ name: data.name || data.username, email: data.email ?? undefined, provider: data.provider });
        setAuthenticated(true);
      })
      .catch(() => setAuthenticated(false));
  }, []);

  const refreshPending = useCallback(() => {
    fetch('/api/admin/comments/')
      .then((res) => (res.ok ? res.json() : []))
      .then((comments: { status: string }[]) => setPending(comments.filter((c) => c.status === 'pending').length))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (authenticated) refreshPending();
  }, [authenticated, pathname, refreshPending]);

  // The owner's own visits stay out of the audience stats on this browser (undone from /confidentialite)
  useEffect(() => {
    if (!authenticated) return;
    try {
      localStorage.setItem(STATS_OPT_OUT_KEY, '1');
    } catch {}
  }, [authenticated]);

  // Signed out on an inner page: back to the login form
  useEffect(() => {
    if (authenticated === false && !onLoginPage) router.replace('/admin/');
  }, [authenticated, onLoginPage, router]);

  const logout = async () => {
    await fetch('/api/admin/logout/', { method: 'POST' });
    setUser(null);
    setAuthenticated(false);
    setMenuOpen(false);
  };

  const session: AdminSession = { authenticated, user, refreshPending };

  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-[#0e100f]">
        <Loading dark />
      </div>
    );
  }

  if (!authenticated) {
    return <AdminContext.Provider value={session}>{onLoginPage ? children : null}</AdminContext.Provider>;
  }

  const closeMenu = () => setMenuOpen(false);

  return (
    <AdminContext.Provider value={session}>
      <div className="min-h-screen bg-[#f3f1ec] text-[#141414] lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
        {/* Mobile bar */}
        <div className="lg:hidden bg-[#0e100f] text-[#e4e7e4] flex items-center justify-between px-5 py-4">
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
            aria-controls="admin-menu"
            className="cursor-pointer"
          >
            <Menu className="w-6 h-6" aria-hidden />
          </button>
          <span className="font-semibold">
            Alban Mary<span className="text-[var(--accent-on-dark)]">.</span>{' '}
            <span className="font-mono text-[12px] font-normal text-[#7d8580]">admin</span>
          </span>
          <button onClick={logout} aria-label="Se déconnecter" className="cursor-pointer text-[#9aa19c] hover:text-white">
            <LogOut className="w-5 h-5" aria-hidden />
          </button>
        </div>

        {/* Sidebar */}
        <aside
          id="admin-menu"
          className={`fixed inset-y-0 left-0 z-40 w-[248px] bg-[#0e100f] text-[#e4e7e4] flex flex-col transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
            menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-start justify-between px-6 pt-7 pb-8">
            <div className="flex flex-col gap-1">
              <Link href="/admin/" onClick={closeMenu} className="text-[17px] font-semibold hover:no-underline">
                Alban Mary<span className="text-[var(--accent-on-dark)]">.</span>
              </Link>
              <span className="font-mono text-[12px] text-[#7d8580]">~/admin</span>
            </div>
            <button onClick={closeMenu} aria-label="Fermer le menu" className="lg:hidden cursor-pointer text-[#9aa19c] hover:text-white">
              <X className="w-5 h-5" aria-hidden />
            </button>
          </div>

          <nav aria-label="Backoffice" className="flex flex-col gap-0.5 px-3 text-[15px] font-medium">
            {NAV.map(({ href, label, icon: Icon }) => {
              const target = trimSlash(href);
              const active = target === '/admin' ? pathname === '/admin' : pathname.startsWith(target);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 border-l-2 hover:no-underline transition-colors ${
                    active
                      ? 'border-[var(--accent-on-dark)] bg-[#161917] text-white'
                      : 'border-transparent text-[#9aa19c] hover:text-white hover:bg-[#131614]'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px]" aria-hidden />
                  <span className="flex-1">{label}</span>
                  {href === '/admin/comments/' && pending > 0 && (
                    <span className="font-mono text-[11px] bg-[var(--accent)] text-[#f3f1ec] px-1.5 py-0.5">
                      {pending}
                      <span className="sr-only"> en attente</span>
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto px-6 py-6 border-t border-[#232825] flex flex-col gap-4 text-[14px]">
            {user && (
              <div className="flex flex-col min-w-0">
                <span className="font-semibold truncate">{user.name}</span>
                <span className="font-mono text-[12px] text-[#7d8580]">
                  {user.provider === 'authentik' ? 'via Authentik' : 'compte local'}
                </span>
              </div>
            )}
            <div className="flex flex-col gap-2 text-[#9aa19c]">
              <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-white hover:no-underline">
                Voir le site <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
              </a>
              <a href="/blog/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-white hover:no-underline">
                Voir le blog <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
              </a>
              <button onClick={logout} className="inline-flex items-center gap-2 text-left cursor-pointer hover:text-[var(--accent-on-dark)]">
                <LogOut className="w-4 h-4" aria-hidden /> Déconnexion
              </button>
            </div>
          </div>
        </aside>

        {menuOpen && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={closeMenu} aria-hidden="true" />}

        <main className="min-w-0 px-6 py-8 sm:px-8 lg:px-12 lg:py-12">
          <div className="mx-auto max-w-[1180px]">{children}</div>
        </main>
      </div>
    </AdminContext.Provider>
  );
}
