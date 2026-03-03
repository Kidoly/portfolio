import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Alban Mary — Développeur Web & Administrateur Systèmes';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              color: '#60a5fa',
              fontWeight: 600,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Portfolio & Blog
          </div>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.1,
            }}
          >
            Alban Mary
          </div>
          <div
            style={{
              fontSize: '28px',
              color: '#94a3b8',
              lineHeight: 1.4,
              maxWidth: '700px',
            }}
          >
            Développeur Web & Administrateur Systèmes — EPSI Nantes
          </div>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginTop: '20px',
            }}
          >
            {['Next.js', 'Python', 'Docker', 'Linux', 'Cybersécurité'].map(
              (tag) => (
                <div
                  key={tag}
                  style={{
                    padding: '8px 20px',
                    background: 'rgba(96, 165, 250, 0.15)',
                    border: '1px solid rgba(96, 165, 250, 0.3)',
                    borderRadius: '999px',
                    color: '#93c5fd',
                    fontSize: '18px',
                    fontWeight: 500,
                  }}
                >
                  {tag}
                </div>
              )
            )}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '60px',
            fontSize: '20px',
            color: '#475569',
          }}
        >
          albanmary.com
        </div>
      </div>
    ),
    { ...size }
  );
}
