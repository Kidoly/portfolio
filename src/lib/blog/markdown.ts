import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import readingTime from 'reading-time';
import sanitizeHtml from 'sanitize-html';

/**
 * Pre-process Wiki.js-style callout blocks before markdown parsing.
 *
 * Converts patterns like:
 *   > Some text
 *   {.is-info}
 *
 * Into a fenced HTML div that survives the remark pipeline:
 *   <div class="callout callout-info">
 *     <div class="callout-icon">ℹ️</div>
 *     <div class="callout-content">Some text</div>
 *   </div>
 */
function preprocessCallouts(md: string): string {
  const calloutIcons: Record<string, string> = {
    info: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
    danger: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
  };

  // Match blockquote lines followed by {.is-TYPE}
  // Supports multi-line blockquotes and inline {.is-TYPE} on the last line
  // First normalize: move inline {.is-*} from inside blockquote to after it
  let normalized = md.replace(
    /^(>\s*.*)\{\.is-(info|success|warning|danger)\}\s*$/gm,
    '$1\n{.is-$2}'
  );

  return normalized.replace(
    /((?:^>\s*.*\n?)+)\s*\{\.is-(info|success|warning|danger)\}/gm,
    (_match, blockquoteRaw: string, type: string) => {
      // Strip leading "> " from each line and join
      const text = blockquoteRaw
        .split('\n')
        .map((line: string) => line.replace(/^>\s?/, '').trim())
        .filter((line: string) => line.length > 0)
        .join(' ');

      const icon = calloutIcons[type] || calloutIcons.info;

      return `<div class="callout callout-${type}"><div class="callout-icon">${icon}</div><div class="callout-content">${text}</div></div>\n`;
    }
  );
}

/**
 * Pre-process the markdown to clean up Wiki.js specific HTML like <br> tags
 * and ensure images with full URLs work properly.
 */
function preprocessMarkdown(md: string): string {
  let processed = md;

  // Convert Wiki.js callouts first
  processed = preprocessCallouts(processed);

  // Convert <br> and <br/> to double-newline for proper paragraph breaks
  processed = processed.replace(/<br\s*\/?>/gi, '\n\n');

  return processed;
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const preprocessed = preprocessMarkdown(markdown);

  const result = await unified()
    .use(remarkParse as any)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeHighlight, { detect: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(preprocessed);

  return sanitizeHtml(result.toString(), {
    allowedTags: [
      // Structure
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'div', 'span', 'br', 'hr',
      'blockquote', 'pre', 'code',
      // Lists
      'ul', 'ol', 'li',
      // Tables
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
      // Inline
      'a', 'strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins',
      'sub', 'sup', 'mark', 'abbr', 'kbd',
      // Media
      'img', 'figure', 'figcaption', 'picture', 'source', 'video',
      // Callouts (SVG icons)
      'svg', 'path', 'circle', 'polyline', 'line', 'rect',
      // Details/Summary
      'details', 'summary',
    ],
    allowedAttributes: {
      '*': ['class', 'id'],
      'a': ['href', 'title', 'target', 'rel'],
      'img': ['src', 'alt', 'title', 'width', 'height', 'loading'],
      'td': ['align', 'colspan', 'rowspan'],
      'th': ['align', 'colspan', 'rowspan'],
      'code': ['class'],
      'span': ['class'],
      'source': ['src', 'type', 'srcset', 'sizes'],
      'video': ['src', 'controls', 'width', 'height', 'poster'],
      'svg': ['xmlns', 'width', 'height', 'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin'],
      'path': ['d', 'fill', 'stroke'],
      'circle': ['cx', 'cy', 'r'],
      'polyline': ['points'],
      'line': ['x1', 'y1', 'x2', 'y2'],
      'rect': ['x', 'y', 'width', 'height', 'rx', 'ry'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}

export function getReadingTime(content: string): string {
  const stats = readingTime(content);
  return stats.text;
}

export function extractFirstImage(markdown: string): string | undefined {
  const match = markdown.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : undefined;
}

export function extractDescription(markdown: string, maxLength = 160): string {
  // Remove markdown syntax to get plain text
  const plain = markdown
    .replace(/#{1,6}\s+/g, '') // headers
    .replace(/!\[.*?\]\(.*?\)/g, '') // images
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // links
    .replace(/(\*{1,2}|_{1,2})(.*?)\1/g, '$2') // bold/italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // code
    .replace(/^\s*[-*+]\s+/gm, '') // list items
    .replace(/^\s*>\s+/gm, '') // blockquotes
    .replace(/\n{2,}/g, ' ') // multiple newlines
    .replace(/\n/g, ' ') // single newlines
    .trim();

  if (plain.length <= maxLength) return plain;
  return plain.substring(0, maxLength - 3).replace(/\s+\S*$/, '') + '...';
}

export function generateSeoTitle(title: string, siteName = 'Alban Mary'): string {
  const maxLength = 60;
  const suffix = ` | ${siteName}`;
  if (title.length + suffix.length <= maxLength) {
    return title + suffix;
  }
  return title.substring(0, maxLength - suffix.length - 3) + '...' + suffix;
}
