import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
          borderRadius: '14px',
        }}
      >
        <span
          style={{
            fontSize: '38px',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-0.02em',
          }}
        >
          A
        </span>
      </div>
    ),
    { ...size }
  );
}
