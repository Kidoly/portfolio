'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Pencil, Plus, Trash2 } from 'lucide-react';
import type { BlogPost } from '@/lib/blog/types';
import { BTN_PRIMARY, ICON_BTN, Loading, Notice, PageHeader, Status, TAG, formatDate, pill } from '@/components/admin/ui';

type Filter = 'all' | 'published' | 'draft';

const FILTERS: [Filter, string][] = [
  ['all', 'Tous'],
  ['published', 'Publiés'],
  ['draft', 'Brouillons'],
];

export default function PostsListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useEffect(() => {
    fetch('/api/admin/posts/')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then(setPosts)
      .catch(() => setError('Impossible de charger les articles.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (post: BlogPost) => {
    if (!confirm(`Supprimer l'article « ${post.title} » ?`)) return;
    setError('');
    const res = await fetch(`/api/admin/posts/${post.id}/`, { method: 'DELETE' }).catch(() => null);
    if (res?.ok) setPosts((prev) => prev.filter((p) => p.id !== post.id));
    else setError(`La suppression de « ${post.title} » a échoué.`);
  };

  const handleTogglePublish = async (post: BlogPost) => {
    setError('');
    const res = await fetch(`/api/admin/posts/${post.id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !post.published }),
    }).catch(() => null);
    if (res?.ok) {
      const updated: BlogPost = await res.json();
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } else {
      setError(`Le changement de statut de « ${post.title} » a échoué.`);
    }
  };

  const query = search.trim().toLowerCase();
  const counts: Record<Filter, number> = {
    all: posts.length,
    published: posts.filter((p) => p.published).length,
    draft: posts.filter((p) => !p.published).length,
  };
  const filtered = posts
    .filter((post) => filter === 'all' || (filter === 'published') === post.published)
    .filter((post) => !query || [post.title, post.description, post.category, ...post.tags].join(' ').toLowerCase().includes(query))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div>
      <PageHeader prompt="$ ls ~/blog/posts" title="Articles">
        <Link href="/admin/posts/new/" className={BTN_PRIMARY}>
          <Plus className="w-4 h-4" aria-hidden /> Nouvel article
        </Link>
      </PageHeader>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6">
        <label className="flex-1 max-w-[520px] flex items-center gap-3 border border-[#141414] bg-white/70 px-4 font-mono text-[13px]">
          <span className="text-[#68655f]">$ grep</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="titre, tag, catégorie…"
            aria-label="Rechercher un article"
            className="flex-1 min-w-0 bg-transparent outline-none py-3 text-[14px] placeholder:text-[#68655f]"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par statut">
          {FILTERS.map(([key, label]) => (
            <button key={key} onClick={() => setFilter(key)} aria-pressed={filter === key} className={pill(filter === key)}>
              {label} <span className="opacity-60">{counts[key]}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="pb-6">
          <Notice tone="error">{error}</Notice>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <p className="m-0 border-y-2 border-[#141414] py-10 text-[20px] font-bold">
          Aucun article{query ? ` pour « ${search.trim()} »` : ''}.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-left">
            <thead>
              <tr className="font-plex text-[12px] text-[#68655f]">
                <th scope="col" className="font-normal pb-3 pr-5">Article</th>
                <th scope="col" className="font-normal pb-3 pr-5">Statut</th>
                <th scope="col" className="font-normal pb-3 pr-5">Catégorie</th>
                <th scope="col" className="font-normal pb-3 pr-5">Date</th>
                <th scope="col" className="font-normal pb-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="border-y-2 border-[#141414]">
              {filtered.map((post) => (
                <tr key={post.id} className="border-t border-[#c9c5bd] first:border-t-0 align-top">
                  <td className="py-4 pr-5">
                    <Link
                      href={`/admin/posts/${post.id}/edit/`}
                      className="text-[17px] font-semibold leading-[1.3] hover:text-[var(--accent)] hover:no-underline transition-colors"
                    >
                      {post.title}
                    </Link>
                    <p className="m-0 mt-1 text-[14px] leading-[1.5] text-[#4a4a48] line-clamp-2 max-w-[560px]">
                      {post.description || <span className="italic text-[#68655f]">Sans description : l&apos;extrait de l&apos;article est utilisé.</span>}
                    </p>
                    {(post.tags.length > 0 || post.wikiId) && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {post.wikiId && <span className={TAG}>wiki #{post.wikiId}</span>}
                        {post.tags.slice(0, 5).map((tag) => (
                          <span key={tag} className="font-mono text-[12px] text-[#4a4a48]">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="py-4 pr-5">
                    <button
                      onClick={() => handleTogglePublish(post)}
                      aria-label={`${post.published ? 'publié, repasser en brouillon' : 'brouillon, publier'} « ${post.title} »`}
                      title={post.published ? 'Repasser en brouillon' : 'Publier'}
                      className="cursor-pointer border-b border-dashed border-[#c9c5bd] pb-0.5 hover:border-[#141414] transition-colors"
                    >
                      <Status on={post.published} />
                    </button>
                  </td>
                  <td className="py-4 pr-5">
                    <span className={TAG}>{post.category}</span>
                  </td>
                  <td className="py-4 pr-5 font-plex text-[12px] text-[#68655f] whitespace-nowrap">
                    {post.published ? `publié le ${formatDate(post.publishedAt)}` : `modifié le ${formatDate(post.updatedAt)}`}
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    {post.published && (
                      <a
                        href={`/blog/${post.slug}/`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={ICON_BTN}
                        aria-label={`Voir « ${post.title} » sur le blog`}
                        title="Voir sur le blog"
                      >
                        <ExternalLink className="w-4 h-4" aria-hidden />
                      </a>
                    )}
                    <Link href={`/admin/posts/${post.id}/edit/`} className={ICON_BTN} aria-label={`Modifier « ${post.title} »`} title="Modifier">
                      <Pencil className="w-4 h-4" aria-hidden />
                    </Link>
                    <button
                      onClick={() => handleDelete(post)}
                      className={`${ICON_BTN} hover:text-[var(--accent)]!`}
                      aria-label={`Supprimer « ${post.title} »`}
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
