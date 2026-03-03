export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string; // raw markdown
  contentHtml?: string; // rendered HTML
  author: string;
  tags: string[];
  category: string;
  coverImage?: string;
  published: boolean;
  publishedAt: string; // ISO date
  updatedAt: string; // ISO date
  wikiPath?: string; // original Wiki.js path
  wikiId?: number; // original Wiki.js page ID
  readingTime?: string;
  locale: 'fr' | 'en';
  seoTitle?: string; // custom SEO title override
  seoDescription?: string; // custom SEO description override
  canonicalUrl?: string;
}

export interface BlogPostMeta {
  id: string;
  slug: string;
  title: string;
  description: string;
  author: string;
  tags: string[];
  category: string;
  coverImage?: string;
  published: boolean;
  publishedAt: string;
  updatedAt: string;
  readingTime?: string;
  locale: 'fr' | 'en';
}

export interface WikiPage {
  id: number;
  path: string;
  title: string;
  description: string;
  content: string;
  tags: { tag: string }[];
  updatedAt: string;
  createdAt: string;
  locale: string;
}

export interface SyncResult {
  synced: number;
  created: number;
  updated: number;
  errors: string[];
}
