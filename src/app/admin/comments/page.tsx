'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, X, Clock3, Trash2, ExternalLink } from 'lucide-react';

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

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<CommentStatus | 'all'>('pending');

  const loadComments = async () => {
    try {
      const res = await fetch('/api/admin/comments');
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  const updateStatus = async (id: string, status: CommentStatus) => {
    const res = await fetch(`/api/admin/comments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      const updated = await res.json();
      setComments((prev) => prev.map((c) => (c.id === id ? updated : c)));
    }
  };

  const removeComment = async (id: string) => {
    if (!confirm('Supprimer ce commentaire ?')) return;

    const res = await fetch(`/api/admin/comments/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const filtered = useMemo(() => {
    if (filter === 'all') return comments;
    return comments.filter((c) => c.status === filter);
  }, [comments, filter]);

  const countPending = comments.filter((c) => c.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Modération des commentaires</h1>
        <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
          {countPending} en attente
        </span>
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
          >
            {status === 'all'
              ? 'Tous'
              : status === 'pending'
                ? 'En attente'
                : status === 'approved'
                  ? 'Approuvés'
                  : 'Rejetés'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-500">
            Aucun commentaire.
          </div>
        ) : (
          filtered.map((comment) => (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <p className="font-medium text-gray-900">{comment.authorName}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString('fr-FR')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {comment.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      <Clock3 className="w-3 h-3" /> En attente
                    </span>
                  )}
                  {comment.status === 'approved' && (
                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      <Check className="w-3 h-3" /> Approuvé
                    </span>
                  )}
                  {comment.status === 'rejected' && (
                    <span className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                      <X className="w-3 h-3" /> Rejeté
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{comment.content}</p>

              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/blog/${comment.postSlug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-sm text-blue-700 hover:text-blue-800"
                >
                  <ExternalLink className="w-4 h-4" /> Voir l'article
                </Link>

                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => updateStatus(comment.id, 'approved')}
                    className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Approuver
                  </button>
                  <button
                    onClick={() => updateStatus(comment.id, 'rejected')}
                    className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  >
                    Rejeter
                  </button>
                  <button
                    onClick={() => removeComment(comment.id)}
                    className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
