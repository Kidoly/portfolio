import { BlogPost, WikiPage, SyncResult } from './types';
import { generateSlug, generateId, getAllPosts, savePost } from './posts';
import { getReadingTime, extractDescription, extractFirstImage } from './markdown';

const WIKI_API_URL = process.env.WIKI_API_URL || 'http://localhost:3000';
const WIKI_API_KEY = process.env.WIKI_API_KEY || '';

async function fetchWikiPages(): Promise<WikiPage[]> {
  const query = `
    {
      pages {
        list(orderBy: UPDATED, orderByDirection: DESC) {
          id
          path
          title
          description
          tags {
            tag
          }
          updatedAt
          createdAt
          locale
        }
      }
    }
  `;

  const response = await fetch(`${WIKI_API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${WIKI_API_KEY}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Wiki.js API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.pages.list;
}

async function fetchWikiPageContent(pageId: number): Promise<string> {
  const query = `
    {
      pages {
        single(id: ${pageId}) {
          content
        }
      }
    }
  `;

  const response = await fetch(`${WIKI_API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${WIKI_API_KEY}`,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Wiki.js API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.pages.single.content;
}

function wikiPageToBlogPost(page: WikiPage, content: string, existingPost?: BlogPost): BlogPost {
  const slug = existingPost?.slug || generateSlug(page.title);
  const description = page.description || extractDescription(content);
  const coverImage = existingPost?.coverImage || extractFirstImage(content);

  return {
    id: existingPost?.id || generateId(),
    slug,
    title: page.title,
    description,
    content,
    author: 'Alban Mary',
    tags: page.tags.map(t => t.tag),
    category: existingPost?.category || extractCategoryFromPath(page.path),
    coverImage,
    published: existingPost?.published ?? false, // default to draft on first sync
    publishedAt: existingPost?.publishedAt || page.createdAt,
    updatedAt: new Date().toISOString(),
    wikiPath: page.path,
    wikiId: page.id,
    readingTime: getReadingTime(content),
    locale: (page.locale as 'fr' | 'en') || 'fr',
    seoTitle: existingPost?.seoTitle,
    seoDescription: existingPost?.seoDescription,
    canonicalUrl: existingPost?.canonicalUrl,
  };
}

function extractCategoryFromPath(wikiPath: string): string {
  const parts = wikiPath.split('/');
  if (parts.length > 1) {
    return parts[0]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
  return 'General';
}

export async function syncFromWiki(): Promise<SyncResult> {
  const result: SyncResult = { synced: 0, created: 0, updated: 0, errors: [] };

  try {
    const wikiPages = await fetchWikiPages();
    const existingPosts = getAllPosts();

    for (const page of wikiPages) {
      try {
        const content = await fetchWikiPageContent(page.id);
        const existingPost = existingPosts.find(p => p.wikiId === page.id);

        const blogPost = wikiPageToBlogPost(page, content, existingPost);
        savePost(blogPost);

        if (existingPost) {
          result.updated++;
        } else {
          result.created++;
        }
        result.synced++;
      } catch (err) {
        result.errors.push(`Failed to sync page "${page.title}": ${err}`);
      }
    }
  } catch (err) {
    result.errors.push(`Failed to fetch wiki pages: ${err}`);
  }

  return result;
}

export async function syncSinglePage(wikiId: number): Promise<BlogPost | null> {
  try {
    const content = await fetchWikiPageContent(wikiId);

    // Fetch page metadata
    const query = `
      {
        pages {
          single(id: ${wikiId}) {
            id
            path
            title
            description
            tags { tag }
            updatedAt
            createdAt
            locale
          }
        }
      }
    `;

    const response = await fetch(`${WIKI_API_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WIKI_API_KEY}`,
      },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    const page = data.data.pages.single as WikiPage;

    const existingPosts = getAllPosts();
    const existingPost = existingPosts.find(p => p.wikiId === wikiId);

    const blogPost = wikiPageToBlogPost(page, content, existingPost);
    return savePost(blogPost);
  } catch (err) {
    console.error(`Failed to sync wiki page ${wikiId}:`, err);
    return null;
  }
}
