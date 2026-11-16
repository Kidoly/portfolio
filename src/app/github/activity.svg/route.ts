import { activityCard, svgResponse } from '@/lib/github-cards/cards';
import { githubActivity } from '@/lib/github-cards/data';

/** Streaks and contribution calendar of the GitHub profile README. */
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return svgResponse(await activityCard(await githubActivity()));
  } catch (error) {
    console.error('GitHub cards: activity', error);
    return new Response('GitHub data unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
