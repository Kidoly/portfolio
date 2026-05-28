'use client';

import { useState } from 'react';
import { BlogPost } from '@/lib/blog/types';
import {
  Save,
  Eye,
  EyeOff,
  Settings,
  FileText,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
  Cpu,
  Zap,
} from 'lucide-react';

interface Props {
  post?: BlogPost;
  onSave: (data: Partial<BlogPost>) => Promise<void>;
  saving: boolean;
  authorName?: string;
}

export default function PostEditor({ post, onSave, saving, authorName }: Props) {
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
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [previewHtml, setPreviewHtml] = useState('');
  const [generating, setGenerating] = useState(false);
  const [genSource, setGenSource] = useState<'local' | 'ai' | null>(null);

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handlePreview = async () => {
    setActiveTab('preview');
    try {
      const res = await fetch('/api/admin/preview/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        const data = await res.json();
        setPreviewHtml(data.html);
      } else {
        setPreviewHtml('<p class="text-red-500">Erreur lors du rendu</p>');
      }
    } catch {
      setPreviewHtml('<p class="text-red-500">Erreur de connexion</p>');
    }
  };

  const handleSubmit = () => {
    onSave({
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
  };

  const handleGenerate = async (useAI: boolean) => {
    if (!title || !content) return;
    setGenerating(true);
    setGenSource(null);

    try {
      const res = await fetch('/api/admin/generate/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, title, locale, useAI }),
      });

      if (res.ok) {
        const data = await res.json();
        setDescription(data.description || description);
        setTags(data.tags?.length ? data.tags : tags);
        setCategory(data.category || category);
        setSeoTitle(data.seoTitle || seoTitle);
        setSeoDescription(data.seoDescription || seoDescription);
        setShowSeo(true);
        setGenSource(data.source);
      } else {
        alert('Erreur lors de la génération');
      }
    } catch {
      alert('Erreur de connexion');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top actions bar */}
      <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPublished(!published)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              published
                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
            }`}
          >
            {published ? (
              <>
                <Eye className="w-4 h-4" /> Publié
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" /> Brouillon
              </>
            )}
          </button>
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value as 'fr' | 'en')}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white"
          >
            <option value="fr">🇫🇷 Français</option>
            <option value="en">🇬🇧 English</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          {/* Auto-generate dropdown */}
          <div className="relative group">
            <button
              disabled={generating || !title || !content}
              onClick={() => handleGenerate(false)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 transition font-medium text-sm"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyse...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Auto-générer
                </>
              )}
            </button>
            {/* Dropdown for AI option */}
            {!generating && title && content && (
              <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                <div className="p-2">
                  <button
                    onClick={() => handleGenerate(false)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm hover:bg-gray-50 transition"
                  >
                    <Cpu className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Analyse locale</p>
                      <p className="text-xs text-gray-400">Détection auto, sans API</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleGenerate(true)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm hover:bg-gray-50 transition"
                  >
                    <Zap className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">IA (OpenAI)</p>
                      <p className="text-xs text-gray-400">Meilleurs résultats</p>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving || !title || !content}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main editor area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de l'article..."
            className="w-full text-3xl font-bold text-gray-900 bg-transparent border-none outline-none placeholder:text-gray-300"
          />

          {/* Content tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setActiveTab('write')}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition border-b-2 ${
                  activeTab === 'write'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                Écrire
              </button>
              <button
                onClick={handlePreview}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition border-b-2 ${
                  activeTab === 'preview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Eye className="w-4 h-4" />
                Aperçu
              </button>
            </div>

            {activeTab === 'write' ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Écrivez votre article en Markdown..."
                className="w-full min-h-[500px] p-6 text-gray-900 font-mono text-sm leading-relaxed resize-y outline-none"
              />
            ) : (
              <div
                className="p-6 blog-content min-h-[500px]"
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Slug */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Slug (URL)
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-generated-from-title"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">/blog/{slug || 'auto-generated'}</p>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Résumé court de l'article..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              {description.length}/160 caractères
            </p>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: DevOps, Cybersécurité..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tags */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Ajouter un tag..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddTag}
                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              >
                <Plus className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 bg-cyan-50 text-cyan-700 px-2.5 py-1 rounded-full text-xs font-medium"
                >
                  #{tag}
                  <button onClick={() => handleRemoveTag(tag)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image de couverture
            </label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
            />
            {coverImage && (
              <img
                src={coverImage}
                alt="Cover preview"
                className="mt-2 rounded-lg w-full h-32 object-cover"
              />
            )}
          </div>

          {/* SEO Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={() => setShowSeo(!showSeo)}
              className="w-full flex items-center justify-between p-4 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                SEO avancé
              </span>
              {showSeo ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {showSeo && (
              <div className="p-4 pt-0 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Titre SEO (override)
                  </label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Titre personnalisé pour les moteurs de recherche"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {seoTitle.length}/60 caractères
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Meta description (override)
                  </label>
                  <textarea
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Description pour les moteurs de recherche"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    {seoDescription.length}/160 caractères
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    URL canonique
                  </label>
                  <input
                    type="url"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* SEO Preview */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400 mb-2 font-medium">
                    Aperçu Google
                  </p>
                  <p className="text-blue-800 text-base font-medium line-clamp-1">
                    {seoTitle || title || 'Titre de l\'article'} | Alban Mary
                  </p>
                  <p className="text-green-700 text-xs">
                    albanmary.com/blog/{slug || 'slug-de-larticle'}
                  </p>
                  <p className="text-gray-600 text-sm line-clamp-2 mt-0.5">
                    {seoDescription || description || 'Description de l\'article...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
