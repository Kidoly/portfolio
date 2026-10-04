import { PORTRAIT_SRC } from '@/config/profile';

/** Schema.org data shared by several pages (JSON-LD). */

export const SITE_URL = 'https://albanmary.com';

/** JSON for a <script type="application/ld+json">, `<` escaped so no value can close the tag. */
export function jsonLd(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export const PERSON = {
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: 'Alban Mary',
  givenName: 'Alban',
  familyName: 'Mary',
  jobTitle: 'Ingénieur systèmes & réseaux',
  description: 'Ingénieur systèmes & réseaux en alternance chez Epsight, étudiant à l\'EPSI Nantes',
  url: `${SITE_URL}/`,
  ...(PORTRAIT_SRC && { image: `${SITE_URL}${PORTRAIT_SRC}` }),
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Nantes',
    addressRegion: 'Pays de la Loire',
    addressCountry: 'FR',
  },
  sameAs: [
    'https://www.linkedin.com/in/alban-mary/',
    'https://github.com/Kidoly',
  ],
  worksFor: {
    '@type': 'Organization',
    name: 'Epsight',
  },
  alumniOf: {
    '@type': 'EducationalOrganization',
    name: 'EPSI Nantes',
    url: 'https://www.epsi.fr/',
  },
  knowsAbout: [
    'Administration systèmes', 'Réseaux', 'Cybersécurité', 'Virtualisation', 'Linux', 'Windows Server',
    'Active Directory', 'Proxmox', 'Ceph', 'Docker', 'Kubernetes', 'Ansible', 'Terraform', 'DevOps',
    'Python', 'Rust', 'Bash', 'PowerShell',
  ],
  knowsLanguage: ['fr', 'en'],
};

export const WEBSITE = {
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  name: 'Alban Mary',
  alternateName: 'albanmary.com',
  url: `${SITE_URL}/`,
  description: 'Portfolio et blog d\'Alban Mary : administration systèmes & réseaux, homelab et cybersécurité',
  author: { '@id': `${SITE_URL}/#person` },
  inLanguage: ['fr', 'en'],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/blog/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};
