/**
 * Home page personal data and media. Anything left `null` is hidden on the
 * site: no hard-coded age, no striped placeholder in production.
 *
 * TODO(contenu) — textes à vérifier dans src/locales/{fr,en}.json (clé `portfolio`) :
 * - hero.pitch : « 4e année à l'EPSI Nantes » / « 4th-year » — à confirmer (possiblement 5e année).
 * - stats[2] : « 3 stages en entreprise » / « 3 internships » — la timeline (exp) montre
 *   2 stages (Troublanc, Kereis cybersécurité) + 1 CDD (Kereis webdesign).
 */

/** TODO(contenu) : date de naissance 'YYYY-MM-DD'. La ligne « Âge » du whoami est masquée tant que null. */
export const BIRTH_DATE: string | null = null;

/** TODO(contenu) : portrait, fichier dans public/ (ex. '/images/portrait.webp'). Emplacement masqué tant que null. */
export const PORTRAIT_SRC: string | null = null;

/** TODO(contenu) : captures des projets, fichiers dans public/, par `id` de projet (locales). Bloc image masqué tant que null. */
export const PROJECT_IMAGES: Record<string, string | null> = {
  monitorflow: null, // capture du dashboard MonitorFlow
  security: null, // extrait de rapport de pentest
  drone: null, // photo du drone
  astraso: null, // capture d'Astraso
};

/** Age in full years at `now`, or null when the birth date is not set. */
export function getAge(birthDate: string | null, now: Date = new Date()): number | null {
  if (!birthDate) return null;
  const birth = new Date(`${birthDate}T00:00:00Z`);
  if (Number.isNaN(birth.getTime())) return null;
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday =
    now.getUTCMonth() < birth.getUTCMonth() ||
    (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}
