'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { formatPostDate } from '@/lib/blog/format';

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
  const [honeypot, setHoneypot] = useState('');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const loadComments = async () => {
    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(slug)}/`);
      if (res.ok) setComments(await res.json());
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        body: JSON.stringify({ name, email, message, website: honeypot }),
      });
      let data: { error?: string; message?: string } = {};
      try {
        data = await res.json();
      } catch {
        data = {};
      }
      if (!res.ok) {
        setError(data.error || "Erreur lors de l'envoi du commentaire.");
      } else {
        setName('');
        setEmail('');
        setMessage('');
        setFeedback(data.message || 'Commentaire envoyé. Il sera visible après validation.');
      }
    } catch {
      setError('Erreur réseau. Merci de réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const field =
    'bg-transparent border-0 border-b border-[#141414] py-2.5 text-[17px] outline-none focus:border-[var(--accent)] transition-colors';

  return (
    <div className="flex flex-col gap-10">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-sm">
        <div className="grid md:grid-cols-2 gap-5">
          <label className="flex flex-col gap-1.5 font-medium">
            Nom
            <input value={name} onChange={(e) => setName(e.target.value)} className={field} maxLength={80} required disabled={submitting} />
          </label>
          <label className="flex flex-col gap-1.5 font-medium">
            Email (optionnel)
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} maxLength={254} disabled={submitting} />
          </label>
        </div>
        <label className="flex flex-col gap-1.5 font-medium">
          Commentaire
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className={`${field} resize-y`} maxLength={1500} required disabled={submitting} />
        </label>

        {/* honeypot: off-screen, left empty by people, filled by naive bots */}
        <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
          <input type="text" name="website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {feedback && <p className="text-sm text-green-700">{feedback}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="self-start bg-[#141414] text-[#f3f1ec] rounded-full px-6 py-3.5 font-bold text-[15px] cursor-pointer hover:bg-[var(--accent)] transition-colors disabled:opacity-60"
        >
          {submitting ? 'Envoi…' : 'Envoyer →'}
        </button>
        <p className="m-0 font-plex text-[12px] leading-[1.6] text-[#68655f]">
          Nom et commentaire publiés après modération, email jamais affiché.{' '}
          <Link href="/confidentialite/" className="text-[#4a4a48] border-b border-[#c9c5bd] hover:no-underline hover:border-[var(--accent)]">
            Politique de confidentialité
          </Link>
        </p>
      </form>

      <div className="flex flex-col">
        {loading ? (
          <p className="font-plex text-[12px] text-[#68655f]">Chargement…</p>
        ) : comments.length === 0 ? (
          <p className="font-plex text-[12px] text-[#68655f]">Aucun commentaire pour l&apos;instant.</p>
        ) : (
          comments.map((c) => (
            <article key={c.id} className="border-t border-[#c9c5bd] py-5 flex flex-col gap-2">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-bold text-[#141414]">{c.authorName}</span>
                <span className="font-plex text-[12px] text-[#68655f]">
                  {formatPostDate(c.createdAt)}
                </span>
              </div>
              <p className="text-[16px] leading-[1.6] text-[#2a2a28] whitespace-pre-wrap">{c.content}</p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
