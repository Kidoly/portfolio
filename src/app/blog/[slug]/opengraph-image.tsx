import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/blog/posts';

export const runtime = 'nodejs';
export const alt = 'Article du blog - Alban Mary';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  
  if (!post) {
    return new ImageResponse(<div style={{ background: '#0f172a', width: '100%', height: '100%' }}>Modele introuvable</div>);
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div
            style={{
              fontSize: '24px',
              color: '#60a5fa',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            {post.category || 'Blog'}
          </div>
          <div
            style={{
              fontSize: '60px',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.2,
            }}
          >
            {post.title}
          </div>
          <div
            style={{
              fontSize: '28px',
              color: '#94a3b8',
              lineHeight: 1.4,
              maxWidth: '800px',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {post.description}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
           <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
             <img 
               src="https://github.com/kidoly.png" 
               alt="Alban Mary" 
               style={{ width: '60px', height: '60px', borderRadius: '50%' }} 
             />
             <div style={{ display: 'flex', flexDirection: 'column' }}>
               <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold' }}>Alban Mary</div>
               <div style={{ color: '#94a3b8', fontSize: '18px' }}>albanmary.com</div>
             </div>
           </div>
           
           <div style={{ display: 'flex', gap: '8px' }}>
             {post.tags?.slice(0, 3).map(tag => (
                <div key={tag} style={{ padding: '8px 16px', background: 'rgba(96,165,250,0.15)', borderRadius: '999px', color: '#93c5fd', fontSize: '18px' }}>
                  {tag}
                </div>
             ))}
           </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
