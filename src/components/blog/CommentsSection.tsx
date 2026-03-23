'use client';

import { FormEvent, useEffect, useState } from 'react';

interface PublicComment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

interface CommentsSectionProps {
  slug: string;
}

export default function CommentsSection({ slug }: CommentsSectionProps) {
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState<string>('');
  const [error, setError] = useState<string>('');

  const loadComments = async () => {
    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(slug)}/`);
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
  }, [slug]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setFeedback('');

    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(slug)}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, website: '' }),
      });

      let data: { error?: string; message?: string } = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        setError(data.error || 'Erreur lors de l\'envoi du commentaire.');
      } else {
        setName('');
        setEmail('');
        setMessage('');
        setFeedback(
          data.message || 'Commentaire envoyé. Il sera visible après validation.'
        );
      }
    } catch {
      setError('Erreur réseau. Merci de réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Laisser un commentaire</h3>

        <div className="grid md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Votre nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
            maxLength={80}
            required
          />
          <input
            type="email"
            placeholder="Votre email (optionnel)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
            maxLength={254}
          />
        </div>

        <textarea
          placeholder="Votre commentaire"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 min-h-28"
          maxLength={1500}
          required
        />

        {error && <p className="text-sm text-red-600">{error}</p>}
        {feedback && <p className="text-sm text-green-700">{feedback}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Commentaires publiés</h3>

        {loading ? (
          <p className="text-sm text-gray-500">Chargement...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-500">Aucun commentaire pour le moment.</p>
        ) : (
          comments.map((comment) => (
            <article key={comment.id} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-gray-900">{comment.authorName}</p>
                <p className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
