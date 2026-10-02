'use client';

import { useRouter } from 'next/navigation';
import PostEditor from '@/components/admin/PostEditor';
import { PageHeader, readError } from '@/components/admin/ui';
import type { BlogPost } from '@/lib/blog/types';
import { useAdmin } from '../../AdminLayoutClient';

export default function NewPostPage() {
  const router = useRouter();
  const { user } = useAdmin();

  const handleSave = async (data: Partial<BlogPost>) => {
    const res = await fetch('/api/admin/posts/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(await readError(res));
    const post: BlogPost = await res.json();
    router.push(`/admin/posts/${post.id}/edit/`);
  };

  return (
    <div>
      <PageHeader prompt="$ touch nouvel-article.md" title="Nouvel article" />
      <PostEditor onSave={handleSave} authorName={user?.name} />
    </div>
  );
}
