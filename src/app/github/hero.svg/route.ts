import { heroCard, svgResponse } from '@/lib/github-cards/cards';
import { githubActivity } from '@/lib/github-cards/data';

/** Hero card of the GitHub profile README (live repo and contribution counts). */
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return svgResponse(await heroCard(await githubActivity()));
  } catch (error) {
    console.error('GitHub cards: hero', error);
    return new Response('GitHub data unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
