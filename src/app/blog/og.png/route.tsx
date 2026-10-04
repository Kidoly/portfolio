import { ogResponse, OgTitleCard } from '@/lib/og';

/** Share card of the blog index. */
export const dynamic = 'force-static';

export function GET() {
  return ogResponse(<OgTitleCard category="Blog" title="Notes d’infra : virtualisation, conteneurs, réseau et sécurité" />);
}
