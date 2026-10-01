import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/blog/posts';
import { loadOgFonts, OgBrand, OG_COLORS, OG_SIZE, OG_TAGLINE } from '@/lib/og';

export const runtime = 'nodejs';
export const alt = 'Article du blog d’Alban Mary';
export const size = OG_SIZE;
export const contentType = 'image/png';

function titleSize(title: string): number {
  if (title.length <= 32) return 88;
  if (title.length <= 48) return 76;
  if (title.length <= 72) return 64;
  return 54;
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const title = post?.published ? post.title : 'Notes d’infra';
  const category = post?.published ? post.category || 'Blog' : 'Blog';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 72px',
          background: OG_COLORS.bg,
          color: OG_COLORS.text,
          fontFamily: 'Archivo',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          <div style={{ display: 'flex' }}>
            <span
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: 24,
                color: OG_COLORS.ok,
                border: `1px solid ${OG_COLORS.rule2}`,
                padding: '6px 14px',
              }}
            >
              {category}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              fontWeight: 800,
              fontSize: titleSize(title),
              lineHeight: 0.98,
              letterSpacing: '-0.045em',
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: `1px solid ${OG_COLORS.rule}`,
            paddingTop: 28,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <OgBrand size={44} />
            <span style={{ fontSize: 24, fontWeight: 500, color: OG_COLORS.text2 }}>{OG_TAGLINE}</span>
          </div>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 22, color: OG_COLORS.dim }}>albanmary.com/blog</span>
        </div>
      </div>
    ),
    { ...size, fonts: await loadOgFonts() }
  );
}
