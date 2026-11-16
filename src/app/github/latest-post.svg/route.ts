import { latestPostCard, svgResponse } from '@/lib/github-cards/cards';
import { latestPost } from '@/lib/github-cards/data';

/** Latest blog post card of the GitHub profile README. */
export const dynamic = 'force-dynamic';

export async function GET() {
  return svgResponse(await latestPostCard(latestPost()));
}
