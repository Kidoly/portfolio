'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import PostEditor from '@/components/admin/PostEditor';
import { BlogPost } from '@/lib/blog/types';

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(setPost)
      .catch(() => router.push('/admin/posts'))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const updated = await res.json();
        setPost(updated);
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch {
      alert('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Modifier l&apos;article</h1>
      <PostEditor post={post} onSave={handleSave} saving={saving} />
    </div>
  );
}
