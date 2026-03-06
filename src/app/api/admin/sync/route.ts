import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { syncFromWiki } from '@/lib/blog/wiki-sync';
import { authGuard } from '@/lib/blog/api-auth';

// POST /api/admin/sync - trigger wiki sync
export async function POST(request: NextRequest) {
  const authError = await authGuard(request);
  if (authError) return authError;

  try {
    const result = await syncFromWiki();

    revalidatePath('/blog');
    revalidatePath('/blog/[slug]', 'page');

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: `Sync failed: ${error}` },
      { status: 500 }
    );
  }
}
