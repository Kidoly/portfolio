import { renderCard, svgResponse } from '@/lib/github-cards/cards';

/** Cards of the GitHub profile README: /github/<name>.svg (see lib/github-cards). */
export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ card: string }> }) {
  const { card } = await params;
  const svg = card.endsWith('.svg') ? renderCard(card.slice(0, -'.svg'.length)) : null;
  if (!svg) return new Response('Not found', { status: 404 });
  try {
    return svgResponse(await svg);
  } catch (error) {
    console.error(`GitHub cards: ${card}`, error);
    return new Response('Card unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
