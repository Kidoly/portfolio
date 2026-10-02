import { ImageResponse } from 'next/og';
import { loadOgFonts, OG_SIZE, OgTitleCard } from '@/lib/og';

export const runtime = 'nodejs';
export const alt = 'Ingénieur Proxmox VE - Alban Mary';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <OgTitleCard category="Proxmox VE" title="Ingénieur Proxmox VE : cluster, Ceph, HA et Cloud-Init" url="albanmary.com/proxmox" />,
    { ...size, fonts: await loadOgFonts() }
  );
}
