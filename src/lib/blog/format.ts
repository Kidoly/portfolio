/**
 * "3 mars 2026" / "3 March 2026": always with the year, in Paris time so the
 * server render and the client hydration print the same day.
 */
export function formatPostDate(iso: string, locale: 'fr' | 'en' = 'fr'): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  });
}
