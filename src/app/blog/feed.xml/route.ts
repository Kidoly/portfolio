import { getPublishedPosts } from '@/lib/blog/posts';

export const dynamic = 'force-dynamic';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET() {
  const baseUrl = 'https://albanmary.com';
  const posts = getPublishedPosts();

  const items = posts
    .slice(0, 50)
    .map(
      (post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/blog/${post.slug}/</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}/</guid>
      <description>${escapeXml(post.description || '')}</description>
      <pubDate>${new Date(post.publishedAt || post.updatedAt).toUTCString()}</pubDate>
      <author>contact@albanmary.com (Alban Mary)</author>
      ${post.category ? `<category>${escapeXml(post.category)}</category>` : ''}
      ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('\n      ')}
    </item>`
    )
    .join('');

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Blog — Alban Mary</title>
    <link>${baseUrl}/blog/</link>
    <description>Articles sur le développement web, l'administration système, la cybersécurité et les réseaux par Alban Mary.</description>
    <language>fr</language>
    <managingEditor>contact@albanmary.com (Alban Mary)</managingEditor>
    <webMaster>contact@albanmary.com (Alban Mary)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/icon.svg</url>
      <title>Blog — Alban Mary</title>
      <link>${baseUrl}/blog/</link>
    </image>
    ${items}
  </channel>
</rss>`;

  return new Response(feed.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
