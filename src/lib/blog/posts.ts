import fs from 'fs';
import path from 'path';
import { BlogPost, BlogPostMeta } from './types';
import { extractExcerpt, getReadingTime, isUsableDescription } from './markdown';

const POSTS_DIR = path.join(process.cwd(), 'content', 'blog');

function ensureDir() {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
  }
}

function getPostPath(id: string): string {
  return path.join(POSTS_DIR, `${id}.json`);
}

export function getAllPosts(): BlogPost[] {
  ensureDir();
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.json'));
  const posts: BlogPost[] = files.map(file => {
    const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
    return JSON.parse(raw) as BlogPost;
  });
  return posts.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getPublishedPosts(): BlogPost[] {
  return getAllPosts().filter(p => p.published);
}

export function getPostBySlug(slug: string): BlogPost | null {
  const posts = getAllPosts();
  return posts.find(p => p.slug === slug) || null;
}

export function getPostById(id: string): BlogPost | null {
  const filePath = getPostPath(id);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as BlogPost;
}

export function savePost(post: BlogPost): BlogPost {
  ensureDir();
  post.updatedAt = new Date().toISOString();
  fs.writeFileSync(getPostPath(post.id), JSON.stringify(post, null, 2), 'utf-8');
  return post;
}

export function deletePost(id: string): boolean {
  const filePath = getPostPath(id);
  if (!fs.existsSync(filePath)) return false;
  fs.unlinkSync(filePath);
  return true;
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function getPostMeta(post: BlogPost): BlogPostMeta {
  const { content, contentHtml, wikiPath, wikiId, seoTitle, seoDescription, canonicalUrl, ...meta } = post;
  return meta;
}

/**
 * Summary used everywhere (lists, article hero, meta / OG / Twitter, RSS):
 * the curated `description` first, then the SEO one, then the first real
 * paragraph of the article.
 */
export function getPostDescription(post: Pick<BlogPost, 'description' | 'seoDescription' | 'content'>): string {
  if (isUsableDescription(post.description)) return post.description.trim();
  if (isUsableDescription(post.seoDescription)) return post.seoDescription.trim();
  return extractExcerpt(post.content);
}

/**
 * Page title of an article, without the site suffix (added once by the root
 * title template): the SEO title when set, else the full title. Legacy SEO
 * titles carrying " | Alban Mary" or cut with "..." are cleaned / ignored.
 */
export function getSeoTitle(post: Pick<BlogPost, 'title' | 'seoTitle'>): string {
  const seoTitle = post.seoTitle?.replace(/\s*\|\s*Alban Mary\s*$/i, '').trim();
  return seoTitle && !/(\.\.\.|…)$/.test(seoTitle) ? seoTitle : post.title;
}

/** Post fields needed by list views, without the markdown body. */
export function getPostSummary(post: BlogPost): BlogPostMeta {
  return {
    ...getPostMeta(post),
    description: getPostDescription(post),
    readingTime: getReadingTime(post.content, post.locale),
  };
}

export function getAllTags(): string[] {
  const posts = getPublishedPosts();
  const tagSet = new Set<string>();
  posts.forEach(p => p.tags.forEach(t => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

export function getAllCategories(): string[] {
  const posts = getPublishedPosts();
  const catSet = new Set<string>();
  posts.forEach(p => {
    if (p.category) catSet.add(p.category);
  });
  return Array.from(catSet).sort();
}

export function getPostsByTag(tag: string): BlogPost[] {
  return getPublishedPosts().filter(p => p.tags.includes(tag));
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getPublishedPosts().filter(p => p.category === category);
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogPost[] {
  const posts = getPublishedPosts().filter(p => p.id !== post.id);

  // Score each post by how many tags they share + same category bonus
  const scored = posts.map(p => {
    let score = 0;
    score += p.tags.filter(t => post.tags.includes(t)).length * 2;
    if (p.category === post.category) score += 1;
    return { post: p, score };
  });

  const related = scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.post);

  // Topped up with the latest posts: every article links to others, none is left orphaned
  const latest = posts.filter(p => !related.includes(p));
  return [...related, ...latest].slice(0, limit);
}
