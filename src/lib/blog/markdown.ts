import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';
import readingTime from 'reading-time';
import sanitizeHtml from 'sanitize-html';
import type { Nodes as MdNodes, Root as MdRoot, Text as MdText } from 'mdast';
import type { ElementContent, Nodes as HastNodes, Root as HastRoot } from 'hast';

export interface TocItem {
  id: string;
  text: string;
}

export interface RenderedArticle {
  html: string;
  toc: TocItem[];
}

/** Wiki.js attribute annotations such as `{.is-info}` or `{.links-list}`. */
const WIKI_CLASS_RE = /\{\.[a-z][\w-]*\}/gi;
const WIKI_CALLOUT_RE = /\s*\{\.is-(info|warning|danger|success)\}\s*$/;
const LEADING_PICTOGRAPHS_RE = /^(?:[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{200D}\u{FE0F}\u{20E3}]\s*)+/u;
const SHELL_LANGS_RE = /^(bash|sh|shell|zsh|console)$/;

const NOTE_LABELS: Record<string, string> = {
  info: '(Info)',
  warning: '(Attention)',
  danger: '(Danger)',
  success: '(Succès)',
};

type TreeNode = { type: string; children?: TreeNode[] };

function walk<T extends TreeNode>(node: T, visit: (node: T) => void): void {
  visit(node);
  for (const child of (node.children ?? []) as T[]) walk(child, visit);
}

function mdText(node: MdNodes): string {
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  if (node.type === 'break') return ' ';
  if (node.type === 'image' || node.type === 'html') return '';
  return 'children' in node ? node.children.map(mdText).join('') : '';
}

function hastText(node: HastNodes): string {
  if (node.type === 'text') return node.value;
  return 'children' in node ? node.children.map(hastText).join('') : '';
}

/** Deepest last text node of a block: where a trailing `{.is-info}` ends up. */
function lastTextNode(node: MdNodes): MdText | undefined {
  if (node.type === 'text') return node;
  const children: MdNodes[] = 'children' in node ? node.children : [];
  for (let i = children.length - 1; i >= 0; i -= 1) {
    const found = lastTextNode(children[i]);
    if (found) return found;
  }
  return undefined;
}

/**
 * Wiki.js callouts: a blockquote followed by `{.is-info}` (on its last line or
 * as the next paragraph) becomes a note box with a mono label. Any other or
 * misplaced Wiki.js class annotation is simply removed from the text.
 */
function remarkWikiCallouts() {
  return (tree: MdRoot) => {
    walk<MdNodes>(tree, (node) => {
      if (!('children' in node)) return;
      const children = node.children as MdNodes[];
      for (let i = 0; i < children.length; i += 1) {
        const block = children[i];
        if (block.type !== 'blockquote') continue;

        let type: string | undefined;
        const tail = lastTextNode(block);
        const trailing = tail?.value.match(WIKI_CALLOUT_RE);
        if (tail && trailing) {
          type = trailing[1];
          tail.value = tail.value.replace(WIKI_CALLOUT_RE, '');
        } else {
          const next = children[i + 1];
          const own = next?.type === 'paragraph' ? mdText(next).trim().match(/^\{\.is-(info|warning|danger|success)\}$/) : null;
          if (own) {
            type = own[1];
            children.splice(i + 1, 1);
          }
        }
        if (!type) continue;

        block.data = { hName: 'div', hProperties: { className: ['note', `note-${type}`], role: 'note' } };
        block.children.unshift({
          type: 'paragraph',
          data: { hProperties: { className: ['note-label'] } },
          children: [{ type: 'text', value: NOTE_LABELS[type] }],
        });
      }
    });

    walk<MdNodes>(tree, (node) => {
      if (node.type === 'text') node.value = node.value.replace(WIKI_CLASS_RE, '');
      if (node.type === 'root' || node.type === 'blockquote' || node.type === 'listItem') {
        // Drop paragraphs left empty once their annotation is gone
        const kept = (node.children as MdNodes[]).filter(
          (child) => !(child.type === 'paragraph' && child.children.every((c) => c.type === 'text' && !c.value.trim()))
        );
        node.children = kept as typeof node.children;
      }
    });
  };
}

function sameTitle(a: string, b: string): boolean {
  const normalize = (value: string) => value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
  return normalize(a) === normalize(b);
}

/**
 * Drops a leading H1 that repeats the article title (the page already renders
 * it) and moves every heading down a level when the body has H1s left, so the
 * title stays the page's only H1. Strips emojis at the start of H2/H3 and
 * manual "1." prefixes on H3 (numbered 01, 02… by the stylesheet).
 */
function remarkArticleHeadings(options: { title?: string } = {}) {
  return (tree: MdRoot) => {
    const [first] = tree.children;
    if (options.title && first?.type === 'heading' && first.depth === 1 && sameTitle(mdText(first), options.title)) {
      tree.children.shift();
    }
    const shift = tree.children.some((node) => node.type === 'heading' && node.depth === 1) ? 1 : 0;
    walk<MdNodes>(tree, (node) => {
      if (node.type !== 'heading') return;
      node.depth = Math.min(node.depth + shift, 6) as typeof node.depth;
      if (node.depth < 2 || node.depth > 3) return;
      const head = node.children[0];
      if (head?.type !== 'text') return;
      head.value = head.value.replace(LEADING_PICTOGRAPHS_RE, '');
      if (node.depth === 3) head.value = head.value.replace(/^\d+[.)]\s+/, '');
    });
  };
}

/** Wraps tables in a container that scrolls horizontally on small screens. */
function rehypeWrapTables() {
  return (tree: HastRoot) => {
    walk<HastNodes>(tree, (node) => {
      if (node.type !== 'root' && node.type !== 'element') return;
      if (node.type === 'element' && node.tagName === 'div' && String(node.properties.className ?? '').includes('table-wrap')) return;
      node.children = node.children.map((child): ElementContent =>
        child.type === 'element' && child.tagName === 'table'
          ? { type: 'element', tagName: 'div', properties: { className: ['table-wrap'] }, children: [child] }
          : (child as ElementContent)
      );
    });
  };
}

/** Removes Wiki.js layout hacks: lines holding only a <br> or a "** **" spacer. */
function preprocessMarkdown(md: string): string {
  return md.replace(/^[ \t]*(?:<br\s*\/?>|\*\*\s+\*\*)[ \t]*$/gim, '');
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    // Structure
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'div', 'span', 'br', 'hr',
    'blockquote', 'pre', 'code',
    // Lists (+ GFM task list checkboxes)
    'ul', 'ol', 'li', 'input',
    // Tables
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    // Inline
    'a', 'strong', 'em', 'b', 'i', 'u', 's', 'del', 'ins',
    'sub', 'sup', 'mark', 'abbr', 'kbd',
    // Media
    'img', 'figure', 'figcaption', 'picture', 'source', 'video',
    // Details/Summary
    'details', 'summary',
  ],
  allowedAttributes: {
    '*': ['class', 'id'],
    'div': ['role'],
    'input': ['type', 'checked', 'disabled', 'aria-hidden'],
    'a': ['href', 'title', 'target', 'rel'],
    'img': ['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding'],
    'td': ['align', 'colspan', 'rowspan'],
    'th': ['align', 'colspan', 'rowspan'],
    'source': ['src', 'type', 'srcset', 'sizes'],
    'video': ['src', 'controls', 'width', 'height', 'poster'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  // Only read-only task list checkboxes survive (decorative: hidden from assistive tech)
  exclusiveFilter: (frame) => frame.tag === 'input' && frame.attribs.type !== 'checkbox',
  transformTags: {
    input: (tagName, attribs) => ({ tagName, attribs: { ...attribs, disabled: '', 'aria-hidden': 'true' } }),
    // Article images sit below the hero: loaded when scrolled to, unless the markdown says otherwise
    img: (tagName, attribs) => ({ tagName, attribs: { loading: 'lazy', decoding: 'async', ...attribs } }),
  },
};

/**
 * Code block chrome, rendered server-side: language bar + copy button (wired by
 * <CodeBlockCopyButtons />) and a green "$" prompt on shell commands, skipped
 * on continuation lines. The prompt is marked so copy and selection exclude it.
 */
function decorateCodeBlocks(html: string): string {
  return html.replace(/<pre><code(?: class="([^"]*)")?>([\s\S]*?)<\/code><\/pre>/g, (_match, cls = '', inner: string) => {
    const lang = (cls as string).match(/language-([A-Za-z0-9]+)/)?.[1] ?? '';
    let continued = false;
    const body = SHELL_LANGS_RE.test(lang)
      ? inner
          .split('\n')
          .map((line) => {
            const text = line.replace(/<[^>]+>/g, '');
            const prompt = text.trim() !== '' && !continued;
            continued = /\\\s*$/.test(text);
            return prompt ? `<span class="cb-prompt">$ </span>${line}` : line;
          })
          .join('\n')
      : inner;
    return (
      `<div class="cb"><div class="cb-bar"><span>${lang || 'bash'}</span>` +
      `<button type="button" class="cb-copy">copier</button></div>` +
      `<pre><code class="${cls}">${body}</code></pre></div>`
    );
  });
}

/** Renders an article body and its table of contents (H2s). */
export async function renderArticle(markdown: string, options: { title?: string } = {}): Promise<RenderedArticle> {
  const toc: TocItem[] = [];
  const collectToc = () => (tree: HastRoot) => {
    walk<HastNodes>(tree, (node) => {
      if (node.type === 'element' && node.tagName === 'h2' && typeof node.properties.id === 'string') {
        toc.push({ id: node.properties.id, text: hastText(node).trim() });
      }
    });
  };

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkWikiCallouts)
    .use(remarkArticleHeadings, options)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeHighlight, { detect: true })
    .use(rehypeWrapTables)
    .use(collectToc)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(preprocessMarkdown(markdown));

  return { html: decorateCodeBlocks(sanitizeHtml(String(file), SANITIZE_OPTIONS)), toc };
}

export async function markdownToHtml(markdown: string): Promise<string> {
  return (await renderArticle(markdown)).html;
}

/** "8 min de lecture" (fr) / "8 min read" (en), computed from the markdown. */
export function getReadingTime(content: string, locale: 'fr' | 'en' = 'fr'): string {
  const minutes = Math.max(1, Math.ceil(readingTime(content).minutes));
  return locale === 'en' ? `${minutes} min read` : `${minutes} min de lecture`;
}

export function extractFirstImage(markdown: string): string | undefined {
  const match = markdown.match(/!\[.*?\]\((.*?)\)/);
  return match ? match[1] : undefined;
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
  return `${base.replace(/[\s,;:.\-–-]+$/, '')}…`;
}

/**
 * Fallback summary: the first real paragraph of the article. Headings, tables,
 * blockquotes, code and lists are skipped; the text is stripped of markdown and
 * cut to ~`maxLength` characters on a word boundary.
 */
export function extractExcerpt(markdown: string, maxLength = 160): string {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const paragraphs = tree.children
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
