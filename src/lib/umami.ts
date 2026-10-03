/**
 * Audience measurement with a self-hosted Umami: no cookie, no IP address stored, so no consent
 * banner (CNIL exemption for audience measurement). Off unless both variables are set, read at
 * request time so the Docker image needs no rebuild. The tracker and its beacon go through
 * /stats/ on the site's own origin (route handlers in src/app/stats), which keeps the CSP same-origin.
 */
export function umamiConfig(): { url: string; websiteId: string } | null {
  const url = process.env.UMAMI_URL?.trim().replace(/\/+$/, '');
  const websiteId = process.env.UMAMI_WEBSITE_ID?.trim();
  return url && websiteId ? { url, websiteId } : null;
}
