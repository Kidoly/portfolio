'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Trash2, X } from 'lucide-react';
import { BTN_DANGER, BTN_PRIMARY, BTN_SECONDARY, Loading, Notice, PageHeader, formatDate, pill, readError } from '@/components/admin/ui';
import { useAdmin } from '../AdminLayoutClient';

type CommentStatus = 'pending' | 'approved' | 'rejected';

interface AdminComment {
  id: string;
  postSlug: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  status: CommentStatus;
  createdAt: string;
}

const FILTERS: [CommentStatus | 'all', string][] = [
  ['pending', 'En attente'],
  ['approved', 'Approuvés'],
  ['rejected', 'Rejetés'],
  ['all', 'Tous'],
];

const STATUS: Record<CommentStatus, { label: string; dot: string }> = {
  pending: { label: 'en attente', dot: 'border border-[#68655f]' },
  approved: { label: 'approuvé', dot: 'bg-[oklch(0.62_0.15_150)]' },
  rejected: { label: 'rejeté', dot: 'bg-[var(--accent)]' },
};

export default function AdminCommentsPage() {
  const { refreshPending } = useAdmin();
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<CommentStatus | 'all'>('pending');

  useEffect(() => {
    fetch('/api/admin/comments/')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then(setComments)
      .catch(() => setError('Impossible de charger les commentaires.'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (comment: AdminComment, status: CommentStatus) => {
    setError('');
    const res = await fetch(`/api/admin/comments/${comment.id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => null);
    if (!res?.ok) return setError(res ? await readError(res) : 'Erreur réseau.');
    const updated: AdminComment = await res.json();
    setComments((prev) => prev.map((c) => (c.id === comment.id ? updated : c)));
    refreshPending();
  };

  const remove = async (comment: AdminComment) => {
    if (!confirm(`Supprimer le commentaire de ${comment.authorName} ?`)) return;
    setError('');
    const res = await fetch(`/api/admin/comments/${comment.id}/`, { method: 'DELETE' }).catch(() => null);
    if (!res?.ok) return setError(res ? await readError(res) : 'Erreur réseau.');
    setComments((prev) => prev.filter((c) => c.id !== comment.id));
    refreshPending();
  };

  const count = (status: CommentStatus | 'all') =>
    status === 'all' ? comments.length : comments.filter((c) => c.status === status).length;
  const filtered = comments
    .filter((c) => filter === 'all' || c.status === filter)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <PageHeader prompt="$ tail -f comments.log" title="Commentaires" />

      <div className="flex flex-wrap gap-2 pb-6" role="group" aria-label="Filtrer par statut">
        {FILTERS.map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)} aria-pressed={filter === key} className={pill(filter === key)}>
            {label} <span className="opacity-60">{count(key)}</span>
          </button>
        ))}
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
          {filter === 'pending' ? 'Aucun commentaire en attente.' : 'Aucun commentaire.'}
        </p>
      ) : (
        <div className="flex flex-col border-b-2 border-[#141414]">
          {filtered.map((comment) => (
            <article key={comment.id} className="border-t-2 border-[#141414] py-6 grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[18px] font-bold leading-[1.25] break-words">{comment.authorName}</span>
                {comment.authorEmail && (
                  <a href={`mailto:${comment.authorEmail}`} className="font-mono text-[12px] text-[#4a4a48] break-all hover:text-[var(--accent)] hover:no-underline">
                    {comment.authorEmail}
                  </a>
                )}
                <span className="font-plex text-[12px] text-[#68655f]">{formatDate(comment.createdAt, true)}</span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[12px] pt-1.5">
                  <span aria-hidden="true" className={`size-2 rounded-full ${STATUS[comment.status].dot}`} />
                  {STATUS[comment.status].label}
                </span>
              </div>

              <div className="flex flex-col gap-4 min-w-0">
                <a
                  href={`/blog/${comment.postSlug}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start inline-flex items-center gap-1 font-mono text-[12px] text-[#4a4a48] hover:text-[var(--accent)] hover:no-underline"
                >
                  /blog/{comment.postSlug}/ <ArrowUpRight className="w-3.5 h-3.5" aria-hidden />
                </a>
                <p className="m-0 text-[16px] leading-[1.6] whitespace-pre-wrap break-words">{comment.content}</p>
                <div className="flex flex-wrap gap-2">
                  {comment.status !== 'approved' && (
                    <button onClick={() => updateStatus(comment, 'approved')} className={BTN_PRIMARY}>
                      <Check className="w-4 h-4" aria-hidden /> Approuver
                    </button>
                  )}
                  {comment.status !== 'rejected' && (
                    <button onClick={() => updateStatus(comment, 'rejected')} className={BTN_SECONDARY}>
                      <X className="w-4 h-4" aria-hidden /> Rejeter
                    </button>
                  )}
                  <button onClick={() => remove(comment)} className={BTN_DANGER}>
                    <Trash2 className="w-4 h-4" aria-hidden /> Supprimer
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
