import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { syncFromWiki } from '@/lib/blog/wiki-sync';
import { authGuard, getRequestUser } from '@/lib/blog/api-auth';
import { adminLog } from '@/lib/blog/auth';

// POST /api/admin/sync - trigger wiki sync
export async function POST(request: NextRequest) {
  const authError = await authGuard(request);
  if (authError) return authError;

  try {
    const result = await syncFromWiki();

    revalidatePath('/blog');
    revalidatePath('/blog/[slug]', 'page');

    const user = await getRequestUser(request);
    adminLog('sync', user, {
      created: String(result.created ?? 0),
      updated: String(result.updated ?? 0),
      deleted: String(result.deleted ?? 0),
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: `Sync failed: ${error}` },
      { status: 500 }
    );
  }
}
