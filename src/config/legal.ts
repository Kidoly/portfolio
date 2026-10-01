/** Data shown on /mentions-legales and /confidentialite. */

export const CONTACT_EMAIL = 'alban.mary1@gmail.com';

/**
 * TODO(contenu) : hébergeur du site (mention obligatoire, LCEN art. 6) - nom, adresse et,
 * si possible, téléphone. Tant que null, la page affiche « à compléter ».
 * Ex. { name: 'OVH SAS', address: '2 rue Kellermann, 59100 Roubaix, France', phone: '1007' }
 */
export const HOSTING: { name: string; address: string; phone?: string } | null = null;

/** Date of the last edit of the legal texts (ISO). */
export const LEGAL_UPDATED_AT = '2026-10-01';
