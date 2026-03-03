import { NextRequest, NextResponse } from 'next/server';
import { markdownToHtml } from '@/lib/blog/markdown';
import { authGuard } from '@/lib/blog/api-auth';

// POST /api/admin/preview - render markdown to HTML
export async function POST(request: NextRequest) {
  const authError = await authGuard(request);
  if (authError) return authError;

  try {
    const { content } = await request.json();
    if (!content) {
      return NextResponse.json({ html: '' });
    }

    const html = await markdownToHtml(content);
    return NextResponse.json({ html });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to render markdown' }, { status: 500 });
  }
}
