/**
 * "3 mars 2026" / "3 March 2026": always with the year, in Paris time so the
 * server render and the client hydration print the same day.
 */
export function formatPostDate(iso: string, locale: 'fr' | 'en' = 'fr'): string {
  if (!iso) return '';
  const date = new Date(iso).toLocaleDateString(locale === 'en' ? 'en-GB' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Paris',
  });
  // French ordinal for the first day of the month: « 1er octobre »
  return locale === 'fr' ? date.replace(/^1 /, '1er ') : date;
}
