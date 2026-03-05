'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PostEditor from '@/components/admin/PostEditor';

export default function NewPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [authorName, setAuthorName] = useState('');

  useEffect(() => {
    fetch('/api/admin/me')
      .then((res) => res.json())
      .then((data) => setAuthorName(data.name || data.username || ''))
      .catch(() => {});
  }, []);

  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const post = await res.json();
        router.push(`/admin/posts/${post.id}/edit`);
      } else {
        alert('Erreur lors de la création');
      }
    } catch {
      alert('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nouvel article</h1>
      <PostEditor onSave={handleSave} saving={saving} authorName={authorName} />
    </div>
  );
}
