import { NextRequest, NextResponse } from 'next/server';
import { authGuard } from '@/lib/blog/api-auth';
import { analyzeContentLocally, analyzeContentWithAI } from '@/lib/blog/auto-generate';

// POST /api/admin/generate - auto-generate metadata from content
export async function POST(request: NextRequest) {
  const authError = await authGuard(request);
  if (authError) return authError;

  try {
    const { content, title, locale, useAI } = await request.json();

    if (!content || !title) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    let result;
    if (useAI) {
      result = await analyzeContentWithAI(content, title, locale || 'fr');
    } else {
      result = analyzeContentLocally(content, title);
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: `Generation failed: ${error}` },
      { status: 500 }
    );
  }
}
