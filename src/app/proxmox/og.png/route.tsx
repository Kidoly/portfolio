import { ogResponse, OgTitleCard } from '@/lib/og';

/** Share card of the Proxmox page. */
export const dynamic = 'force-static';

export function GET() {
  return ogResponse(
    <OgTitleCard category="Proxmox VE" title="Ingénieur Proxmox VE : cluster, Ceph, HA et Cloud-Init" url="albanmary.com/proxmox" />
  );
}
