import { IMAGE_COLORS } from '@/lib/image-theme';
import { ogResponse, OG_TAGLINE } from '@/lib/og';

/** Share card of the home page, referenced by the root layout's metadata. */
export const dynamic = 'force-static';

export function GET() {
  return ogResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 72px',
          background: IMAGE_COLORS.bg,
          color: IMAGE_COLORS.text,
          fontFamily: 'Archivo',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: 24, color: IMAGE_COLORS.faint }}>
          <span>$ whoami</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 14, height: 14, borderRadius: 7, background: IMAGE_COLORS.ok }} />
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
              Mary<span style={{ color: IMAGE_COLORS.accent }}>.</span>
            </div>
          </div>
          <div style={{ display: 'flex', fontSize: 38, fontWeight: 500, lineHeight: 1.2, color: IMAGE_COLORS.text2, maxWidth: 900 }}>
            {OG_TAGLINE}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'JetBrains Mono', fontSize: 22, color: IMAGE_COLORS.faint }}>
          <span>EPSI Nantes · alternance Epsight</span>
          <span>albanmary.com</span>
        </div>
      </div>
    )
  );
}
