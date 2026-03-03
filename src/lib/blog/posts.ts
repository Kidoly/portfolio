import fs from 'fs';
import path from 'path';
import { BlogPost, BlogPostMeta } from './types';

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
