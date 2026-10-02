'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import PostEditor from '@/components/admin/PostEditor';
import { BTN_SECONDARY, Loading, PageHeader, readError } from '@/components/admin/ui';
import type { BlogPost } from '@/lib/blog/types';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    fetch(`/api/admin/posts/${id}/`)
      .then((res) => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then(setPost)
      .catch(() => router.replace('/admin/posts/'));
  }, [id, router]);

  const handleSave = async (data: Partial<BlogPost>) => {
    const res = await fetch(`/api/admin/posts/${id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await readError(res));
    setPost(await res.json());
  };

  if (!post) return <Loading />;

  return (
    <div>
      <PageHeader prompt={`$ vim ${post.slug}.md`} title="Modifier l'article">
        {post.published && (
          <a href={`/blog/${post.slug}/`} target="_blank" rel="noopener noreferrer" className={BTN_SECONDARY}>
            Voir l&apos;article <ArrowUpRight className="w-4 h-4" aria-hidden />
          </a>
        )}
      </PageHeader>
      <PostEditor post={post} onSave={handleSave} />
    </div>
  );
}
