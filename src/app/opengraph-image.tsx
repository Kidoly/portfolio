import { ImageResponse } from 'next/og';
import { loadOgFonts, OG_COLORS, OG_SIZE, OG_TAGLINE } from '@/lib/og';

export const runtime = 'nodejs';
export const alt = 'Alban Mary - Ingénieur systèmes & réseaux';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image() {
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
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: 24, color: OG_COLORS.dim }}>
          <span>$ whoami</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: OG_COLORS.ok }} />
            <span>online</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontWeight: 800,
              fontSize: 156,
              lineHeight: 0.86,
              letterSpacing: '-0.055em',
            }}
          >
            <span>Alban</span>
            <div style={{ display: 'flex' }}>
              Mary<span style={{ color: OG_COLORS.accent }}>.</span>
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: 38, fontWeight: 500, lineHeight: 1.2, color: OG_COLORS.text2, maxWidth: 900 }}>
            {OG_TAGLINE}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: 22, color: OG_COLORS.dim }}>
          <span>EPSI Nantes · alternance Epsight</span>
          <span>albanmary.com</span>
        </div>
      </div>
    ),
    { ...size, fonts: await loadOgFonts() }
  );
}
