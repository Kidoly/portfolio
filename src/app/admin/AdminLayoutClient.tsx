'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  RefreshCw,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';

interface UserInfo {
  name: string;
  email?: string;
  provider: 'local' | 'authentik';
}

export default function AdminLayoutClient({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/me/')
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setAuthenticated(true);
          setUser({ name: data.name, email: data.email, provider: data.provider });
        } else {
          setAuthenticated(false);
        }
      })
      .catch(() => setAuthenticated(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/admin/logout/', { method: 'POST' });
    setAuthenticated(false);
    router.push('/admin');
  };

  // Show login page if not authenticated
  if (authenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!authenticated) {
    // If we're on the login page, show children (the login form)
    if (pathname === '/admin' || pathname === '/admin/') {
      return <>{children}</>;
    }
    // Otherwise redirect to login
    router.push('/admin');
    return null;
  }

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/posts', label: 'Articles', icon: FileText },
    { href: '/admin/comments', label: 'Commentaires', icon: MessageSquare },
    { href: '/admin/sync', label: 'Wiki Sync', icon: RefreshCw },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-500 hover:text-gray-700"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <span className="font-semibold text-gray-900">Blog Admin</span>
        <button onClick={handleLogout} className="text-gray-500 hover:text-red-600">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform lg:translate-x-0 lg:static lg:inset-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-6 border-b border-slate-800">
            <Link href="/admin" className="text-xl font-bold">
              📝 Blog Admin
            </Link>
          </div>
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
            {user && (
              <div className="flex items-center gap-3 px-4 py-2.5 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {user.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {user.provider === 'authentik' ? 'via Authentik' : 'Local'}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition w-full"
            >
              <LogOut className="w-5 h-5" />
              Déconnexion
            </button>
            <Link
              href="/blog"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white transition mt-2"
            >
              ← Voir le blog
            </Link>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 p-6 lg:p-8 min-h-screen">{children}</main>
      </div>
    </div>
  );
}
