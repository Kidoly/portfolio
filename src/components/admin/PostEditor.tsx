'use client';

import { useEffect, useRef, useState } from 'react';
import { Cpu, Plus, Sparkles, X } from 'lucide-react';
import type { BlogPost } from '@/lib/blog/types';
import { BTN_PRIMARY, BTN_SECONDARY, HINT, INPUT, LABEL, Notice, TAG } from './ui';

/** Same list as the AI prompt (lib/blog/auto-generate.ts), offered as suggestions. */
const CATEGORIES = [
  'Virtualisation', 'Conteneurisation', 'Réseaux', 'Cybersécurité', 'DevOps', 'Développement',
  'Administration Système', 'Cloud', 'Base de données', 'Monitoring', 'General',
];

interface Props {
  post?: BlogPost;
  /** Saves the post; throws an Error with a readable message when it fails. */
  onSave: (data: Partial<BlogPost>) => Promise<void>;
  authorName?: string;
}

type SaveState = { kind: 'idle' } | { kind: 'saving' } | { kind: 'saved'; at: Date } | { kind: 'error'; message: string };
type GenState =
  | { kind: 'idle' }
  | { kind: 'running' }
  | { kind: 'done'; source: 'local' | 'ai'; askedAi: boolean }
  | { kind: 'error'; message: string };

const time = (date: Date) => date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

function Counter({ value, max }: { value: string; max: number }) {
  return (
    <span className={value.length > max ? 'text-[var(--accent)]' : undefined}>
      {value.length}/{max}
    </span>
  );
}

export default function PostEditor({ post, onSave, authorName }: Props) {
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [content, setContent] = useState(post?.content || '');
  const [description, setDescription] = useState(post?.description || '');
  const [category, setCategory] = useState(post?.category || 'General');
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [coverImage, setCoverImage] = useState(post?.coverImage || '');
  const [published, setPublished] = useState(post?.published || false);
  const [locale, setLocale] = useState<'fr' | 'en'>(post?.locale || 'fr');
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(post?.seoDescription || '');
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonicalUrl || '');
  const [showSeo, setShowSeo] = useState(false);
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [preview, setPreview] = useState<{ html: string; error: string }>({ html: '', error: '' });
  const [save, setSave] = useState<SaveState>({ kind: 'idle' });
  const [gen, setGen] = useState<GenState>({ kind: 'idle' });
  const [aiAvailable, setAiAvailable] = useState<boolean | null>(null);

  // Unsaved changes: the fields as last saved (or as loaded) against the current ones
  const snapshot = JSON.stringify([title, slug, content, description, category, tags, coverImage, published, locale, seoTitle, seoDescription, canonicalUrl]);
  const [savedSnapshot, setSavedSnapshot] = useState(snapshot);
  const dirty = snapshot !== savedSnapshot;
  const canSave = Boolean(title.trim() && content.trim()) && save.kind !== 'saving';

  useEffect(() => {
    fetch('/api/admin/generate/')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setAiAvailable(data?.ai === true))
      .catch(() => setAiAvailable(false));
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const handleSave = async () => {
    if (!canSave) return;
    const sent = snapshot;
    setSave({ kind: 'saving' });
    try {
      await onSave({
        title,
        slug: slug || undefined,
        content,
        description,
        category,
        tags,
        coverImage: coverImage || undefined,
        published,
        locale,
        seoTitle: seoTitle || undefined,
        seoDescription: seoDescription || undefined,
        canonicalUrl: canonicalUrl || undefined,
        ...(authorName && !post ? { author: authorName } : {}),
      });
      setSavedSnapshot(sent);
      setSave({ kind: 'saved', at: new Date() });
    } catch (err) {
      setSave({ kind: 'error', message: err instanceof Error ? err.message : 'erreur inconnue' });
    }
  };

  // Ctrl+S / Cmd+S saves, with the latest fields
  const saveRef = useRef(handleSave);
  useEffect(() => {
    saveRef.current = handleSave;
  });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const addTags = () => {
    const added = tagInput
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t && !tags.includes(t));
    if (added.length) setTags([...tags, ...new Set(added)]);
    setTagInput('');
  };

  const showPreview = async () => {
    setTab('preview');
    setPreview({ html: '', error: '' });
    try {
      const res = await fetch('/api/admin/preview/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error('rendu impossible');
      const data = await res.json();
      setPreview({ html: data.html, error: '' });
    } catch {
      setPreview({ html: '', error: "L'aperçu n'a pas pu être généré." });
    }
  };

  const generate = async (useAI: boolean) => {
    if (!title || !content) return;
    setGen({ kind: 'running' });
    try {
      const res = await fetch('/api/admin/generate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title, locale, useAI }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDescription(data.description || description);
      setTags(data.tags?.length ? data.tags : tags);
      setCategory(data.category || category);
      setSeoTitle(data.seoTitle || seoTitle);
      setSeoDescription(data.seoDescription || seoDescription);
      setShowSeo(true);
      setGen({ kind: 'done', source: data.source === 'ai' ? 'ai' : 'local', askedAi: useAI });
    } catch {
      setGen({ kind: 'error', message: 'La génération a échoué.' });
    }
  };

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const saveText =
    save.kind === 'saving'
      ? 'enregistrement…'
      : save.kind === 'error'
        ? `échec : ${save.message}`
        : dirty
          ? 'modifications non enregistrées'
          : save.kind === 'saved'
            ? `enregistré à ${time(save.at)}`
            : post
              ? 'à jour'
              : '';

  return (
    <div>
      {/* Action bar */}
      <div className="sticky top-0 z-10 bg-[#f3f1ec] border-y-2 border-[#141414] py-3 mb-8 flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
        <div className="flex flex-wrap items-center gap-5">
          <button
            role="switch"
            aria-checked={published}
            onClick={() => setPublished(!published)}
            className="inline-flex items-center gap-2.5 cursor-pointer text-[15px] font-semibold"
          >
            <span
              aria-hidden="true"
              className={`relative w-10 h-[22px] rounded-full transition-colors ${published ? 'bg-[oklch(0.62_0.15_150)]' : 'bg-[#c9c5bd]'}`}
            >
              <span
                className={`absolute top-[3px] left-[3px] size-4 rounded-full bg-white transition-transform ${published ? 'translate-x-[18px]' : ''}`}
              />
            </span>
            Publié
          </button>
          <div role="group" aria-label="Langue de l'article" className="inline-flex border border-[#141414] font-mono text-[12px]">
            {(['fr', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLocale(l)}
                aria-pressed={locale === l}
                className={`px-2.5 py-1 cursor-pointer transition-colors ${locale === l ? 'bg-[#141414] text-[#f3f1ec]' : 'hover:bg-[#e6e3dc]'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span
            role="status"
            className={`font-mono text-[12px] ${save.kind === 'error' ? 'text-[var(--accent)]' : 'text-[#68655f]'}`}
          >
            {saveText}
          </span>
          <button onClick={handleSave} disabled={!canSave} className={BTN_PRIMARY} title="Ctrl+S">
            {save.kind === 'saving' ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>

      <div className="grid gap-x-10 gap-y-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Title + Markdown */}
        <div className="flex flex-col gap-6 min-w-0">
          <div>
            <label htmlFor="post-title" className="sr-only">
              Titre
            </label>
            <input
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre de l'article"
              className="w-full bg-transparent border-0 border-b-2 border-transparent focus:border-[#141414] outline-none pb-2 font-extrabold tracking-[-0.035em] leading-[1.05] placeholder:text-[#c9c5bd] transition-colors"
              style={{ fontSize: 'clamp(30px, 4vw, 44px)' }}
            />
            <p className={HINT}>albanmary.com/blog/{slug || 'généré-depuis-le-titre'}/</p>
          </div>

          <div className="border border-[#141414] bg-white/70">
            <div role="tablist" aria-label="Contenu" className="flex border-b border-[#141414] font-mono text-[13px]">
              {(
                [
                  ['write', 'écrire', () => setTab('write')],
                  ['preview', 'aperçu', showPreview],
                ] as const
              ).map(([key, label, onClick]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tab === key}
                  onClick={onClick}
                  className={`px-5 py-2.5 border-r border-[#141414] cursor-pointer transition-colors ${
                    tab === key ? 'bg-[#141414] text-[#f3f1ec]' : 'hover:bg-[#e6e3dc]'
                  }`}
                >
                  {label}
                </button>
              ))}
              <span className="ml-auto self-center px-4 text-[#68655f] hidden sm:block">markdown · {words} mots</span>
            </div>
            {tab === 'write' ? (
              <textarea
                aria-label="Contenu en Markdown"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Écrivez l'article en Markdown…"
                className="block w-full min-h-[560px] p-5 bg-transparent font-mono text-[14px] leading-[1.7] text-[#141414] outline-none resize-y placeholder:text-[#68655f]"
              />
            ) : (
              <div className="bg-[#f3f1ec] px-6 py-8 min-h-[560px]">
                {preview.error ? (
                  <Notice tone="error">{preview.error}</Notice>
                ) : preview.html ? (
                  <div className="blog-content max-w-[720px]" dangerouslySetInnerHTML={{ __html: preview.html }} />
                ) : (
                  <p className="m-0 font-mono text-[13px] text-[#68655f]">rendu en cours…</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <aside className="flex flex-col gap-7">
          <section className="border-t-2 border-[#141414] pt-4 flex flex-col gap-3">
            <h2 className="m-0 font-plex text-[13px] font-normal">Remplissage automatique</h2>
            <p className="m-0 text-[14px] leading-[1.5] text-[#4a4a48]">
              Description, tags, catégorie et SEO déduits du titre et du contenu.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => generate(false)}
                disabled={gen.kind === 'running' || !title || !content}
                className={BTN_SECONDARY}
              >
                <Cpu className="w-4 h-4" aria-hidden /> Analyse locale
              </button>
              <button
                onClick={() => generate(true)}
                disabled={gen.kind === 'running' || !title || !content || aiAvailable !== true}
                className={BTN_SECONDARY}
                title={aiAvailable === false ? 'OPENAI_API_KEY absent du serveur' : 'Via OpenAI'}
              >
                <Sparkles className="w-4 h-4" aria-hidden /> IA
              </button>
            </div>
            <p role="status" className="m-0 font-mono text-[12px] text-[#68655f]">
              {gen.kind === 'running' && 'analyse en cours…'}
              {gen.kind === 'done' &&
                (gen.askedAi && gen.source === 'local'
                  ? "IA indisponible : champs remplis par l'analyse locale"
                  : `champs remplis par ${gen.source === 'ai' ? "l'IA" : "l'analyse locale"}, à relire`)}
              {gen.kind === 'error' && <span className="text-[var(--accent)]">{gen.message}</span>}
              {gen.kind === 'idle' && aiAvailable === false && 'IA désactivée : OPENAI_API_KEY absent du serveur'}
            </p>
          </section>

          <section className="border-t-2 border-[#141414] pt-4 flex flex-col gap-5">
            <div>
              <label htmlFor="post-slug" className={LABEL}>
                Slug (URL)
              </label>
              <input id="post-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="généré depuis le titre" className={INPUT} />
            </div>

            <div>
              <label htmlFor="post-description" className={LABEL}>
                Description
              </label>
              <textarea
                id="post-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Résumé court de l'article"
                rows={4}
                className={`${INPUT} resize-y`}
              />
              <p className={HINT}>
                <Counter value={description} max={160} /> · utilisée partout (liste, article, partage). Vide : premier paragraphe de l&apos;article.
              </p>
            </div>

            <div>
              <label htmlFor="post-category" className={LABEL}>
                Catégorie
              </label>
              <input id="post-category" list="post-categories" value={category} onChange={(e) => setCategory(e.target.value)} className={INPUT} />
              <datalist id="post-categories">
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label htmlFor="post-tags" className={LABEL}>
                Tags
              </label>
              <div className="flex gap-2">
                <input
                  id="post-tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTags();
                    }
                  }}
                  placeholder="proxmox, ceph…"
                  className={INPUT}
                />
                <button onClick={addTags} aria-label="Ajouter le tag" className="shrink-0 w-11 border border-[#141414] inline-flex items-center justify-center cursor-pointer hover:bg-[#141414] hover:text-[#f3f1ec] transition-colors">
                  <Plus className="w-4 h-4" aria-hidden />
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {tags.map((tag) => (
                    <span key={tag} className={TAG}>
                      #{tag}
                      <button
                        onClick={() => setTags(tags.filter((t) => t !== tag))}
                        aria-label={`Retirer le tag ${tag}`}
                        className="cursor-pointer text-[#68655f] hover:text-[var(--accent)]"
                      >
                        <X className="w-3 h-3" aria-hidden />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="post-cover" className={LABEL}>
                Image de couverture
              </label>
              <input id="post-cover" type="url" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://…" className={INPUT} />
              {/^https?:\/\//.test(coverImage) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={coverImage} alt="Aperçu de la couverture" className="mt-2.5 w-full h-36 object-cover border border-[#c9c5bd]" />
              )}
            </div>
          </section>

          <details open={showSeo} onToggle={(e) => setShowSeo(e.currentTarget.open)} className="border-t-2 border-[#141414] pt-4 group">
            <summary className="cursor-pointer font-plex text-[13px] list-none flex justify-between items-center">
              SEO avancé
              <span aria-hidden="true" className="font-mono text-[#68655f] group-open:rotate-45 transition-transform">
                +
              </span>
            </summary>
            <div className="flex flex-col gap-5 pt-5">
              <div>
                <label htmlFor="post-seo-title" className={LABEL}>
                  Titre SEO (remplace le titre dans Google)
                </label>
                <input id="post-seo-title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className={INPUT} />
                <p className={HINT}>
                  <Counter value={seoTitle} max={60} />
                </p>
              </div>
              <div>
                <label htmlFor="post-seo-description" className={LABEL}>
                  Meta description (si la description est vide)
                </label>
                <textarea
                  id="post-seo-description"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={3}
                  className={`${INPUT} resize-y`}
                />
                <p className={HINT}>
                  <Counter value={seoDescription} max={160} />
                </p>
              </div>
              <div>
                <label htmlFor="post-canonical" className={LABEL}>
                  URL canonique
                </label>
                <input id="post-canonical" type="url" value={canonicalUrl} onChange={(e) => setCanonicalUrl(e.target.value)} placeholder="https://…" className={INPUT} />
              </div>

              <div className="bg-white border border-[#c9c5bd] p-4 flex flex-col gap-0.5">
                <span className="font-plex text-[12px] text-[#68655f] pb-2">Aperçu Google</span>
                <span className="text-[13px] text-[#4d5156] truncate">albanmary.com › blog › {slug || 'slug'}</span>
                <span className="text-[18px] leading-[1.3] text-[#1a0dab] line-clamp-1">{seoTitle || title || "Titre de l'article"} | Alban Mary</span>
                <span className="text-[13px] leading-[1.5] text-[#4d5156] line-clamp-2">
                  {description || seoDescription || "Description de l'article…"}
                </span>
              </div>
            </div>
          </details>
        </aside>
      </div>
    </div>
  );
}
