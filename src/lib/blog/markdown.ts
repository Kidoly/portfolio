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
    info: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" overflow="visible"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
    success: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" overflow="visible"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
    warning: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" overflow="visible"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
    danger: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" overflow="visible"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>`,
  };

  // Match blockquote lines followed by {.is-TYPE}
  // Supports multi-line blockquotes and inline {.is-TYPE} on the last line
  // First normalize: move inline {.is-*} from inside blockquote to after it
  let normalized = md.replace(
    /^(>[^\n]*)\{\.is-(info|success|warning|danger)\}\s*$/gm,
    '$1\n{.is-$2}'
  );

  return normalized.replace(
    /((?:^>[^\n]*\n?)+)\s*\{\.is-(info|success|warning|danger)\}/gm,
    (_match, blockquoteRaw: string, type: string) => {
      // Strip leading "> " from each line and join
      const text = blockquoteRaw
        .split('\n')
        .map((line: string) => line.replace(/^>\s?/, '').trim())
        .filter((line: string) => line.length > 0)
        .join(' ');

      const icon = calloutIcons[type] || calloutIcons.info;

      // Convert inline markdown inside the callout text
      const html = text
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');

      return `<div class="callout callout-${type}"><div class="callout-icon">${icon}</div><div class="callout-content">${html}</div></div>\n`;
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

  // Convert Wiki.js spacer lines (** **) to a line break after the <br>→\n\n pass
  processed = processed.replace(/^\*\*\s+\*\*\s*$/gm, '<br>');

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

  let sanitized = sanitizeHtml(result.toString(), {
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
      'svg': ['xmlns', 'width', 'height', 'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'overflow'],
      'path': ['d', 'fill', 'stroke'],
      'circle': ['cx', 'cy', 'r'],
      'polyline': ['points'],
      'line': ['x1', 'y1', 'x2', 'y2'],
      'rect': ['x', 'y', 'width', 'height', 'rx', 'ry'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });

  // Expose the code language on a data attribute (for the client-side copy bar)
  // and prepend a green shell prompt ($) to each line of bash-like code blocks.
  // The prompt is marked so the copy button and text selection can exclude it.
  // Note: rehype-highlight emits `class="hljs language-xxx"`, so match any order.
  sanitized = sanitized.replace(
    /<pre><code class="([^"]*)">([\s\S]*?)<\/code><\/pre>/g,
    (_match, cls: string, inner: string) => {
      const langMatch = cls.match(/language-([A-Za-z0-9]+)/);
      const lang = langMatch ? langMatch[1] : '';
      const isShell = /^(bash|sh|shell|zsh|console)$/.test(lang);
      const body = isShell
        ? inner
            .split('\n')
            .map((line) => (line.trim() === '' ? line : `<span class="cb-prompt">$ </span>${line}`))
            .join('\n')
        : inner;
      const dataAttr = lang ? ` data-language="${lang}"` : '';
      return `<pre><code${dataAttr} class="${cls}">${body}</code></pre>`;
    }
  );

  return sanitized;
}

export function getReadingTime(content: string): string {
  const stats = readingTime(content);
  return stats.text;
}

export function extractFirstImage(markdown: string): string | undefined {
  const match = markdown.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : undefined;
}

type MdNode = { type: string; value?: string; children?: MdNode[] };

/** Wiki.js attribute annotations such as `{.is-info}` or `{.links-list}`. */
const WIKI_CLASS_RE = /\{\.[a-z][\w-]*\}/gi;
const LEADING_PICTOGRAPHS_RE = /^(?:[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{200D}\u{FE0F}\u{20E3}]\s*)+/u;

function mdText(node: MdNode): string {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value ?? '';
  if (node.type === 'break') return ' ';
  if (node.type === 'image' || node.type === 'html') return '';
  return (node.children ?? []).map(mdText).join('');
}

/**
 * Cut `text` to at most `maxLength` characters: on the last sentence end when
 * one is close enough, otherwise on a word boundary with an ellipsis.
 */
export function truncateOnWord(text: string, maxLength = 160): string {
  if (text.length <= maxLength) return text;
  const head = `${text.slice(0, maxLength)} `;
  const sentenceEnd = Math.max(head.lastIndexOf('. '), head.lastIndexOf('! '), head.lastIndexOf('? '));
  if (sentenceEnd > maxLength * 0.6) return text.slice(0, sentenceEnd + 1);
  const cut = text.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(' ');
  const base = lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s,;:.\-–—]+$/, '')}…`;
}

/**
 * Fallback summary: the first real paragraph of the article. Headings, tables,
 * blockquotes, code and lists are skipped; the text is stripped of markdown and
 * cut to ~`maxLength` characters on a word boundary.
 */
export function extractExcerpt(markdown: string, maxLength = 160): string {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as MdNode;
  const paragraphs = (tree.children ?? [])
    .filter((node) => node.type === 'paragraph')
    .map((node) =>
      mdText(node).replace(WIKI_CLASS_RE, '').replace(/\s+/g, ' ').trim().replace(LEADING_PICTOGRAPHS_RE, '')
    )
    .filter(Boolean);
  // Prefer a paragraph long enough to summarise (skips "Que fait cette commande ?")
  const text = paragraphs.find((p) => p.length >= 40) ?? paragraphs[0] ?? '';
  return truncateOnWord(text, maxLength);
}

/** False for empty values and for markdown leftovers of the old auto-excerpt (table row, heading, quote…). */
export function isUsableDescription(text: string | undefined): text is string {
  const value = text?.trim();
  return !!value && !/^(\||#{1,6}\s|>|```|~~~|[-*+]\s|\{\.|<)/.test(value);
}

export function generateSeoTitle(title: string, siteName = 'Alban Mary'): string {
  const maxLength = 60;
  const suffix = ` | ${siteName}`;
  if (title.length + suffix.length <= maxLength) {
    return title + suffix;
  }
  return title.substring(0, maxLength - suffix.length - 3) + '...' + suffix;
}
